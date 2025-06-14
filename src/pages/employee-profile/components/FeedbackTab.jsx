// src/pages/employee-profile/components/FeedbackTab.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const FeedbackTab = ({ employee, currentUser }) => {
  const [filterType, setFilterType] = useState('all'); // all, received, given
  const [filterSentiment, setFilterSentiment] = useState('all'); // all, positive, neutral, negative
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Mock feedback data
  const feedbackData = [
    {
      id: 1,
      type: 'received',
      from: {
        name: 'Sarah Johnson',
        role: 'Engineering Manager',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      date: '2024-01-10',
      sentiment: 'positive',
      category: 'Technical Skills',
      rating: 4.8,
      content: 'Alex consistently delivers high-quality code and has shown excellent problem-solving skills during the recent microservices migration. His attention to detail and code review comments have significantly improved our team\'s code quality.',
      keywords: ['problem-solving', 'code quality', 'attention to detail', 'microservices'],
      context: 'Q4 2023 Performance Review'
    },
    {
      id: 2,
      type: 'received',
      from: {
        name: 'Maria Garcia',
        role: 'Senior Frontend Developer',
        avatar: 'https://images.pixabay.com/photo/2016/11/29/13/14/attractive-1868817_150.jpg'
      },
      date: '2024-01-08',
      sentiment: 'positive',
      category: 'Collaboration',
      rating: 4.5,
      content: 'Working with Alex on the user dashboard project was fantastic. He was always willing to help and provided clear explanations when I had questions about the backend APIs. Great team player!',
      keywords: ['collaboration', 'helpful', 'clear communication', 'team player'],
      context: 'Project Collaboration'
    },
    {
      id: 3,
      type: 'received',
      from: {
        name: 'David Kim',
        role: 'Junior Developer',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150&h=150&fit=crop&crop=face'
      },
      date: '2023-12-15',
      sentiment: 'positive',
      category: 'Mentorship',
      rating: 5.0,
      content: 'Alex has been an incredible mentor. He takes time to explain complex concepts and always encourages me to think through problems myself before providing solutions. His guidance has accelerated my learning significantly.',
      keywords: ['mentorship', 'guidance', 'encouraging', 'patient teacher'],
      context: 'Mentorship Program'
    },
    {
      id: 4,
      type: 'received',
      from: {
        name: 'Jennifer Lee',
        role: 'Product Manager',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
      },
      date: '2023-11-20',
      sentiment: 'neutral',
      category: 'Communication',
      rating: 3.5,
      content: 'Alex delivers excellent technical work, but could improve on communicating progress and potential blockers earlier in the development cycle. Would benefit from more proactive stakeholder updates.',
      keywords: ['technical excellence', 'communication gaps', 'proactive updates'],
      context: 'Project Retrospective'
    },
    {
      id: 5,
      type: 'given',
      to: {
        name: 'David Kim',
        role: 'Junior Developer',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150&h=150&fit=crop&crop=face'
      },
      date: '2023-12-20',
      sentiment: 'positive',
      category: 'Growth',
      rating: 4.2,
      content: 'David has shown remarkable improvement in his coding skills over the past quarter. His recent pull requests demonstrate a much better understanding of our architecture patterns and his test coverage has improved significantly.',
      keywords: ['improvement', 'coding skills', 'architecture understanding', 'testing'],
      context: 'Mentee Evaluation'
    }
  ];

  const canProvideFeedback = currentUser?.role === 'manager' || currentUser?.id !== employee?.id;

  const filteredFeedback = feedbackData?.filter(feedback => {
    if (filterType !== 'all' && feedback.type !== filterType) return false;
    if (filterSentiment !== 'all' && feedback.sentiment !== filterSentiment) return false;
    return true;
  });

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-success bg-success/10 border-success';
      case 'neutral':
        return 'text-warning bg-warning/10 border-warning';
      case 'negative':
        return 'text-error bg-error/10 border-error';
      default:
        return 'text-text-secondary bg-background border-border';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'ThumbsUp';
      case 'neutral':
        return 'Minus';
      case 'negative':
        return 'ThumbsDown';
      default:
        return 'MessageSquare';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'technical skills':
        return 'Code';
      case 'collaboration':
        return 'Users';
      case 'mentorship':
        return 'GraduationCap';
      case 'communication':
        return 'MessageCircle';
      case 'leadership':
        return 'Crown';
      case 'growth':
        return 'TrendingUp';
      default:
        return 'MessageSquare';
    }
  };

  const aggregateSentiment = () => {
    const received = feedbackData?.filter(f => f.type === 'received');
    const positive = received?.filter(f => f.sentiment === 'positive')?.length || 0;
    const neutral = received?.filter(f => f.sentiment === 'neutral')?.length || 0;
    const negative = received?.filter(f => f.sentiment === 'negative')?.length || 0;
    const total = received?.length || 0;
    
    return { positive, neutral, negative, total };
  };

  const getTopKeywords = () => {
    const keywords = feedbackData
      ?.filter(f => f.type === 'received')
      ?.flatMap(f => f.keywords) || [];
    
    const keywordCount = keywords?.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(keywordCount)
      ?.sort(([,a], [,b]) => b - a)
      ?.slice(0, 8)
      ?.map(([keyword, count]) => ({ keyword, count }));
  };

  const sentimentData = aggregateSentiment();
  const topKeywords = getTopKeywords();

  return (
    <div className="space-y-6">
      {/* Feedback Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sentiment Analysis */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="BarChart3" size={16} className="mr-2" />
            Sentiment Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="ThumbsUp" size={14} className="text-success" />
                <span className="text-sm text-text-secondary">Positive</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-primary">{sentimentData.positive}</span>
                <span className="text-xs text-text-secondary">
                  ({sentimentData.total > 0 ? Math.round((sentimentData.positive / sentimentData.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Minus" size={14} className="text-warning" />
                <span className="text-sm text-text-secondary">Neutral</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-primary">{sentimentData.neutral}</span>
                <span className="text-xs text-text-secondary">
                  ({sentimentData.total > 0 ? Math.round((sentimentData.neutral / sentimentData.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="ThumbsDown" size={14} className="text-error" />
                <span className="text-sm text-text-secondary">Negative</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-primary">{sentimentData.negative}</span>
                <span className="text-xs text-text-secondary">
                  ({sentimentData.total > 0 ? Math.round((sentimentData.negative / sentimentData.total) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Strengths */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="Award" size={16} className="mr-2" />
            Key Strengths
          </h3>
          <div className="flex flex-wrap gap-2">
            {topKeywords?.slice(0, 6)?.map(({ keyword, count }) => (
              <span
                key={keyword}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                title={`Mentioned ${count} times`}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* 360 Feedback Score */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="Star" size={16} className="mr-2" />
            Average Rating
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {(feedbackData?.filter(f => f.type === 'received' && f.rating)
                ?.reduce((acc, f) => acc + f.rating, 0) / 
                feedbackData?.filter(f => f.type === 'received' && f.rating)?.length || 0
              )?.toFixed(1) || '0.0'}
            </div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name="Star"
                  size={16}
                  className="text-warning fill-current"
                />
              ))}
            </div>
            <p className="text-sm text-text-secondary">
              Based on {feedbackData?.filter(f => f.type === 'received')?.length || 0} reviews
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-wrap items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-border rounded px-3 py-1 text-sm bg-surface"
            >
              <option value="all">All Feedback</option>
              <option value="received">Received</option>
              <option value="given">Given</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Sentiment:</span>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="border border-border rounded px-3 py-1 text-sm bg-surface"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>
        
        {canProvideFeedback && (
          <button className="btn-primary text-sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Give Feedback
          </button>
        )}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback?.map((feedback) => (
          <div key={feedback.id} className="border border-border rounded-lg p-6 hover:shadow-light transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <Image
                  src={feedback.type === 'received' ? feedback.from?.avatar : feedback.to?.avatar}
                  alt={feedback.type === 'received' ? feedback.from?.name : feedback.to?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={feedback.type === 'received' ? 'ArrowDown' : 'ArrowUp'} 
                        size={14} 
                        className={feedback.type === 'received' ? 'text-primary' : 'text-accent'}
                      />
                      <span className="font-medium text-text-primary">
                        {feedback.type === 'received' ? 'From' : 'To'} {' '}
                        {feedback.type === 'received' ? feedback.from?.name : feedback.to?.name}
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {feedback.type === 'received' ? feedback.from?.role : feedback.to?.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(feedback.sentiment)}`}>
                      <Icon name={getSentimentIcon(feedback.sentiment)} size={12} className="inline mr-1" />
                      {feedback.sentiment}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
                    <div className="flex items-center space-x-1">
                      <Icon name={getCategoryIcon(feedback.category)} size={14} />
                      <span>{feedback.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} />
                      <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    </div>
                    {feedback.rating && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Star" size={14} className="text-warning" />
                        <span>{feedback.rating}</span>
                      </div>
                    )}
                    <span className="text-text-secondary">•</span>
                    <span>{feedback.context}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="ml-16">
              <p className="text-text-primary leading-relaxed mb-4">
                {feedback.content}
              </p>
              
              {/* Keywords */}
              <div className="flex flex-wrap gap-2">
                {feedback.keywords?.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-background text-text-secondary text-xs rounded border border-border"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredFeedback?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No feedback found</h3>
          <p className="text-text-secondary mb-4">No feedback matches the current filter criteria.</p>
          {canProvideFeedback && (
            <button className="btn-primary">
              <Icon name="Plus" size={16} className="mr-2" />
              Provide First Feedback
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackTab;