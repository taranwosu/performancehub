import notificationService from './notificationService';
import { supabase } from '../lib/supabaseClient';

class NotificationScheduler {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.processingInterval = 60000; // 1 minute
  }

  start() {
    if (this.isRunning) {
      console.log('Notification scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting notification scheduler...');

    this.processNotifications();

    this.interval = setInterval(() => {
      this.processNotifications();
    }, this.processingInterval);
  }

  stop() {
    if (!this.isRunning) {
      console.log('Notification scheduler is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    console.log('Notification scheduler stopped');
  }

  async processNotifications() {
    if (!this.isRunning) return;

    try {
      console.log('Processing pending notifications...');
      
      const processedCount = await notificationService.processPendingNotifications();
      
      if (processedCount > 0) {
        console.log(`Processed ${processedCount} notifications`);
      }

      await this.checkGoalDeadlines();
      await this.checkReviewReminders();
      await this.checkWeeklyDigests();

    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }

  async checkGoalDeadlines() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

      const { data: upcomingGoals, error } = await supabase
        .from('goals')
        .select(`
          *,
          assignee:user_profiles!goals_user_id_fkey(id, first_name, last_name, email, notification_preferences)
        `)
        .in('status', ['active', 'in_progress'])
        .or(`due_date.eq.${threeDaysFromNow.toISOString().split('T')[0]},due_date.eq.${oneDayFromNow.toISOString().split('T')[0]}`);

      if (error) throw error;

      for (const goal of upcomingGoals || []) {
        if (!goal.assignee?.email) continue;

        const prefs = goal.assignee.notification_preferences || {};
        if (prefs.email_goal_deadline === false) continue;

        const dueDate = new Date(goal.due_date);
        const today = new Date();
        const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        const { data: existingReminder } = await supabase
          .from('email_queue')
          .select('id')
          .eq('to_email', goal.assignee.email)
          .like('subject', `%${goal.title}%`)
          .gte('created_at', new Date().toISOString().split('T')[0])
          .limit(1);

        if (existingReminder?.length > 0) continue;

        const templateData = {
          user_name: `${goal.assignee.first_name} ${goal.assignee.last_name}`,
          goal_title: goal.title,
          due_date: dueDate.toLocaleDateString(),
          days_remaining: daysRemaining,
          progress: goal.progress || 0,
          app_url: window.location.origin
        };

        await notificationService.queueEmail(
          'goal_deadline_reminder',
          goal.assignee.email,
          templateData,
          8
        );
      }
    } catch (error) {
      console.error('Error checking goal deadlines:', error);
    }
  }

  async checkReviewReminders() {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data: upcomingReviews, error } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          reviewee:user_profiles!performance_reviews_reviewee_id_fkey(id, first_name, last_name, email, notification_preferences)
        `)
        .in('status', ['pending', 'in_progress'])
        .or(`due_date.eq.${sevenDaysFromNow.toISOString().split('T')[0]},due_date.eq.${threeDaysFromNow.toISOString().split('T')[0]}`);

      if (error) throw error;

      for (const review of upcomingReviews || []) {
        if (!review.reviewee?.email) continue;

        const prefs = review.reviewee.notification_preferences || {};
        if (prefs.email_review_reminder === false) continue;

        const { data: existingReminder } = await supabase
          .from('email_queue')
          .select('id')
          .eq('to_email', review.reviewee.email)
          .like('subject', '%Review Reminder%')
          .gte('created_at', new Date().toISOString().split('T')[0])
          .limit(1);

        if (existingReminder?.length > 0) continue;

        await notificationService.notifyReviewReminder(
          review,
          review.reviewee.email,
          `${review.reviewee.first_name} ${review.reviewee.last_name}`
        );
      }
    } catch (error) {
      console.error('Error checking review reminders:', error);
    }
  }

  async checkWeeklyDigests() {
    try {
      const now = new Date();
      const isMonday = now.getDay() === 1;
      const isNinePM = now.getHours() === 9;

      if (!isMonday || !isNinePM) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: existingDigests } = await supabase
        .from('email_queue')
        .select('id')
        .like('subject', '%Weekly Performance Digest%')
        .gte('created_at', today)
        .limit(1);

      if (existingDigests?.length > 0) return;

      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, notification_preferences')
        .eq('is_active', true);

      if (error) throw error;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (const user of users || []) {
        const prefs = user.notification_preferences || {};
        if (prefs.email_weekly_digest === false) continue;

        const digestData = await this.getUserWeeklyStats(user.id, oneWeekAgo);

        await notificationService.sendWeeklyDigest(
          user.email,
          `${user.first_name} ${user.last_name}`,
          {
            ...digestData,
            weekStart: oneWeekAgo.toLocaleDateString(),
            weekEnd: new Date().toLocaleDateString()
          }
        );
      }
    } catch (error) {
      console.error('Error checking weekly digests:', error);
    }
  }

  async getUserWeeklyStats(userId, startDate) {
    try {
      const [goalsData, reviewsData, feedbackData] = await Promise.all([
        supabase
          .from('goals')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .gte('updated_at', startDate.toISOString()),

        supabase
          .from('performance_reviews')
          .select('id')
          .eq('reviewee_id', userId)
          .in('status', ['completed', 'submitted'])
          .gte('updated_at', startDate.toISOString()),

        supabase
          .from('feedback')
          .select('id')
          .eq('feedback_receiver_id', userId)
          .gte('created_at', startDate.toISOString())
      ]);

      return {
        goalsCompleted: goalsData.data?.length || 0,
        reviewsSubmitted: reviewsData.data?.length || 0,
        feedbackCount: feedbackData.data?.length || 0
      };
    } catch (error) {
      console.error('Error getting user weekly stats:', error);
      return {
        goalsCompleted: 0,
        reviewsSubmitted: 0,
        feedbackCount: 0
      };
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      processingInterval: this.processingInterval,
      nextProcessing: this.interval ? new Date(Date.now() + this.processingInterval) : null
    };
  }

  setInterval(milliseconds) {
    this.processingInterval = milliseconds;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

export const notificationScheduler = new NotificationScheduler();
export default notificationScheduler;

if (typeof window !== 'undefined') {
  setTimeout(() => {
    notificationScheduler.start();
  }, 5000);
}
