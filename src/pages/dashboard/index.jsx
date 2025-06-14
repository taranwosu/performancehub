// src/pages/dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActions from '../../components/ui/QuickActions';
import Icon from '../../components/AppIcon';
import { Link } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseProvider';
import RecentActivity from './components/RecentActivity';
import GoalProgressChart from './components/GoalProgressChart';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import TeamPerformanceWidget from './components/TeamPerformanceWidget';

const Dashboard = () => {
  const { user, userProfile, fetchGoals, fetchDashboardStats, fetchRecentActivities } = useSupabase();
  const [userRole] = useState(userProfile?.role || 'employee');
  const [dashboardStats, setDashboardStats] = useState({
    performanceScore: 0,
    goalsCompleted: 0,
    totalGoals: 0,
    averageProgress: 0,
    feedbackRating: 0
  });
  const [personalGoals, setPersonalGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current user data derived from Supabase
  const currentUser = {
    name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : (user?.email || 'User'),
    role: userProfile?.position || 'Team Member',
    avatar: userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=6366f1&color=fff`,
    performanceScore: dashboardStats.performanceScore,
    goalsCompleted: dashboardStats.goalsCompleted,
    totalGoals: dashboardStats.totalGoals,
    feedbackRating: dashboardStats.feedbackRating,
    nextReviewDate: "2024-02-15" // This would come from performance_reviews table
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const stats = await fetchDashboardStats();
        setDashboardStats(stats);
        
        // Fetch user's goals
        const goals = await fetchGoals({ user_id: user?.id });
        setPersonalGoals(goals?.slice(0, 4) || []);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, fetchGoals, fetchDashboardStats]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10';
      case 'active':
        return 'text-primary bg-primary/10';
      case 'on_hold':
        return 'text-warning bg-warning/10';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'active':
        return 'TrendingUp';
      case 'on_hold':
        return 'AlertTriangle';
      default:
        return 'Circle';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-text-secondary">
              Here's your performance overview for this period
            </p>
          </div>

          <QuickActions />

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">
                    Performance Score
                  </p>
                  <p className="text-3xl font-bold text-text-primary">
                    {currentUser.performanceScore}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentUser.performanceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">
                    Goals Completed
                  </p>
                  <p className="text-3xl font-bold text-text-primary">
                    {currentUser.goalsCompleted}/{currentUser.totalGoals}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Target" size={24} className="text-success" />
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-2">
                {currentUser.totalGoals > 0 
                  ? Math.round((currentUser.goalsCompleted / currentUser.totalGoals) * 100)
                  : 0}% completion rate
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">
                    Feedback Rating
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-3xl font-bold text-text-primary">
                      {currentUser.feedbackRating}
                    </p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name="Star"
                          size={16}
                          className={star <= Math.floor(currentUser.feedbackRating) 
                            ? "text-warning fill-current" : "text-border"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="MessageSquare" size={24} className="text-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Goal Progress */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Goals Section */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">
                    Your Goals
                  </h2>
                  <Link
                    to="/goals-management"
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
                  >
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {personalGoals.length === 0 ? (
                    <div className="text-center py-8">
                      <Icon name="Target" size={48} className="mx-auto text-text-secondary mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">No goals yet</h3>
                      <p className="text-text-secondary mb-4">
                        Create your first goal to start tracking your performance
                      </p>
                      <Link
                        to="/goals-management"
                        className="btn-primary"
                      >
                        Create Goal
                      </Link>
                    </div>
                  ) : (
                    personalGoals.map((goal) => (
                      <div key={goal.id} className="border border-border rounded-lg p-4 hover:shadow-light transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Icon 
                              name={getStatusIcon(goal.status)} 
                              size={20} 
                              className={getStatusColor(goal.status).split(' ')[0]}
                            />
                            <div>
                              <h3 className="font-medium text-text-primary">{goal.title}</h3>
                              <p className="text-sm text-text-secondary">{goal.category || 'General'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                            {goal.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-text-secondary">Progress</span>
                            <span className="font-medium text-text-primary">{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                goal.status === 'completed' ? 'bg-success' :
                                goal.status === 'active' ? 'bg-primary' : 'bg-warning'
                              }`}
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Due: {new Date(goal.due_date).toLocaleDateString()}</span>
                          <Link
                            to="/goals-management"
                            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Goal Progress Chart */}
              <GoalProgressChart />

              {/* Team Performance Widget (for managers) */}
              {(userRole === 'manager' || userRole === 'hr' || userRole === 'executive') && <TeamPerformanceWidget />}

              {/* Recent Activity */}
              <RecentActivity />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions Panel */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/goals-management"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-background transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                      <Icon name="Plus" size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">Add Goal</p>
                      <p className="text-sm text-text-secondary">Create a new objective</p>
                    </div>
                  </Link>

                  <Link
                    to="/performance-reviews"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-background transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-200">
                      <Icon name="MessageSquare" size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">Request Feedback</p>
                      <p className="text-sm text-text-secondary">Get input from peers</p>
                    </div>
                  </Link>

                  <Link
                    to="/team-analytics"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-background transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors duration-200">
                      <Icon name="BarChart3" size={18} className="text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">View Reports</p>
                      <p className="text-sm text-text-secondary">Analyze performance</p>
                    </div>
                  </Link>

                  {(userRole === 'manager' || userRole === 'hr') && (
                    <Link
                      to="/okrs"
                      className="flex items-center space-x-3 p-3 rounded-md hover:bg-background transition-colors duration-200 group"
                    >
                      <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center group-hover:bg-warning/20 transition-colors duration-200">
                        <Icon name="Target" size={18} className="text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Manage OKRs</p>
                        <p className="text-sm text-text-secondary">Set objectives & key results</p>
                      </div>
                    </Link>
                  )}

                  {(userRole === 'manager' || userRole === 'hr') && (
                    <Link
                      to="/pips"
                      className="flex items-center space-x-3 p-3 rounded-md hover:bg-background transition-colors duration-200 group"
                    >
                      <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center group-hover:bg-error/20 transition-colors duration-200">
                        <Icon name="AlertTriangle" size={18} className="text-error" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">PIPs</p>
                        <p className="text-sm text-text-secondary">Performance improvement</p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <UpcomingDeadlines />

              {/* Next Review Card */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Upcoming Review
                </h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Calendar" size={24} className="text-warning" />
                  </div>
                  <p className="font-medium text-text-primary mb-2">
                    Performance Review
                  </p>
                  <p className="text-sm text-text-secondary mb-4">
                    {new Date(currentUser.nextReviewDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <Link
                    to="/performance-reviews"
                    className="btn-primary text-sm"
                  >
                    Prepare Review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;