import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'goal_completed',
      title: 'Goal Completed',
      description: 'You completed "Reduce Employee Turnover" goal',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: 'CheckCircle',
      iconColor: 'text-success',
      iconBg: 'bg-success/10'
    },
    {
      id: 2,
      type: 'feedback_received',
      title: 'Feedback Received',
      description: 'John Smith provided feedback on your leadership skills',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      icon: 'MessageSquare',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      type: 'goal_updated',
      title: 'Goal Progress Updated',
      description: 'Progress on "Implement New HR System" updated to 45%',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      icon: 'TrendingUp',
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10'
    },
    {
      id: 4,
      type: 'review_scheduled',
      title: 'Review Scheduled',
      description: 'Performance review scheduled for February 15, 2024',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: 'Calendar',
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10'
    },
    {
      id: 5,
      type: 'milestone_achieved',
      title: 'Milestone Achieved',
      description: 'Reached 75% completion on "Increase Team Productivity"',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      icon: 'Award',
      iconColor: 'text-success',
      iconBg: 'bg-success/10'
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Recent Activity
        </h2>
        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-background transition-colors duration-200">
            <div className="flex-shrink-0">
              {activity.avatar ? (
                <Image
                  src={activity.avatar}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.iconBg}`}>
                  <Icon name={activity.icon} size={18} className={activity.iconColor} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-primary">
                  {activity.title}
                </h3>
                <span className="text-xs text-text-secondary flex-shrink-0">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="mt-6 text-center">
        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200">
          Load More Activities
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;