import { supabase } from '../lib/supabaseClient';

class NotificationService {
  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }

  async loadTemplates() {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      data?.forEach(template => {
        this.templates.set(template.name, template);
      });
    } catch (error) {
      console.error('Error loading notification templates:', error);
    }
  }

  async queueEmail(templateName, toEmail, templateData = {}, priority = 5, scheduledAt = null) {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        console.error(`Template '${templateName}' not found`);
        return null;
      }

      const subject = this.replaceVariables(template.subject, templateData);
      const body = this.replaceVariables(template.template_body, templateData);

      const { data, error } = await supabase
        .from('email_queue')
        .insert({
          to_email: toEmail,
          subject,
          body_html: body,
          template_id: template.id,
          template_data: templateData,
          priority,
          scheduled_at: scheduledAt || new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error queueing email:', error);
      return null;
    }
  }

  replaceVariables(template, data) {
    let result = template;
    
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), data[key] || '');
    });

    return result;
  }

  async notifyGoalCreated(goal, assigneeEmail, assigneeName) {
    const templateData = {
      user_name: assigneeName,
      goal_title: goal.title,
      goal_description: goal.description || 'No description provided',
      due_date: new Date(goal.due_date).toLocaleDateString(),
      app_url: window.location.origin
    };

    return await this.queueEmail('goal_created', assigneeEmail, templateData, 7);
  }

  async notifyReviewReminder(review, revieweeEmail, revieweeName) {
    const templateData = {
      user_name: revieweeName,
      review_period: review.review_period || 'Current Period',
      due_date: new Date(review.due_date).toLocaleDateString(),
      reviewer_name: review.reviewer_name || 'Your Manager',
      app_url: window.location.origin
    };

    return await this.queueEmail('review_reminder', revieweeEmail, templateData, 9);
  }

  async sendWeeklyDigest(userEmail, userName, digestData) {
    const templateData = {
      user_name: userName,
      goals_completed: digestData.goalsCompleted || 0,
      reviews_submitted: digestData.reviewsSubmitted || 0,
      feedback_count: digestData.feedbackCount || 0,
      week_start: digestData.weekStart,
      week_end: digestData.weekEnd,
      app_url: window.location.origin
    };

    return await this.queueEmail('weekly_digest', userEmail, templateData, 3);
  }

  async sendWelcomeEmail(userEmail, userName, tempPassword) {
    const templateData = {
      user_name: userName,
      temp_password: tempPassword,
      app_url: window.location.origin,
      login_url: `${window.location.origin}/login`
    };

    return await this.queueEmail('user_welcome', userEmail, templateData, 8);
  }

  async processPendingNotifications() {
    try {
      const { data: pendingEmails, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const emailIds = pendingEmails?.map(email => email.id) || [];
      
      if (emailIds.length > 0) {
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .in('id', emailIds);

        if (updateError) throw updateError;

        console.log(`Processed ${emailIds.length} email notifications`);
      }

      return pendingEmails?.length || 0;
    } catch (error) {
      console.error('Error processing pending notifications:', error);
      return 0;
    }
  }

  async getNotificationStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('email_queue')
        .select('status, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        sent: data?.filter(email => email.status === 'sent').length || 0,
        pending: data?.filter(email => email.status === 'pending').length || 0,
        failed: data?.filter(email => email.status === 'failed').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, sent: 0, pending: 0, failed: 0 };
    }
  }

  async refreshTemplates() {
    this.templates.clear();
    await this.loadTemplates();
  }
}

export const notificationService = new NotificationService();
export default notificationService;
