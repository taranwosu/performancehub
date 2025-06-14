// src/pages/employee-profile/components/OverviewTab.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const OverviewTab = ({ employee, currentUser }) => {
  // Mock data for performance timeline
  const performanceTimeline = [
    {
      id: 1,
      date: '2024-01-15',
      title: 'Q4 2023 Performance Review',
      type: 'review',
      score: 92,
      description: 'Exceeded expectations in leadership and technical delivery'
    },
    {
      id: 2,
      date: '2023-12-01',
      title: 'Project Alpha Launch',
      type: 'milestone',
      description: 'Successfully launched new customer portal ahead of schedule'
    },
    {
      id: 3,
      date: '2023-10-15',
      title: 'Team Leadership Award',
      type: 'achievement',
      description: 'Recognized for outstanding mentorship and team building'
    },
    {
      id: 4,
      date: '2023-09-01',
      title: 'Mid-Year Review',
      type: 'review',
      score: 88,
      description: 'Strong performance with areas for growth in stakeholder communication'
    }
  ];

  // Mock recent achievements
  const recentAchievements = [
    {
      id: 1,
      title: 'Led Cross-functional Project',
      description: 'Successfully managed a team of 8 across 3 departments',
      date: '2024-01-10',
      icon: 'Users'
    },
    {
      id: 2,
      title: 'Code Quality Improvement',
      description: 'Reduced bug reports by 35% through improved testing practices',
      date: '2023-12-20',
      icon: 'Code'
    },
    {
      id: 3,
      title: 'Mentorship Program',
      description: 'Mentored 3 junior developers, all received promotions',
      date: '2023-11-15',
      icon: 'GraduationCap'
    }
  ];

  // Mock current objectives
  const currentObjectives = [
    {
      id: 1,
      title: 'Implement Microservices Architecture',
      progress: 75,
      dueDate: '2024-03-31',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Complete AWS Certification',
      progress: 60,
      dueDate: '2024-02-28',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Team Knowledge Sharing Sessions',
      progress: 90,
      dueDate: '2024-01-31',
      priority: 'low'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'review':
        return 'FileText';
      case 'milestone':
        return 'Flag';
      case 'achievement':
        return 'Award';
      default:
        return 'Circle';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'review':
        return 'text-primary bg-primary/10';
      case 'milestone':
        return 'text-success bg-success/10';
      case 'achievement':
        return 'text-warning bg-warning/10';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-error';
      case 'medium':
        return 'border-warning';
      case 'low':
        return 'border-success';
      default:
        return 'border-border';
    }
  };

  return (
    <div className="space-y-8">
      {/* Performance Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Timeline</h3>
        <div className="space-y-4">
          {performanceTimeline?.map((item, index) => (
            <div key={item.id} className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(item.type)}`}>
                <Icon name={getTypeIcon(item.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-text-primary">{item.title}</h4>
                  <span className="text-sm text-text-secondary">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                {item.score && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm font-medium text-text-primary">Score:</span>
                    <span className="text-sm font-bold text-primary">{item.score}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements and Current Objectives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Achievements */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {recentAchievements?.map((achievement) => (
              <div key={achievement.id} className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name={achievement.icon} size={16} className="text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary">{achievement.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{achievement.description}</p>
                    <span className="text-xs text-text-secondary">
                      {new Date(achievement.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Objectives */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Current Objectives</h3>
          <div className="space-y-3">
            {currentObjectives?.map((objective) => (
              <div key={objective.id} className={`p-4 bg-background rounded-lg border-l-4 ${getPriorityColor(objective.priority)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-text-primary">{objective.title}</h4>
                  <span className="text-sm text-text-secondary">{objective.progress}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${objective.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span className={`px-2 py-1 rounded ${
                    objective.priority === 'high' ? 'bg-error/10 text-error' :
                    objective.priority === 'medium'? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>
                    {objective.priority} priority
                  </span>
                  <span>Due: {new Date(objective.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;