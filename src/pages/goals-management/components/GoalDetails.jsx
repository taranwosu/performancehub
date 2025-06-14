// src/pages/goals-management/components/GoalDetails.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useSupabase } from '../../../context/SupabaseProvider';

const GoalDetails = ({ goal, onClose, onDelete, getStatusColor, getStatusBadgeColor }) => {
  const { updateGoal, supabase, user, logActivity } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [editData, setEditData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    progress: goal?.progress || 0,
    status: goal?.status || 'draft'
  });

  // Load goal details
  useEffect(() => {
    if (goal?.id) {
      loadGoalMetrics();
      loadComments();
    }
  }, [goal?.id]);

  const loadGoalMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('goal_metrics')
        .select('*')
        .eq('goal_id', goal.id)
        .order('created_at');
      
      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error loading goal metrics:', error);
    }
  };

  const loadComments = async () => {
    try {
      // For now, we'll simulate comments from activity logs
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_profiles(first_name, last_name, avatar_url)
        `)
        .eq('entity_type', 'goal')
        .eq('entity_id', goal.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateGoal(goal.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await logActivity('goal_commented', 'goal', goal.id, { comment: newComment });
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleMetricUpdate = async (metricId, updates) => {
    try {
      const { error } = await supabase
        .from('goal_metrics')
        .update(updates)
        .eq('id', metricId);
      
      if (error) throw error;
      loadGoalMetrics();
    } catch (error) {
      console.error('Error updating metric:', error);
    }
  };

  const canEdit = goal?.user_id === user?.id || goal?.manager_id === user?.id;
  const daysUntilDue = Math.ceil((new Date(goal?.due_date) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

  if (!goal) return null;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon 
            name={goal.status === 'completed' ? 'CheckCircle' : 
                  goal.status === 'active' ? 'TrendingUp' : 
                  goal.status === 'on_hold' ? 'AlertTriangle' : 'Circle'} 
            size={24} 
            className={getStatusColor?.(goal.status) || 'text-text-secondary'}
          />
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Goal Details</h2>
            <p className="text-sm text-text-secondary">{goal.category || 'General'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-md text-text-secondary hover:text-primary hover:bg-background transition-colors duration-200"
            >
              <Icon name={isEditing ? "X" : "Edit"} size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="form-input min-h-24 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editData.progress}
                  onChange={(e) => setEditData({ ...editData, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-sm text-text-secondary mt-1">{editData.progress}%</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="form-input"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <>
            {/* Goal Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-text-primary">{goal.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  getStatusBadgeColor?.(goal.status) || 'bg-text-secondary/10 text-text-secondary border-text-secondary/20'
                }`}>
                  {goal.status?.replace('_', ' ') || 'Draft'}
                </span>
              </div>
              
              {goal.description && (
                <p className="text-text-secondary mb-4">{goal.description}</p>
              )}
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-secondary">Progress</span>
                  <span className="font-medium text-text-primary">{goal.progress || 0}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      goal.status === 'completed' ? 'bg-success' :
                      goal.status === 'active' ? 'bg-primary' : 
                      goal.status === 'on_hold' ? 'bg-warning' : 'bg-text-secondary'
                    }`}
                    style={{ width: `${goal.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Goal Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg">
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Department</label>
                <p className="text-sm text-text-primary mt-1">{goal.department || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Priority</label>
                <p className="text-sm text-text-primary mt-1 capitalize">{goal.priority || 'Medium'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Start Date</label>
                <p className="text-sm text-text-primary mt-1">
                  {goal.start_date ? new Date(goal.start_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Due Date</label>
                <p className={`text-sm mt-1 ${
                  isOverdue ? 'text-error font-medium' : isDueSoon ?'text-warning font-medium': 'text-text-primary'
                }`}>
                  {goal.due_date ? new Date(goal.due_date).toLocaleDateString() : 'Not set'}
                  {isOverdue && ' (Overdue)'}
                  {isDueSoon && !isOverdue && ` (Due in ${daysUntilDue} days)`}
                </p>
              </div>
            </div>

            {/* Assignee Info */}
            {goal.assignee && (
              <div className="flex items-center space-x-3 p-4 bg-background rounded-lg">
                <Image
                  src={goal.assignee.avatar_url || `https://ui-avatars.com/api/?name=${goal.assignee.first_name}+${goal.assignee.last_name}&background=6366f1&color=fff`}
                  alt={`${goal.assignee.first_name} ${goal.assignee.last_name}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {goal.assignee.first_name} {goal.assignee.last_name}
                  </p>
                  <p className="text-xs text-text-secondary">Goal Owner</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {goal.tags && goal.tags.length > 0 && (
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {goal.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Success Metrics */}
            {metrics.length > 0 && (
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3 block">Success Metrics</label>
                <div className="space-y-3">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="p-3 bg-background rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-text-primary">{metric.name}</h4>
                        {canEdit && (
                          <button className="text-xs text-primary hover:text-primary/80">
                            <Icon name="Edit" size={12} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Current: {metric.current_value || '0'}</span>
                        <span className="text-text-secondary">Target: {metric.target_value} {metric.unit}</span>
                      </div>
                      {metric.target_value && (
                        <div className="mt-2">
                          <div className="w-full bg-border rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min(100, ((parseFloat(metric.current_value) || 0) / parseFloat(metric.target_value)) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity & Comments */}
            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3 block">Recent Activity</label>
              
              {/* Add Comment */}
              {canEdit && (
                <div className="mb-4">
                  <div className="flex space-x-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment or update..."
                      className="form-input flex-1 min-h-12 resize-none"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="Send" size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-text-secondary text-sm text-center py-4">No activity yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3 p-3 bg-background rounded-lg">
                      <Image
                        src={comment.user?.avatar_url || `https://ui-avatars.com/api/?name=${comment.user?.first_name}&background=6366f1&color=fff`}
                        alt={comment.user?.first_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-text-primary">
                            {comment.user?.first_name} {comment.user?.last_name}
                          </p>
                          <span className="text-xs text-text-secondary">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {comment.details?.comment || comment.action.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="flex justify-between pt-4 border-t border-border">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this goal?')) {
                      onDelete?.(goal.id);
                    }
                  }}
                  className="btn-secondary text-error hover:bg-error/10"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Delete Goal
                </button>
                
                <div className="space-x-2">
                  {goal.status !== 'completed' && (
                    <button
                      onClick={() => handleSave()}
                      className="btn-primary"
                    >
                      <Icon name="CheckCircle" size={16} className="mr-2" />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GoalDetails;