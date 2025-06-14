// src/pages/employee-profile/components/GoalsTab.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const GoalsTab = ({ employee, currentUser }) => {
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, progress, priority

  // Mock goals data
  const goals = [
    {
      id: 1,
      title: 'Implement Microservices Architecture',
      description: 'Break down monolithic application into microservices to improve scalability and maintainability',
      status: 'in-progress',
      progress: 75,
      priority: 'high',
      dueDate: '2024-03-31',
      category: 'Technical',
      milestones: [
        { id: 1, title: 'Service Discovery Implementation', completed: true },
        { id: 2, title: 'Database Migration Strategy', completed: true },
        { id: 3, title: 'API Gateway Setup', completed: false },
        { id: 4, title: 'Load Testing', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Complete AWS Solutions Architect Certification',
      description: 'Obtain AWS certification to enhance cloud architecture skills',
      status: 'in-progress',
      progress: 60,
      priority: 'medium',
      dueDate: '2024-02-28',
      category: 'Learning',
      milestones: [
        { id: 1, title: 'Complete Study Materials', completed: true },
        { id: 2, title: 'Practice Exams (3/5)', completed: false },
        { id: 3, title: 'Schedule Exam', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Mentor Junior Developers',
      description: 'Provide guidance and support to 2 junior team members',
      status: 'completed',
      progress: 100,
      priority: 'medium',
      dueDate: '2023-12-31',
      category: 'Leadership',
      milestones: [
        { id: 1, title: 'Create Mentorship Plan', completed: true },
        { id: 2, title: 'Weekly Check-ins', completed: true },
        { id: 3, title: 'Final Assessment', completed: true }
      ]
    },
    {
      id: 4,
      title: 'Improve Code Review Process',
      description: 'Establish better practices for code reviews to improve quality',
      status: 'on-hold',
      progress: 25,
      priority: 'low',
      dueDate: '2024-04-15',
      category: 'Process',
      milestones: [
        { id: 1, title: 'Analyze Current Process', completed: true },
        { id: 2, title: 'Define New Guidelines', completed: false },
        { id: 3, title: 'Team Training', completed: false }
      ]
    }
  ];

  const canManageGoals = currentUser?.role === 'manager' || currentUser?.id === employee?.id;

  const filteredGoals = goals?.filter(goal => {
    if (filter === 'active') return goal.status === 'in-progress';
    if (filter === 'completed') return goal.status === 'completed';
    return true;
  });

  const sortedGoals = [...filteredGoals]?.sort((a, b) => {
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === 'progress') return b.progress - a.progress;
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border-success';
      case 'in-progress':
        return 'text-primary bg-primary/10 border-primary';
      case 'on-hold':
        return 'text-warning bg-warning/10 border-warning';
      default:
        return 'text-text-secondary bg-background border-border';
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

  const getCompletedMilestones = (milestones) => {
    return milestones?.filter(m => m.completed)?.length || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-wrap items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-border rounded px-3 py-1 text-sm bg-surface"
            >
              <option value="all">All Goals</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border rounded px-3 py-1 text-sm bg-surface"
            >
              <option value="dueDate">Due Date</option>
              <option value="progress">Progress</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
        
        {canManageGoals && (
          <button className="btn-primary text-sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Add Goal
          </button>
        )}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {sortedGoals?.map((goal) => (
          <div key={goal.id} className="border border-border rounded-lg p-6 hover:shadow-light transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">{goal.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('-', ' ')}
                  </span>
                  <Icon 
                    name="Flag" 
                    size={14} 
                    className={getPriorityColor(goal.priority)}
                    title={`${goal.priority} priority`}
                  />
                </div>
                <p className="text-text-secondary mb-3">{goal.description}</p>
                
                {/* Goal Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={14} />
                    <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Tag" size={14} />
                    <span>{goal.category}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="CheckCircle" size={14} />
                    <span>{getCompletedMilestones(goal.milestones)}/{goal.milestones?.length} milestones</span>
                  </div>
                </div>
              </div>
              
              {canManageGoals && (
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded transition-colors duration-200">
                    <Icon name="Edit" size={16} />
                  </button>
                  <button className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded transition-colors duration-200">
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Progress</span>
                <span className="text-sm text-text-secondary">{goal.progress}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    goal.status === 'completed' ? 'bg-success' :
                    goal.status === 'in-progress' ? 'bg-primary' : 'bg-warning'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
            
            {/* Milestones */}
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-3">Milestones</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {goal.milestones?.map((milestone) => (
                  <div key={milestone.id} className="flex items-center space-x-2">
                    <Icon 
                      name={milestone.completed ? "CheckCircle" : "Circle"} 
                      size={14} 
                      className={milestone.completed ? "text-success" : "text-text-secondary"}
                    />
                    <span className={`text-sm ${
                      milestone.completed ? 'text-text-primary line-through' : 'text-text-secondary'
                    }`}>
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {sortedGoals?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Target" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No goals found</h3>
          <p className="text-text-secondary mb-4">No goals match the current filter criteria.</p>
          {canManageGoals && (
            <button className="btn-primary">
              <Icon name="Plus" size={16} className="mr-2" />
              Create First Goal
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalsTab;