// src/context/SupabaseProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { notificationService } from '../services/notificationService';

const SupabaseContext = createContext({});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const useAuth = () => {
  const { user, signIn, signUp, signOut, loading } = useSupabase();
  return { user, signIn, signUp, signOut, loading };
};

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      setUserProfile(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Goals management functions
  const createGoal = async (goalData) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user?.id
        })
        .select(`
          *,
          goal_metrics(*),
          assignee:user_profiles!goals_user_id_fkey(id, first_name, last_name, avatar_url, email),
          manager:user_profiles!goals_manager_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity('goal_created', 'goal', data.id, { title: data.title });
      
      // Send notification email to assignee if different from creator
      if (data.assignee && data.assignee.email && data.assignee.email !== user?.email) {
        try {
          await notificationService.notifyGoalCreated(
            data,
            data.assignee.email,
            `${data.assignee.first_name} ${data.assignee.last_name}`
          );
        } catch (notificationError) {
          console.error('Error sending goal creation notification:', notificationError);
          // Don't fail the goal creation if notification fails
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  };

  const updateGoal = async (goalId, updates) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .select(`
          *,
          goal_metrics(*),
          assignee:user_profiles!goals_user_id_fkey(id, first_name, last_name, avatar_url),
          manager:user_profiles!goals_manager_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity('goal_updated', 'goal', goalId, updates);
      
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const fetchGoals = async (filters = {}) => {
    try {
      let query = supabase
        .from('goals')
        .select(`
          *,
          goal_metrics(*),
          assignee:user_profiles!goals_user_id_fkey(id, first_name, last_name, avatar_url),
          manager:user_profiles!goals_manager_id_fkey(id, first_name, last_name, avatar_url)
        `);
      
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.department && filters.department !== 'all') {
        query = query.eq('department', filters.department);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.goalType && filters.goalType !== 'all') {
        query = query.eq('goal_type', filters.goalType);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
      
      // Log activity
      await logActivity('goal_deleted', 'goal', goalId);
      
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  // Performance reviews functions
  const createPerformanceReview = async (reviewData) => {
    try {
      const { data, error } = await supabase
        .from('performance_reviews')
        .insert(reviewData)
        .select(`
          *,
          reviewee:user_profiles!performance_reviews_reviewee_id_fkey(id, first_name, last_name, avatar_url),
          reviewer:user_profiles!performance_reviews_reviewer_id_fkey(id, first_name, last_name, avatar_url),
          performance_cycle:performance_cycles(*)
        `)
        .single();
      
      if (error) throw error;
      
      await logActivity('review_created', 'performance_review', data.id, { title: data.title });
      
      return data;
    } catch (error) {
      console.error('Error creating performance review:', error);
      throw error;
    }
  };

  const updatePerformanceReview = async (reviewId, updates) => {
    try {
      const { data, error } = await supabase
        .from('performance_reviews')
        .update(updates)
        .eq('id', reviewId)
        .select(`
          *,
          reviewee:user_profiles!performance_reviews_reviewee_id_fkey(id, first_name, last_name, avatar_url),
          reviewer:user_profiles!performance_reviews_reviewer_id_fkey(id, first_name, last_name, avatar_url),
          performance_cycle:performance_cycles(*)
        `)
        .single();
      
      if (error) throw error;
      
      await logActivity('review_updated', 'performance_review', reviewId, updates);
      
      return data;
    } catch (error) {
      console.error('Error updating performance review:', error);
      throw error;
    }
  };

  const fetchPerformanceReviews = async (filters = {}) => {
    try {
      let query = supabase
        .from('performance_reviews')
        .select(`
          *,
          reviewee:user_profiles!performance_reviews_reviewee_id_fkey(id, first_name, last_name, avatar_url),
          reviewer:user_profiles!performance_reviews_reviewer_id_fkey(id, first_name, last_name, avatar_url),
          performance_cycle:performance_cycles(*)
        `);
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.reviewType && filters.reviewType !== 'all') {
        query = query.eq('review_type', filters.reviewType);
      }
      if (filters.period && filters.period !== 'all') {
        // Add date filtering logic based on period
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
      throw error;
    }
  };

  // Feedback functions
  const createFeedback = async (feedbackData) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          ...feedbackData,
          feedback_giver_id: user?.id
        })
        .select(`
          *,
          feedback_giver:user_profiles!feedback_feedback_giver_id_fkey(id, first_name, last_name, avatar_url),
          feedback_receiver:user_profiles!feedback_feedback_receiver_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      await logActivity('feedback_given', 'feedback', data.id, { type: data.feedback_type });
      
      return data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  };

  const fetchFeedback = async (filters = {}) => {
    try {
      let query = supabase
        .from('feedback')
        .select(`
          *,
          feedback_giver:user_profiles!feedback_feedback_giver_id_fkey(id, first_name, last_name, avatar_url),
          feedback_receiver:user_profiles!feedback_feedback_receiver_id_fkey(id, first_name, last_name, avatar_url)
        `);
      
      if (filters.receiver_id) {
        query = query.eq('feedback_receiver_id', filters.receiver_id);
      }
      if (filters.giver_id) {
        query = query.eq('feedback_giver_id', filters.giver_id);
      }
      if (filters.feedback_type && filters.feedback_type !== 'all') {
        query = query.eq('feedback_type', filters.feedback_type);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  };

  // PIPs functions
  const createPIP = async (pipData) => {
    try {
      const { data, error } = await supabase
        .from('pips')
        .insert(pipData)
        .select(`
          *,
          employee:user_profiles!pips_employee_id_fkey(id, first_name, last_name, avatar_url),
          manager:user_profiles!pips_manager_id_fkey(id, first_name, last_name, avatar_url),
          hr:user_profiles!pips_hr_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      await logActivity('pip_created', 'pip', data.id, { title: data.title });
      
      return data;
    } catch (error) {
      console.error('Error creating PIP:', error);
      throw error;
    }
  };

  const fetchPIPs = async (filters = {}) => {
    try {
      let query = supabase
        .from('pips')
        .select(`
          *,
          employee:user_profiles!pips_employee_id_fkey(id, first_name, last_name, avatar_url),
          manager:user_profiles!pips_manager_id_fkey(id, first_name, last_name, avatar_url),
          hr:user_profiles!pips_hr_id_fkey(id, first_name, last_name, avatar_url)
        `);
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching PIPs:', error);
      throw error;
    }
  };

  // Teams functions
  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          manager:user_profiles!teams_manager_id_fkey(id, first_name, last_name, avatar_url),
          team_members(
            *,
            user:user_profiles(id, first_name, last_name, avatar_url, position)
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  };

  // Activity logging
  const logActivity = async (action, entityType, entityId = null, details = null) => {
    try {
      await supabase.rpc('log_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_details: details
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_profiles(first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const [goalsResult, reviewsResult, feedbackResult] = await Promise.all([
        supabase
          .from('goals')
          .select('status, progress')
          .eq('user_id', user?.id),
        supabase
          .from('performance_reviews')
          .select('status, overall_rating')
          .eq('reviewee_id', user?.id),
        supabase
          .from('feedback')
          .select('rating')
          .eq('feedback_receiver_id', user?.id)
      ]);

      const goals = goalsResult.data || [];
      const reviews = reviewsResult.data || [];
      const feedback = feedbackResult.data || [];

      const stats = {
        performanceScore: reviews.length > 0 
          ? Math.round((reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length) * 20)
          : 0,
        goalsCompleted: goals.filter(g => g.status === 'completed').length,
        totalGoals: goals.length,
        averageProgress: goals.length > 0 
          ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
          : 0,
        feedbackRating: feedback.length > 0
          ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        performanceScore: 0,
        goalsCompleted: 0,
        totalGoals: 0,
        averageProgress: 0,
        feedbackRating: 0
      };
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async (filters = {}) => {
    try {
      const { data, error } = await supabase.rpc('get_performance_analytics', {
        date_range: filters.dateRange || 'last-quarter',
        departments: filters.departments || ['all'],
        teams: filters.teams || ['all']
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return null;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    // Goals
    createGoal,
    updateGoal,
    fetchGoals,
    deleteGoal,
    // Performance Reviews
    createPerformanceReview,
    updatePerformanceReview,
    fetchPerformanceReviews,
    // Feedback
    createFeedback,
    fetchFeedback,
    // PIPs
    createPIP,
    fetchPIPs,
    // Teams
    fetchTeams,
    // Activities
    logActivity,
    fetchRecentActivities,
    // Dashboard
    fetchDashboardStats,
    // Analytics
    fetchAnalyticsData,
    // Direct supabase access for complex queries
    supabase
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export default SupabaseProvider;