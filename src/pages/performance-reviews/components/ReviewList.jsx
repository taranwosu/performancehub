// src/pages/performance-reviews/components/ReviewList.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useSupabase } from '../../../context/SupabaseProvider';

const ReviewList = ({ type = 'my', filters = {} }) => {
  const { fetchPerformanceReviews, user, userProfile } = useSupabase();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [type, filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchPerformanceReviews(filters);
      
      // Filter based on type
      let filteredData = data || [];
      if (type === 'my') {
        filteredData = filteredData.filter(review => 
          review.reviewee_id === user?.id || review.reviewer_id === user?.id
        );
      } else if (type === 'team') {
        // Show reviews for team members if user is a manager
        filteredData = filteredData.filter(review => 
          userProfile?.role === 'manager' || userProfile?.role === 'hr' || userProfile?.role === 'executive'
        );
      }
      
      setReviews(filteredData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border-success/20';
      case 'in_progress':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'pending':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'draft':
        return 'text-text-secondary bg-text-secondary/10 border-text-secondary/20';
      default:
        return 'text-text-secondary bg-text-secondary/10 border-text-secondary/20';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={16}
        className={i < rating ? "text-warning fill-current" : "text-border"}
      />
    ));
  };

  const getReviewProgress = (review) => {
    let completed = 0;
    let total = 3; // self, manager, peer reviews
    
    if (review.self_review_completed) completed++;
    if (review.manager_review_completed) completed++;
    if (review.peer_reviews_completed) completed++;
    
    return (completed / total) * 100;
  };

  const isOverdue = (review) => {
    if (!review.due_date || review.status === 'completed') return false;
    return new Date(review.due_date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No {type === 'my' ? 'personal' : 'team'} reviews found
        </h3>
        <p className="text-text-secondary mb-4">
          {type === 'my' ?'You don\'t have any performance reviews yet.' 
            : 'No team reviews match your current filters.'
          }
        </p>
        <button className="btn-primary">
          <Icon name="Plus" size={16} className="mr-2" />
          Start New Review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-text-primary">
            {type === 'my' ? 'My Reviews' : 'Team Reviews'} ({reviews.length})
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200">
              <Icon name="Filter" size={16} />
            </button>
            <button className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200">
              <Icon name="ArrowUpDown" size={16} />
            </button>
          </div>
        </div>
        
        <button className="btn-secondary">
          <Icon name="Download" size={16} className="mr-2" />
          Export
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reviews.map((review) => {
          const progress = getReviewProgress(review);
          const overdue = isOverdue(review);
          
          return (
            <div
              key={review.id}
              className={`p-6 bg-surface border rounded-lg hover:shadow-medium transition-all duration-200 cursor-pointer ${
                selectedReview?.id === review.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedReview(review)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex -space-x-2">
                    {/* Reviewee Avatar */}
                    <Image
                      src={review.reviewee?.avatar_url || `https://ui-avatars.com/api/?name=${review.reviewee?.first_name}+${review.reviewee?.last_name}&background=6366f1&color=fff`}
                      alt={`${review.reviewee?.first_name} ${review.reviewee?.last_name}`}
                      className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                    />
                    {/* Reviewer Avatar */}
                    <Image
                      src={review.reviewer?.avatar_url || `https://ui-avatars.com/api/?name=${review.reviewer?.first_name}+${review.reviewer?.last_name}&background=059669&color=fff`}
                      alt={`${review.reviewer?.first_name} ${review.reviewer?.last_name}`}
                      className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary">{review.title}</h4>
                    <p className="text-sm text-text-secondary">
                      {review.reviewee?.first_name} {review.reviewee?.last_name}
                      {review.reviewer && (
                        <> • Reviewed by {review.reviewer.first_name} {review.reviewer.last_name}</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    getStatusColor(review.status)
                  }`}>
                    {review.status?.replace('_', ' ') || 'Draft'}
                  </span>
                  
                  {overdue && (
                    <Icon name="AlertTriangle" size={16} className="text-error" />
                  )}
                </div>
              </div>

              {/* Review Type & Period */}
              <div className="flex items-center space-x-4 mb-4 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={14} />
                  <span>{review.review_type || 'Annual'} Review</span>
                </div>
                
                {review.performance_cycle && (
                  <div className="flex items-center space-x-1">
                    <Icon name="RotateCcw" size={14} />
                    <span>{review.performance_cycle.name}</span>
                  </div>
                )}
                
                {review.due_date && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={14} />
                    <span className={overdue ? 'text-error font-medium' : ''}>
                      Due {new Date(review.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-secondary">Completion Progress</span>
                  <span className="font-medium text-text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      review.status === 'completed' ? 'bg-success' :
                      progress > 66 ? 'bg-primary' :
                      progress > 33 ? 'bg-warning' : 'bg-text-secondary'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Review Components Status */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`text-center p-2 rounded-md ${
                  review.self_review_completed ? 'bg-success/10 text-success' : 'bg-background text-text-secondary'
                }`}>
                  <Icon name={review.self_review_completed ? "CheckCircle" : "Circle"} size={16} className="mx-auto mb-1" />
                  <p className="text-xs">Self Review</p>
                </div>
                
                <div className={`text-center p-2 rounded-md ${
                  review.manager_review_completed ? 'bg-success/10 text-success' : 'bg-background text-text-secondary'
                }`}>
                  <Icon name={review.manager_review_completed ? "CheckCircle" : "Circle"} size={16} className="mx-auto mb-1" />
                  <p className="text-xs">Manager Review</p>
                </div>
                
                <div className={`text-center p-2 rounded-md ${
                  review.peer_reviews_completed ? 'bg-success/10 text-success' : 'bg-background text-text-secondary'
                }`}>
                  <Icon name={review.peer_reviews_completed ? "CheckCircle" : "Circle"} size={16} className="mx-auto mb-1" />
                  <p className="text-xs">Peer Reviews</p>
                </div>
              </div>

              {/* Overall Rating */}
              {review.overall_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Overall Rating</span>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(review.overall_rating)}
                    <span className="text-sm font-medium text-text-primary ml-2">
                      {review.overall_rating}/5
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="text-xs text-text-secondary">
                  Created {new Date(review.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex items-center space-x-2">
                  {review.status !== 'completed' && (
                    <button className="btn-secondary text-sm">
                      <Icon name="Edit" size={14} className="mr-1" />
                      Continue
                    </button>
                  )}
                  
                  <button className="btn-primary text-sm">
                    <Icon name="Eye" size={14} className="mr-1" />
                    View
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Detail Modal/Side Panel would go here */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030 p-4">
          <div className="bg-surface rounded-lg shadow-medium w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">
                {selectedReview.title}
              </h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Review details would go here */}
              <p className="text-text-secondary mb-4">Review details and content would be displayed here...</p>
              
              <div className="space-y-4">
                {selectedReview.strengths && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Strengths</h4>
                    <p className="text-text-secondary">{selectedReview.strengths}</p>
                  </div>
                )}
                
                {selectedReview.areas_for_improvement && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Areas for Improvement</h4>
                    <p className="text-text-secondary">{selectedReview.areas_for_improvement}</p>
                  </div>
                )}
                
                {selectedReview.goals_achieved && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Goals Achieved</h4>
                    <p className="text-text-secondary">{selectedReview.goals_achieved}</p>
                  </div>
                )}
                
                {selectedReview.development_goals && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Development Goals</h4>
                    <p className="text-text-secondary">{selectedReview.development_goals}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <button
                onClick={() => setSelectedReview(null)}
                className="btn-secondary"
              >
                Close
              </button>
              
              {selectedReview.status !== 'completed' && (
                <button className="btn-primary">
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;