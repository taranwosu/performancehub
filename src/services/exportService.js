import { supabase } from '../lib/supabaseClient';

class ExportService {
  constructor() {
    this.exportFormats = ['excel', 'csv', 'json'];
  }

  async exportUsers(format = 'excel', filters = {}) {
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          department,
          position,
          phone,
          location,
          hire_date,
          is_active,
          created_at,
          updated_at,
          manager:user_profiles!user_profiles_manager_id_fkey(first_name, last_name)
        `);

      if (filters.department && filters.department !== 'all') {
        query = query.eq('department', filters.department);
      }
      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('is_active', filters.status === 'active');
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const exportData = data.map(user => ({
        'User ID': user.id,
        'Email': user.email,
        'First Name': user.first_name,
        'Last Name': user.last_name,
        'Full Name': `${user.first_name} ${user.last_name}`,
        'Role': user.role,
        'Department': user.department || 'Not assigned',
        'Position': user.position || 'Not assigned',
        'Phone': user.phone || '',
        'Location': user.location || '',
        'Manager': user.manager ? `${user.manager.first_name} ${user.manager.last_name}` : 'None',
        'Hire Date': user.hire_date ? new Date(user.hire_date).toLocaleDateString() : '',
        'Status': user.is_active ? 'Active' : 'Inactive',
        'Created Date': new Date(user.created_at).toLocaleDateString(),
        'Last Updated': new Date(user.updated_at).toLocaleDateString()
      }));

      return this.formatExportData(exportData, format, 'users');
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }

  async exportGoals(format = 'excel', filters = {}) {
    try {
      let query = supabase
        .from('goals')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          goal_type,
          progress,
          due_date,
          created_at,
          updated_at,
          assignee:user_profiles!goals_user_id_fkey(first_name, last_name, email, department),
          manager:user_profiles!goals_manager_id_fkey(first_name, last_name, email)
        `);

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const exportData = data.map(goal => ({
        'Goal ID': goal.id,
        'Title': goal.title,
        'Description': goal.description || '',
        'Status': goal.status,
        'Priority': goal.priority,
        'Type': goal.goal_type,
        'Progress (%)': goal.progress || 0,
        'Assignee': goal.assignee ? `${goal.assignee.first_name} ${goal.assignee.last_name}` : 'Unassigned',
        'Assignee Email': goal.assignee?.email || '',
        'Department': goal.assignee?.department || '',
        'Manager': goal.manager ? `${goal.manager.first_name} ${goal.manager.last_name}` : 'None',
        'Due Date': goal.due_date ? new Date(goal.due_date).toLocaleDateString() : '',
        'Created Date': new Date(goal.created_at).toLocaleDateString(),
        'Last Updated': new Date(goal.updated_at).toLocaleDateString()
      }));

