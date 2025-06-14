import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TeamPerformanceWidget = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Senior Developer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      performanceScore: 92,
      goalsCompleted: 8,
      totalGoals: 10,
      status: 'on-track',
      lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 2,
      name: 'Emily Chen',
      role: 'UX Designer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      performanceScore: 88,
      goalsCompleted: 6,
      totalGoals: 8,
      status: 'on-track',
      lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      role: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      performanceScore: 76,
      goalsCompleted: 5,
      totalGoals: 9,
      status: 'at-risk',
      lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      role: 'Marketing Specialist',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      performanceScore: 94,
      goalsCompleted: 7,
      totalGoals: 7,
      status: 'excellent',
      lastUpdate: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    }
  ];

  const pendingActions = [
    {
      id: 1,
      type: 'review_due',
      employeeName: 'John Smith',
      action: 'Performance review due',
      dueDate: new Date('2024-02-10'),
      priority: 'high'
    },
    {
      id: 2,
      type: 'feedback_request',
      employeeName: 'Emily Chen',
      action: 'Feedback request pending',
      dueDate: new Date('2024-02-08'),
      priority: 'medium'
    },
    {
      id: 3,
      type: 'goal_approval',
      employeeName: 'Michael Rodriguez',
      action: 'Goal approval needed',
      dueDate: new Date('2024-02-12'),
      priority: 'medium'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-success bg-success/10';
      case 'on-track':
        return 'text-primary bg-primary/10';
      case 'at-risk':
        return 'text-warning bg-warning/10';
      case 'needs-attention':
        return 'text-error bg-error/10';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return 'TrendingUp';
      case 'on-track':
        return 'CheckCircle';
      case 'at-risk':
        return 'AlertTriangle';
      case 'needs-attention':
        return 'AlertCircle';
      default:
        return 'Circle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-text-secondary';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Team Performance
        </h2>
        <Link
          to="/team-analytics"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
        >
          View Details
        </Link>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-background rounded-lg">
          <p className="text-2xl font-bold text-text-primary">
            {teamMembers.length}
          </p>
          <p className="text-sm text-text-secondary">Team Members</p>
        </div>
        <div className="text-center p-4 bg-background rounded-lg">
          <p className="text-2xl font-bold text-success">
            {Math.round(teamMembers.reduce((acc, member) => acc + member.performanceScore, 0) / teamMembers.length)}%
          </p>
          <p className="text-sm text-text-secondary">Avg Performance</p>
        </div>
        <div className="text-center p-4 bg-background rounded-lg">
          <p className="text-2xl font-bold text-primary">
            {pendingActions.length}
          </p>
          <p className="text-sm text-text-secondary">Pending Actions</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium text-text-primary">Direct Reports</h3>
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-light transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <Image
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium text-text-primary">{member.name}</h4>
                <p className="text-sm text-text-secondary">{member.role}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">
                  {member.goalsCompleted}/{member.totalGoals} goals
                </p>
                <p className="text-xs text-text-secondary">
                  {formatTimeAgo(member.lastUpdate)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-primary">
                  {member.performanceScore}%
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  <Icon name={getStatusIcon(member.status)} size={12} className="inline mr-1" />
                  {member.status.replace('-', ' ')}
                </span>
              </div>
              
              <Link
                to="/employee-profile"
                className="p-2 rounded-md hover:bg-background transition-colors duration-200"
              >
                <Icon name="ExternalLink" size={14} className="text-text-secondary" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-4">Pending Actions</h3>
        <div className="space-y-3">
          {pendingActions.map((action) => (
            <div key={action.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon 
                  name="Clock" 
                  size={16} 
                  className={getPriorityColor(action.priority)}
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {action.action}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {action.employeeName} • Due {action.dueDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  action.priority === 'high' ? 'bg-error' :
                  action.priority === 'medium'? 'bg-warning' : 'bg-success'
                }`}></span>
                <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200">
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceWidget;