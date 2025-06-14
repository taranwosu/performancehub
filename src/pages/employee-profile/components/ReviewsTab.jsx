// src/pages/employee-profile/components/ReviewsTab.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ReviewsTab = ({ employee, currentUser }) => {
  const [expandedReview, setExpandedReview] = useState(null);
  const [filterYear, setFilterYear] = useState('all');

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      period: 'Q4 2023',
      date: '2024-01-15',
      reviewer: 'Sarah Johnson',
      reviewerRole: 'Engineering Manager',
      type: 'Performance Review',
      overallRating: 4.6,
      ratings: {
        technical: 4.8,
        communication: 4.5,
        leadership: 4.7,
        collaboration: 4.4,
        problemSolving: 4.6
      },
      strengths: [
        'Exceptional technical skills and code quality',
        'Strong mentorship and knowledge sharing',
        'Proactive problem-solving approach',
        'Excellent project delivery track record'
      ],
      areasForImprovement: [
        'Could improve stakeholder communication',
        'Documentation could be more comprehensive'
      ],
      goals: [
        'Lead microservices migration project',
        'Complete AWS certification',
        'Mentor 2 junior developers'
      ],
      comments: 'Alex has shown exceptional growth this quarter. His technical leadership on the platform redesign was outstanding, and his mentorship of junior team members has been invaluable. Focus on stakeholder communication will help in future leadership roles.'
    },
    {
      id: 2,
      period: 'Mid-Year 2023',
      date: '2023-09-01',
      reviewer: 'Sarah Johnson',
      reviewerRole: 'Engineering Manager',
      type: 'Mid-Year Review',
      overallRating: 4.3,
      ratings: {
        technical: 4.5,
        communication: 4.0,
        leadership: 4.2,
        collaboration: 4.3,
        problemSolving: 4.5
      },
      strengths: [
        'Strong technical foundation',
        'Reliable delivery and quality',
        'Good team collaboration'
      ],
      areasForImprovement: [
        'Take on more leadership opportunities',
        'Increase visibility with stakeholders',
        'Contribute to architectural decisions'
      ],
      goals: [
        'Lead one major feature development',
        'Improve cross-team communication',
        'Participate in architecture reviews'
      ],
      comments: 'Alex continues to deliver high-quality work consistently. Ready for increased responsibility and leadership opportunities.'
    },
    {
      id: 3,
      period: 'Q1 2023',
      date: '2023-04-15',
      reviewer: 'Michael Chen',
      reviewerRole: 'Senior Engineering Manager',
      type: 'Quarterly Review',
      overallRating: 4.1,
      ratings: {
        technical: 4.3,
        communication: 3.8,
        leadership: 3.9,
        collaboration: 4.2,
        problemSolving: 4.2
      },
      strengths: [
        'Solid technical skills',
        'Attention to detail',
        'Willingness to learn'
      ],
      areasForImprovement: [
        'Confidence in sharing ideas',
        'Time management under pressure',
        'Cross-functional communication'
      ],
      goals: [
        'Complete React advanced training',
        'Contribute to code review process',
        'Present to team monthly'
      ],
      comments: 'Alex is developing well as a mid-level engineer. Encouraged to take on more visible projects and build confidence.'
    }
  ];

  const canManageReviews = currentUser?.role === 'manager';
  const availableYears = ['all', '2024', '2023', '2022'];

  const filteredReviews = reviews?.filter(review => {
    if (filterYear === 'all') return true;
    return new Date(review.date).getFullYear().toString() === filterYear;
  });

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 4.0) return 'text-primary';
    if (rating >= 3.5) return 'text-warning';
    return 'text-error';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="Star"
            size={14}
            className={star <= Math.floor(rating) 
              ? "text-warning fill-current" 
              : star <= rating 
              ? "text-warning fill-current opacity-50" :"text-border"
            }
          />
        ))}
        <span className={`ml-2 text-sm font-medium ${getRatingColor(rating)}`}>
          {rating?.toFixed(1)}
        </span>
      </div>
    );
  };

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const calculateTrendDirection = (currentRating, previousRating) => {
    if (!previousRating) return null;
    if (currentRating > previousRating) return 'up';
    if (currentRating < previousRating) return 'down';
    return 'stable';
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return <Icon name="TrendingUp" size={16} className="text-success" />;
      case 'down':
        return <Icon name="TrendingDown" size={16} className="text-error" />;
      case 'stable':
        return <Icon name="Minus" size={16} className="text-text-secondary" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Year:</span>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border border-border rounded px-3 py-1 text-sm bg-surface"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </option>
              ))}
            </select>
          </div>
          
          {/* Rating Trends Summary */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary">Current:</span>
              {renderStars(filteredReviews?.[0]?.overallRating || 0)}
            </div>
            {filteredReviews?.length > 1 && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(calculateTrendDirection(
                  filteredReviews[0]?.overallRating,
                  filteredReviews[1]?.overallRating
                ))}
                <span className="text-text-secondary">
                  {((filteredReviews[0]?.overallRating - filteredReviews[1]?.overallRating) || 0).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {canManageReviews && (
          <button className="btn-primary text-sm">
            <Icon name="Plus" size={16} className="mr-2" />
            New Review
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews?.map((review, index) => (
          <div key={review.id} className="border border-border rounded-lg overflow-hidden">
            {/* Review Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-background/50 transition-colors duration-200"
              onClick={() => toggleReviewExpansion(review.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {review.period} - {review.type}
                    </h3>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div>
                      <span className="text-sm text-text-secondary">Overall Rating:</span>
                      {renderStars(review.overallRating)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="User" size={14} className="text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {review.reviewer} ({review.reviewerRole})
                      </span>
                    </div>
                  </div>
                </div>
                
                <Icon 
                  name={expandedReview === review.id ? "ChevronUp" : "ChevronDown"} 
                  size={20} 
                  className="text-text-secondary"
                />
              </div>
            </div>
            
            {/* Expanded Review Details */}
            {expandedReview === review.id && (
              <div className="px-6 pb-6 border-t border-border">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Detailed Ratings */}
                  <div>
                    <h4 className="font-semibold text-text-primary mb-4">Detailed Ratings</h4>
                    <div className="space-y-3">
                      {Object.entries(review.ratings).map(([category, rating]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          {renderStars(rating)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Strengths and Areas for Improvement */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                        <Icon name="ThumbsUp" size={16} className="mr-2 text-success" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {review.strengths?.map((strength, idx) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start">
                            <Icon name="Check" size={14} className="mr-2 mt-0.5 text-success" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                        <Icon name="Target" size={16} className="mr-2 text-warning" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {review.areasForImprovement?.map((area, idx) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start">
                            <Icon name="ArrowRight" size={14} className="mr-2 mt-0.5 text-warning" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Goals and Comments */}
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                      <Icon name="Flag" size={16} className="mr-2 text-primary" />
                      Goals for Next Period
                    </h4>
                    <ul className="space-y-2">
                      {review.goals?.map((goal, idx) => (
                        <li key={idx} className="text-sm text-text-secondary flex items-start">
                          <Icon name="Circle" size={14} className="mr-2 mt-0.5 text-primary" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                      <Icon name="MessageSquare" size={16} className="mr-2 text-text-secondary" />
                      Additional Comments
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed p-4 bg-background rounded-lg">
                      {review.comments}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredReviews?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No reviews found</h3>
          <p className="text-text-secondary mb-4">No performance reviews match the current filter.</p>
          {canManageReviews && (
            <button className="btn-primary">
              <Icon name="Plus" size={16} className="mr-2" />
              Create First Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;