      return this.formatExportData(exportData, format, 'goals');
    } catch (error) {
      console.error('Error exporting goals:', error);
      throw error;
    }
  }

  async exportPerformanceReviews(format = 'excel', filters = {}) {
    try {
      let query = supabase
        .from('performance_reviews')
        .select(`
          id,
          title,
          review_type,
          status,
          review_period,
          overall_rating,
          strengths,
          areas_for_improvement,
          goals_for_next_period,
          created_at,
          updated_at,
          reviewee:user_profiles!performance_reviews_reviewee_id_fkey(first_name, last_name, email, department),
          reviewer:user_profiles!performance_reviews_reviewer_id_fkey(first_name, last_name, email)
        `);

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.reviewType && filters.reviewType !== 'all') {
        query = query.eq('review_type', filters.reviewType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const exportData = data.map(review => ({
        'Review ID': review.id,
        'Title': review.title,
        'Type': review.review_type,
        'Status': review.status,
        'Period': review.review_period || '',
        'Overall Rating': review.overall_rating || 'Not rated',
        'Reviewee': review.reviewee ? `${review.reviewee.first_name} ${review.reviewee.last_name}` : '',
        'Reviewee Email': review.reviewee?.email || '',
        'Department': review.reviewee?.department || '',
        'Reviewer': review.reviewer ? `${review.reviewer.first_name} ${review.reviewer.last_name}` : '',
        'Strengths': review.strengths || '',
        'Areas for Improvement': review.areas_for_improvement || '',
        'Goals for Next Period': review.goals_for_next_period || '',
        'Created Date': new Date(review.created_at).toLocaleDateString(),
        'Last Updated': new Date(review.updated_at).toLocaleDateString()
      }));

      return this.formatExportData(exportData, format, 'performance_reviews');
    } catch (error) {
      console.error('Error exporting performance reviews:', error);
      throw error;
    }
  }

  async exportAnalytics(format = 'excel', dateRange = {}) {
    try {
      const startDate = dateRange.start || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = dateRange.end || new Date().toISOString();

      const [usersData, goalsData, reviewsData] = await Promise.all([
        this.getAnalyticsUsers(startDate, endDate),
        this.getAnalyticsGoals(startDate, endDate),
        this.getAnalyticsReviews(startDate, endDate)
      ]);

      const exportData = [
        { 'Metric': 'Total Active Users', 'Value': usersData.activeUsers, 'Category': 'Users' },
        { 'Metric': 'New Users (Period)', 'Value': usersData.newUsers, 'Category': 'Users' },
        { 'Metric': 'Total Goals', 'Value': goalsData.totalGoals, 'Category': 'Goals' },
        { 'Metric': 'Completed Goals', 'Value': goalsData.completedGoals, 'Category': 'Goals' },
        { 'Metric': 'Goals Completion Rate (%)', 'Value': goalsData.completionRate, 'Category': 'Goals' },
        { 'Metric': 'Average Goal Progress (%)', 'Value': goalsData.averageProgress, 'Category': 'Goals' },
        { 'Metric': 'Total Reviews', 'Value': reviewsData.totalReviews, 'Category': 'Reviews' },
        { 'Metric': 'Completed Reviews', 'Value': reviewsData.completedReviews, 'Category': 'Reviews' },
        { 'Metric': 'Average Review Rating', 'Value': reviewsData.averageRating, 'Category': 'Reviews' },
        { 'Metric': 'Report Period Start', 'Value': new Date(startDate).toLocaleDateString(), 'Category': 'Report Info' },
        { 'Metric': 'Report Period End', 'Value': new Date(endDate).toLocaleDateString(), 'Category': 'Report Info' },
        { 'Metric': 'Report Generated', 'Value': new Date().toLocaleString(), 'Category': 'Report Info' }
      ];

      return this.formatExportData(exportData, format, 'analytics');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  async getAnalyticsUsers(startDate, endDate) {
    const [activeUsersResult, newUsersResult] = await Promise.all([
      supabase.from('user_profiles').select('id').eq('is_active', true),
      supabase.from('user_profiles').select('id').gte('created_at', startDate).lte('created_at', endDate)
    ]);

    return {
      activeUsers: activeUsersResult.data?.length || 0,
      newUsers: newUsersResult.data?.length || 0
    };
  }

  async getAnalyticsGoals(startDate, endDate) {
    const [totalResult, completedResult] = await Promise.all([
      supabase.from('goals').select('id, progress').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('goals').select('id').eq('status', 'completed').gte('created_at', startDate).lte('created_at', endDate)
    ]);

    const totalGoals = totalResult.data?.length || 0;
    const completedGoals = completedResult.data?.length || 0;
    const averageProgress = totalGoals > 0 
      ? Math.round(totalResult.data.reduce((sum, goal) => sum + (goal.progress || 0), 0) / totalGoals)
      : 0;

    return {
      totalGoals,
      completedGoals,
      completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      averageProgress
    };
  }

  async getAnalyticsReviews(startDate, endDate) {
    const [totalResult, completedResult] = await Promise.all([
      supabase.from('performance_reviews').select('id, overall_rating').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('performance_reviews').select('id').eq('status', 'completed').gte('created_at', startDate).lte('created_at', endDate)
    ]);

    const totalReviews = totalResult.data?.length || 0;
    const completedReviews = completedResult.data?.length || 0;
    const ratingsData = totalResult.data?.filter(r => r.overall_rating) || [];
    const averageRating = ratingsData.length > 0
      ? (ratingsData.reduce((sum, review) => sum + review.overall_rating, 0) / ratingsData.length).toFixed(1)
      : 0;

    return {
      totalReviews,
      completedReviews,
      averageRating
    };
  }

  formatExportData(data, format, filename) {
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}`;

    switch (format.toLowerCase()) {
      case 'csv':
        return {
          data: this.convertToCSV(data),
          filename: `${fullFilename}.csv`,
          mimeType: 'text/csv'
        };
      case 'json':
        return {
          data: JSON.stringify(data, null, 2),
          filename: `${fullFilename}.json`,
          mimeType: 'application/json'
        };
      case 'excel':
      default:
        return {
          data: this.convertToCSV(data),
          filename: `${fullFilename}.csv`,
          mimeType: 'text/csv'
        };
    }
  }

  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  downloadFile(exportResult) {
    const blob = new Blob([exportResult.data], { type: exportResult.mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportResult.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  getAvailableFormats() {
    return this.exportFormats;
  }
}

export const exportService = new ExportService();
export default exportService;
