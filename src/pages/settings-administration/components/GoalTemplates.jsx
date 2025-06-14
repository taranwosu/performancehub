// src/pages/settings-administration/components/GoalTemplates.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const GoalTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Mock template data
  const templates = [
    {
      id: 1,
      name: 'Sales Performance',
      category: 'Sales',
      description: 'Achieve monthly sales targets and customer acquisition goals',
      usageCount: 45,
      isActive: true,
      lastModified: '2024-01-15',
      fields: ['Target Amount', 'Time Period', 'Customer Metrics'],
      icon: 'TrendingUp'
    },
    {
      id: 2,
      name: 'Leadership Development',
      category: 'Professional Development',
      description: 'Develop leadership skills and team management capabilities',
      usageCount: 23,
      isActive: true,
      lastModified: '2024-01-10',
      fields: ['Leadership Skills', 'Team Size', 'Development Activities'],
      icon: 'Users'
    },
    {
      id: 3,
      name: 'Technical Skills Enhancement',
      category: 'Professional Development',
      description: 'Improve technical expertise and stay updated with latest technologies',
      usageCount: 67,
      isActive: true,
      lastModified: '2024-01-12',
      fields: ['Technologies', 'Certifications', 'Projects'],
      icon: 'Code'
    },
    {
      id: 4,
      name: 'Customer Satisfaction',
      category: 'Customer Service',
      description: 'Improve customer satisfaction scores and service quality',
      usageCount: 34,
      isActive: true,
      lastModified: '2024-01-08',
      fields: ['Satisfaction Score', 'Response Time', 'Resolution Rate'],
      icon: 'Heart'
    },
    {
      id: 5,
      name: 'Process Improvement',
      category: 'Operations',
      description: 'Identify and implement process improvements for efficiency',
      usageCount: 19,
      isActive: false,
      lastModified: '2024-01-05',
      fields: ['Current Process', 'Improvement Areas', 'Success Metrics'],
      icon: 'Settings'
    }
  ];

  const categories = ['Sales', 'Professional Development', 'Customer Service', 'Operations', 'Marketing'];

  const filteredTemplates = templates?.filter(template => 
    selectedCategory === 'all' || template?.category === selectedCategory
  );

  const getIconColor = (category) => {
    const colors = {
      'Sales': 'text-success',
      'Professional Development': 'text-primary',
      'Customer Service': 'text-accent',
      'Operations': 'text-warning',
      'Marketing': 'text-purple-500'
    };
    return colors[category] || 'text-text-secondary';
  };

  const getBgColor = (category) => {
    const colors = {
      'Sales': 'bg-success/10',
      'Professional Development': 'bg-primary/10',
      'Customer Service': 'bg-accent/10',
      'Operations': 'bg-warning/10',
      'Marketing': 'bg-purple-500/10'
    };
    return colors[category] || 'bg-background';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Goal Templates
          </h3>
          <p className="text-sm text-text-secondary">
            Create and manage reusable goal templates
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-outline flex items-center space-x-2">
            <Icon name="Download" size={16} />
            <span>Import</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Icon name="Plus" size={16} />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedCategory === 'all' ?'bg-primary text-white' :'bg-background text-text-secondary hover:text-text-primary'
          }`}
        >
          All Categories
        </button>
        {categories?.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
              selectedCategory === category
                ? 'bg-primary text-white' :'bg-background text-text-secondary hover:text-text-primary'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredTemplates?.map(template => (
          <div 
            key={template?.id}
            className="bg-background border border-border rounded-lg p-6 hover:shadow-light transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getBgColor(template?.category)}`}>
                  <Icon name={template?.icon} size={20} className={getIconColor(template?.category)} />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{template?.name}</h4>
                  <p className="text-sm text-text-secondary">{template?.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  template?.isActive ? 'bg-success' : 'bg-text-secondary'
                }`}></span>
                <span className="text-xs text-text-secondary">
                  {template?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-text-secondary mb-4">{template?.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Usage Count</span>
                <span className="text-text-primary font-medium">{template?.usageCount}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Last Modified</span>
                <span className="text-text-primary font-medium">
                  {new Date(template?.lastModified)?.toLocaleDateString()}
                </span>
              </div>
              
              <div>
                <span className="text-xs text-text-secondary mb-2 block">Fields:</span>
                <div className="flex flex-wrap gap-1">
                  {template?.fields?.slice(0, 3)?.map((field, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-surface text-xs rounded border border-border"
                    >
                      {field}
                    </span>
                  ))}
                  {template?.fields?.length > 3 && (
                    <span className="px-2 py-1 bg-surface text-xs rounded border border-border">
                      +{template?.fields?.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
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
                  <Icon name="MoreVertical" size={16} className="text-text-secondary hover:text-text-primary" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Builder Section */}
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Template Builder</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Icon name="Target" size={20} className="text-primary" />
            </div>
            <h5 className="font-medium text-text-primary mb-1">SMART Goals</h5>
            <p className="text-xs text-text-secondary text-center">Specific, Measurable, Achievable</p>
          </div>
          
          <div className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mb-3">
              <Icon name="BarChart3" size={20} className="text-success" />
            </div>
            <h5 className="font-medium text-text-primary mb-1">KPI Template</h5>
            <p className="text-xs text-text-secondary text-center">Key Performance Indicators</p>
          </div>
          
          <div className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
              <Icon name="TrendingUp" size={20} className="text-accent" />
            </div>
            <h5 className="font-medium text-text-primary mb-1">Growth Goals</h5>
            <p className="text-xs text-text-secondary text-center">Professional development</p>
          </div>
          
          <div className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mb-3">
              <Icon name="Users" size={20} className="text-warning" />
            </div>
            <h5 className="font-medium text-text-primary mb-1">Team Goals</h5>
            <p className="text-xs text-text-secondary text-center">Collaborative objectives</p>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-border w-full max-w-3xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Create Goal Template</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded hover:bg-background transition-colors duration-200"
              >
                <Icon name="X" size={20} className="text-text-secondary" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Template Name</label>
                  <input type="text" className="input-field" placeholder="e.g., Sales Performance" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                  <select className="input-field">
                    <option value="">Select Category</option>
                    {categories?.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                <textarea className="input-field h-24" placeholder="Describe the purpose and scope of this template..."></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Custom Fields</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input type="text" className="input-field flex-1" placeholder="Field name" />
                    <select className="input-field w-32">
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="select">Dropdown</option>
                    </select>
                    <button className="p-2 rounded border border-border hover:bg-background transition-colors duration-200">
                      <Icon name="Trash2" size={16} className="text-text-secondary" />
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 text-primary hover:text-primary/80 text-sm font-medium">
                    <Icon name="Plus" size={16} />
                    <span>Add Field</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Approval Workflow</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-text-primary">Require manager approval</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-text-primary">HR review required</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-text-primary">Auto-assign to team members</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button className="btn-primary">Create Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTemplates;