// src/pages/settings-administration/components/ReviewTemplates.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ReviewTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  // Mock review templates
  const templates = [
    {
      id: 1,
      name: 'Annual Performance Review',
      type: 'annual',
      description: 'Comprehensive yearly performance evaluation',
      questions: 15,
      usageCount: 89,
      lastModified: '2024-01-15',
      status: 'active',
      ratingScale: '1-5',
      sections: ['Performance', 'Goals', 'Development', 'Feedback']
    },
    {
      id: 2,
      name: 'Quarterly Check-in',
      type: 'quarterly',
      description: 'Regular quarterly performance assessment',
      questions: 8,
      usageCount: 156,
      lastModified: '2024-01-12',
      status: 'active',
      ratingScale: '1-10',
      sections: ['Goals Progress', 'Challenges', 'Support Needed']
    },
    {
      id: 3,
      name: '360-Degree Feedback',
      type: '360-feedback',
      description: 'Multi-source feedback from peers and managers',
      questions: 25,
      usageCount: 34,
      lastModified: '2024-01-08',
      status: 'active',
      ratingScale: '1-7',
      sections: ['Leadership', 'Collaboration', 'Communication', 'Technical Skills']
    },
    {
      id: 4,
      name: 'Probation Review',
      type: 'probation',
      description: 'New employee probation period evaluation',
      questions: 12,
      usageCount: 23,
      lastModified: '2024-01-05',
      status: 'draft',
      ratingScale: '1-5',
      sections: ['Job Performance', 'Cultural Fit', 'Training Progress']
    }
  ];

  const questionTypes = [
    { id: 'rating', name: 'Rating Scale', icon: 'Star', description: 'Numerical rating questions' },
    { id: 'text', name: 'Text Response', icon: 'MessageSquare', description: 'Open-ended text responses' },
    { id: 'multiple', name: 'Multiple Choice', icon: 'CheckSquare', description: 'Select from predefined options' },
    { id: 'ranking', name: 'Ranking', icon: 'ArrowUpDown', description: 'Rank items in order of preference' },
    { id: 'likert', name: 'Likert Scale', icon: 'BarChart3', description: 'Agreement scale questions' },
    { id: 'boolean', name: 'Yes/No', icon: 'ToggleLeft', description: 'Boolean true/false questions' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'draft':
        return 'text-warning bg-warning/10';
      case 'archived':
        return 'text-text-secondary bg-background';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'annual':
        return 'CalendarDays';
      case 'quarterly':
        return 'Calendar';
      case '360-feedback':
        return 'Users';
      case 'probation':
        return 'UserCheck';
      default:
        return 'FileText';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Review Templates
          </h3>
          <p className="text-sm text-text-secondary">
            Design and manage performance review forms
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-outline flex items-center space-x-2">
            <Icon name="Download" size={16} />
            <span>Import Template</span>
          </button>
          <button 
            onClick={() => setShowFormBuilder(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Icon name="Plus" size={16} />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'templates' ?'text-primary border-primary' :'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'builder' ?'text-primary border-primary' :'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Form Builder
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'analytics' ?'text-primary border-primary' :'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates?.map(template => (
              <div 
                key={template?.id}
                className="bg-background border border-border rounded-lg p-6 hover:shadow-light transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={getTypeIcon(template?.type)} size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">{template?.name}</h4>
                      <p className="text-sm text-text-secondary capitalize">{template?.type?.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template?.status)}`}>
                    {template?.status}
                  </span>
                </div>
                
                <p className="text-sm text-text-secondary mb-4">{template?.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">{template?.questions}</div>
                    <div className="text-xs text-text-secondary">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">{template?.usageCount}</div>
                    <div className="text-xs text-text-secondary">Uses</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Rating Scale</span>
                    <span className="text-text-primary font-medium">{template?.ratingScale}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Last Modified</span>
                    <span className="text-text-primary font-medium">
                      {new Date(template?.lastModified)?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-xs text-text-secondary mb-2 block">Sections:</span>
                  <div className="flex flex-wrap gap-1">
                    {template?.sections?.map((section, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-surface text-xs rounded border border-border"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedTemplate(template)}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
                  >
                    Edit Template
                  </button>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 rounded hover:bg-surface transition-colors duration-200">
                      <Icon name="Copy" size={16} className="text-text-secondary hover:text-text-primary" />
                    </button>
                    <button className="p-1 rounded hover:bg-surface transition-colors duration-200">
                      <Icon name="Eye" size={16} className="text-text-secondary hover:text-text-primary" />
                    </button>
                    <button className="p-1 rounded hover:bg-surface transition-colors duration-200">
                      <Icon name="MoreVertical" size={16} className="text-text-secondary hover:text-text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Builder Tab */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="bg-background border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold text-text-primary mb-4">Question Types</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionTypes?.map(type => (
                <div 
                  key={type?.id}
                  className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={type?.icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-text-primary">{type?.name}</h5>
                    <p className="text-sm text-text-secondary">{type?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-background border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold text-text-primary mb-4">Rating Scales</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
                <h5 className="font-medium text-text-primary mb-2">5-Point Scale</h5>
                <p className="text-sm text-text-secondary mb-3">Traditional 1-5 rating system</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5]?.map(num => (
                    <div key={num} className="w-6 h-6 bg-primary/20 rounded text-xs flex items-center justify-center">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
                <h5 className="font-medium text-text-primary mb-2">10-Point Scale</h5>
                <p className="text-sm text-text-secondary mb-3">Detailed 1-10 rating system</p>
                <div className="text-sm text-text-secondary">1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10</div>
              </div>
              
              <div className="p-4 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
                <h5 className="font-medium text-text-primary mb-2">Likert Scale</h5>
                <p className="text-sm text-text-secondary mb-3">Agreement-based rating</p>
                <div className="text-xs text-text-secondary">Strongly Disagree → Strongly Agree</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-text-primary mb-1">12</div>
              <div className="text-sm text-text-secondary">Active Templates</div>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-text-primary mb-1">1,234</div>
              <div className="text-sm text-text-secondary">Total Reviews</div>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-text-primary mb-1">87%</div>
              <div className="text-sm text-text-secondary">Completion Rate</div>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-text-primary mb-1">4.2</div>
              <div className="text-sm text-text-secondary">Avg. Rating</div>
            </div>
          </div>
          
          <div className="bg-background border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold text-text-primary mb-4">Template Usage Analytics</h4>
            <div className="text-sm text-text-secondary">Analytics dashboard content would be displayed here...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewTemplates;