import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ReviewTemplates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 1,
      name: 'Annual Performance Review 2024',
      description: 'Comprehensive annual review template covering goals, competencies, and development planning',
      category: 'annual',
      sections: ['Goal Assessment', 'Competency Evaluation', 'Achievements', 'Development Areas', 'Manager Feedback', 'Career Planning'],
      estimatedTime: '60-90 minutes',
      lastModified: '2024-11-15',
      usageCount: 45,
      isDefault: true,
      status: 'active'
    },
    {
      id: 2,
      name: 'Quarterly Check-in Q4 2024',
      description: 'Focused quarterly review for tracking progress and adjusting short-term goals',
      category: 'quarterly',
      sections: ['Goal Progress', 'Key Achievements', 'Challenges & Blockers', 'Next Quarter Planning'],
      estimatedTime: '30-45 minutes',
      lastModified: '2024-11-20',
      usageCount: 32,
      isDefault: false,
      status: 'active'
    },
    {
      id: 3,
      name: 'Mid-Year Review Template',
      description: 'Mid-year checkpoint for goal adjustment and career development discussion',
      category: 'mid-year',
      sections: ['Goal Assessment', 'Skill Development', 'Career Planning', 'Training Needs', 'Feedback Exchange'],
      estimatedTime: '45-60 minutes',
      lastModified: '2024-10-30',
      usageCount: 28,
      isDefault: false,
      status: 'active'
    },
    {
      id: 4,
      name: 'New Employee 90-Day Review',
      description: 'Structured review for new employees after their first 90 days',
      category: 'probation',
      sections: ['Onboarding Assessment', 'Initial Goals', 'Training Progress', 'Team Integration', 'Next Steps'],
      estimatedTime: '30-45 minutes',
      lastModified: '2024-11-10',
      usageCount: 15,
      isDefault: false,
      status: 'active'
    },
    {
      id: 5,
      name: 'Performance Improvement Plan',
      description: 'Template for employees requiring performance improvement with clear action items',
      category: 'pip',
      sections: ['Performance Issues', 'Improvement Goals', 'Action Plan', 'Support Resources', 'Timeline & Milestones'],
      estimatedTime: '45-60 minutes',
      lastModified: '2024-11-05',
      usageCount: 8,
      isDefault: false,
      status: 'active'
    },
    {
      id: 6,
      name: 'Leadership Assessment',
      description: 'Specialized template for evaluating leadership competencies and management skills',
      category: 'leadership',
      sections: ['Leadership Competencies', 'Team Management', 'Strategic Thinking', 'Communication Skills', 'Development Planning'],
      estimatedTime: '60-75 minutes',
      lastModified: '2024-10-25',
      usageCount: 12,
      isDefault: false,
      status: 'draft'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Templates', count: templates.length },
    { value: 'annual', label: 'Annual Reviews', count: templates.filter(t => t.category === 'annual').length },
    { value: 'quarterly', label: 'Quarterly', count: templates.filter(t => t.category === 'quarterly').length },
    { value: 'mid-year', label: 'Mid-Year', count: templates.filter(t => t.category === 'mid-year').length },
    { value: 'probation', label: 'Probation', count: templates.filter(t => t.category === 'probation').length },
    { value: 'pip', label: 'PIP', count: templates.filter(t => t.category === 'pip').length },
    { value: 'leadership', label: 'Leadership', count: templates.filter(t => t.category === 'leadership').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status, isDefault) => {
    if (isDefault) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          Default
        </span>
      );
    }
    
    const statusConfig = {
      active: { color: 'bg-success/10 text-success', label: 'Active' },
      draft: { color: 'bg-warning/10 text-warning', label: 'Draft' },
      archived: { color: 'bg-secondary/10 text-secondary', label: 'Archived' }
    };

    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Icon name="Upload" size={16} />
            <span>Import Template</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Icon name="Plus" size={16} />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              selectedCategory === category.value
                ? 'bg-primary text-white' :'bg-background text-text-secondary hover:text-text-primary hover:bg-border'
            }`}
          >
            <span>{category.label}</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
              selectedCategory === category.value
                ? 'bg-white/20 text-white' :'bg-text-secondary/10 text-text-secondary'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="card hover-glow transition-all duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {getStatusBadge(template.status, template.isDefault)}
                </div>
              </div>

              {/* Sections */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Sections:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.sections.slice(0, 3).map((section, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-background text-text-secondary"
                    >
                      {section}
                    </span>
                  ))}
                  {template.sections.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-background text-text-secondary">
                      +{template.sections.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>{template.estimatedTime}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Icon name="Users" size={12} />
                    <span>{template.usageCount} uses</span>
                  </span>
                </div>
                <span>Modified {formatDate(template.lastModified)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-primary hover:text-primary/80 transition-colors duration-200">
                    <Icon name="Eye" size={16} />
                  </button>
                  <button className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                    <Icon name="Edit" size={16} />
                  </button>
                  <button className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                    <Icon name="Copy" size={16} />
                  </button>
                  <button className="text-text-secondary hover:text-error transition-colors duration-200">
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
                
                <button className="btn-primary text-sm px-3 py-1.5">
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileTemplate" size={48} className="mx-auto text-text-secondary mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No templates found</h3>
          <p className="text-text-secondary mb-6">
            {searchTerm || selectedCategory !== 'all' ?'Try adjusting your search or filter criteria.' :'Get started by creating your first review template.'}
          </p>
          <button className="btn-primary flex items-center space-x-2 mx-auto">
            <Icon name="Plus" size={16} />
            <span>Create Template</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewTemplates;