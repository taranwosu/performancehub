import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const UpcomingDeadlines = () => {
  const deadlines = [
    {
      id: 1,
      title: 'Complete Leadership Training',
      type: 'goal',
      dueDate: new Date('2024-01-30'),
      priority: 'high',
      progress: 90
    },
    {
      id: 2,
      title: 'Q4 Performance Review',
      type: 'review',
      dueDate: new Date('2024-02-15'),
      priority: 'medium',
      progress: null
    },
    {
      id: 3,
      title: 'Team Feedback Collection',
      type: 'feedback',
      dueDate: new Date('2024-02-20'),
      priority: 'medium',
      progress: 60
    },
    {
      id: 4,
      title: 'Implement New HR System',
      type: 'goal',
      dueDate: new Date('2024-03-15'),
      priority: 'high',
      progress: 45
    },
    {
      id: 5,
      title: 'Annual Goal Setting',
      type: 'planning',
      dueDate: new Date('2024-03-31'),
      priority: 'low',
      progress: null
    }
  ];

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-success bg-success/10';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'goal':
        return 'Target';
      case 'review':
        return 'FileText';
      case 'feedback':
        return 'MessageSquare';
      case 'planning':
        return 'Calendar';
      default:
        return 'Clock';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'goal':
        return 'text-primary';
      case 'review':
        return 'text-accent';
      case 'feedback':
        return 'text-success';
      case 'planning':
        return 'text-secondary';
      default:
        return 'text-text-secondary';
    }
  };

  const formatDueDate = (dueDate) => {
    const daysUntil = getDaysUntilDue(dueDate);
    
    if (daysUntil < 0) {
      return `${Math.abs(daysUntil)} days overdue`;
    } else if (daysUntil === 0) {
      return 'Due today';
    } else if (daysUntil === 1) {
      return 'Due tomorrow';
    } else if (daysUntil <= 7) {
      return `Due in ${daysUntil} days`;
    } else {
      return dueDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const sortedDeadlines = deadlines.sort((a, b) => a.dueDate - b.dueDate);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">
          Upcoming Deadlines
        </h3>
        <Link
          to="/goals-management"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {sortedDeadlines.slice(0, 5).map((deadline) => {
          const daysUntil = getDaysUntilDue(deadline.dueDate);
          const isOverdue = daysUntil < 0;
          const isUrgent = daysUntil <= 3 && daysUntil >= 0;

          return (
            <div 
              key={deadline.id} 
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-light ${
                isOverdue ? 'border-error/20 bg-error/5' : isUrgent ?'border-warning/20 bg-warning/5': 'border-border hover:border-primary/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isOverdue ? 'bg-error/10' : isUrgent ?'bg-warning/10': 'bg-primary/10'
                  }`}>
                    <Icon 
                      name={getTypeIcon(deadline.type)} 
                      size={16} 
                      className={`${
                        isOverdue ? 'text-error' : isUrgent ?'text-warning' :
                        getTypeColor(deadline.type)
                      }`}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary text-sm mb-1 truncate">
                      {deadline.title}
                    </h4>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs font-medium ${
                        isOverdue ? 'text-error' : isUrgent ?'text-warning': 'text-text-secondary'
                      }`}>
                        {formatDueDate(deadline.dueDate)}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority}
                      </span>
                    </div>
                    
                    {deadline.progress !== null && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-text-secondary">Progress</span>
                          <span className="font-medium text-text-primary">{deadline.progress}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              deadline.progress >= 80 ? 'bg-success' :
                              deadline.progress >= 50 ? 'bg-primary': 'bg-warning'
                            }`}
                            style={{ width: `${deadline.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button className="p-1 rounded-md hover:bg-background transition-colors duration-200 ml-2">
                  <Icon name="MoreVertical" size={14} className="text-text-secondary" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deadlines.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Calendar" size={32} className="mx-auto text-text-secondary mb-2" />
          <p className="text-sm text-text-secondary">No upcoming deadlines</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlines;