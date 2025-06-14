// src/pages/goals-management/components/GoalCard.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useSupabase } from '../../../context/SupabaseProvider';

const GoalCard = ({ 
  goal, 
  isSelected, 
  onSelect, 
  onBulkSelect, 
  onDelete, 
  getStatusColor, 
  getStatusBadgeColor 
}) => {
  const { updateGoal, user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleProgressUpdate = async (newProgress) => {
    try {
      setLoading(true);
      await updateGoal(goal.id, { progress: newProgress });
    } catch (error) {
      console.error('Error updating goal progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      const updates = { status: newStatus };
      if (newStatus === 'completed') {
        updates.progress = 100;
        updates.completion_date = new Date().toISOString().split('T')[0];
      }
      await updateGoal(goal.id, updates);
    } catch (error) {
      console.error('Error updating goal status:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEditGoal = goal?.user_id === user?.id || goal?.manager_id === user?.id;
  const daysUntilDue = Math.ceil((new Date(goal?.due_date) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

  return (
    <div 
      className={`relative border rounded-lg p-4 transition-all duration-200 hover:shadow-medium ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/30'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection Checkbox */}
      <div className="flex items-start space-x-4">
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onBulkSelect?.(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Icon 
                name={goal?.status === 'completed' ? 'CheckCircle' : 
                      goal?.status === 'active' ? 'TrendingUp' : 
                      goal?.status === 'on_hold' ? 'AlertTriangle' : 'Circle'} 
                size={20} 
                className={getStatusColor?.(goal?.status) || 'text-text-secondary'}
              />
              <div className="flex-1 min-w-0">
                <button
                  onClick={onSelect}
                  className="text-left">
                  <h3 className="font-medium text-text-primary hover:text-primary transition-colors duration-200 truncate">
                    {goal?.title || 'Untitled Goal'}
                  </h3>
                </button>
                <p className="text-sm text-text-secondary truncate">
                  {goal?.category || 'General'} • {goal?.department || 'No Department'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                getStatusBadgeColor?.(goal?.status) || 'bg-text-secondary/10 text-text-secondary border-text-secondary/20'
              }`}>
                {goal?.status?.replace('_', ' ') || 'Draft'}
              </span>
              
              {/* Priority Badge */}
              {goal?.priority && goal.priority !== 'medium' && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.priority === 'high' ? 'bg-warning/10 text-warning' :
                  goal.priority === 'critical'? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                }`}>
                  {goal.priority}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {goal?.description && (
            <p className="text-sm text-text-secondary mb-3 line-clamp-2">
              {goal.description}
            </p>
          )}

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-text-secondary">Progress</span>
              <span className="font-medium text-text-primary">{goal?.progress || 0}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  goal?.status === 'completed' ? 'bg-success' :
                  goal?.status === 'active' ? 'bg-primary' : 
                  goal?.status === 'on_hold' ? 'bg-warning' : 'bg-text-secondary'
                }`}
                style={{ width: `${goal?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Assignee and Date Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {goal?.assignee && (
                <div className="flex items-center space-x-2">
                  <Image
                    src={goal.assignee.avatar_url || `https://ui-avatars.com/api/?name=${goal.assignee.first_name}+${goal.assignee.last_name}&background=6366f1&color=fff`}
                    alt={`${goal.assignee.first_name} ${goal.assignee.last_name}`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-text-secondary">
                    {goal.assignee.first_name} {goal.assignee.last_name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {isOverdue && (
                <Icon name="AlertTriangle" size={14} className="text-error" />
              )}
              {isDueSoon && !isOverdue && (
                <Icon name="Clock" size={14} className="text-warning" />
              )}
              <span className={`text-xs ${
                isOverdue ? 'text-error font-medium' : isDueSoon ?'text-warning font-medium': 'text-text-secondary'
              }`}>
                {isOverdue 
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : isDueSoon 
                    ? `Due in ${daysUntilDue} days`
                    : `Due ${new Date(goal?.due_date).toLocaleDateString()}`
                }
              </span>
            </div>
          </div>

          {/* Tags */}
          {goal?.tags && goal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {goal.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {goal.tags.length > 3 && (
                <span className="text-xs text-text-secondary px-2 py-1">
                  +{goal.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Goal Metrics Summary */}
          {goal?.goal_metrics && goal.goal_metrics.length > 0 && (
            <div className="mt-3 p-2 bg-background rounded-md">
              <div className="text-xs text-text-secondary mb-1">Key Metrics</div>
              <div className="space-y-1">
                {goal.goal_metrics.slice(0, 2).map((metric, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-text-secondary">{metric.name}</span>
                    <span className="text-text-primary font-medium">
                      {metric.current_value || '0'} / {metric.target_value} {metric.unit || ''}
                    </span>
                  </div>
                ))}
                {goal.goal_metrics.length > 2 && (
                  <div className="text-xs text-text-secondary">+{goal.goal_metrics.length - 2} more metrics</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(showActions || isSelected) && canEditGoal && (
        <div className="absolute top-4 right-4 flex items-center space-x-1">
          {goal?.status !== 'completed' && (
            <div className="flex items-center space-x-1">
              {/* Quick Progress Buttons */}
              {[25, 50, 75, 100].map((progress) => (
                <button
                  key={progress}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProgressUpdate(progress);
                  }}
                  disabled={loading || (goal?.progress || 0) >= progress}
                  className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                    (goal?.progress || 0) >= progress
                      ? 'bg-success/20 text-success cursor-default' :'bg-background text-text-secondary hover:bg-primary hover:text-white'
                  }`}
                  title={`Set progress to ${progress}%`}
                >
                  {progress}%
                </button>
              ))}
            </div>
          )}
          
          {/* Status Update Dropdown */}
          <div className="relative group">
            <button className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200">
              <Icon name="MoreVertical" size={16} />
            </button>
            <div className="absolute right-0 top-8 w-48 bg-surface border border-border rounded-md shadow-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                {['draft', 'active', 'on_hold', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(status);
                    }}
                    disabled={loading}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-background transition-colors duration-200 ${
                      goal?.status === status ? 'text-primary bg-primary/10' : 'text-text-secondary'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={status === 'completed' ? 'CheckCircle' : 
                              status === 'active' ? 'TrendingUp' : 
                              status === 'on_hold' ? 'AlertTriangle' : 'Circle'} 
                        size={14} 
                      />
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
                <hr className="my-1 border-border" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this goal?')) {
                      onDelete?.(goal?.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="Trash2" size={14} />
                    <span>Delete Goal</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-surface/80 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default GoalCard;