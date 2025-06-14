import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActions from '../../components/ui/QuickActions';
import Icon from '../../components/AppIcon';

import ReviewList from './components/ReviewList';
import ReviewFilters from './components/ReviewFilters';
import ReviewCreationWizard from './components/ReviewCreationWizard';
import ReviewTemplates from './components/ReviewTemplates';

const PerformanceReviews = () => {
  const [activeTab, setActiveTab] = useState('my-reviews');
  const [isCreationWizardOpen, setIsCreationWizardOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    reviewType: 'all',
    period: 'all',
    department: 'all',
    status: 'all',
    dateRange: { start: '', end: '' }
  });

  const tabs = [
    { id: 'my-reviews', label: 'My Reviews', icon: 'User', count: 8 },
    { id: 'team-reviews', label: 'Team Reviews', icon: 'Users', count: 24 },
    { id: 'review-templates', label: 'Review Templates', icon: 'FileTemplate', count: 12 }
  ];

  const handleStartReview = () => {
    setIsCreationWizardOpen(true);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-reviews':
        return <ReviewList type="my" filters={selectedFilters} />;
      case 'team-reviews':
        return <ReviewList type="team" filters={selectedFilters} />;
      case 'review-templates':
        return <ReviewTemplates />;
      default:
        return <ReviewList type="my" filters={selectedFilters} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Performance Reviews
              </h1>
              <p className="text-text-secondary">
                Manage and track performance reviews across your organization
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartReview}
                className="btn-primary flex items-center space-x-2 justify-center"
              >
                <Icon name="Plus" size={16} />
                <span>Start Review</span>
              </button>
              
              <button className="btn-secondary flex items-center space-x-2 justify-center">
                <Icon name="Download" size={16} />
                <span>Export Reviews</span>
              </button>
            </div>
          </div>

          <QuickActions />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className="lg:w-80 flex-shrink-0">
              <ReviewFilters 
                filters={selectedFilters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Tabs */}
              <div className="card mb-6">
                <div className="border-b border-border">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                        }`}
                      >
                        <Icon name={tab.icon} size={16} />
                        <span>{tab.label}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activeTab === tab.id
                            ? 'bg-primary/10 text-primary' :'bg-background text-text-secondary'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Creation Wizard Modal */}
      {isCreationWizardOpen && (
        <ReviewCreationWizard
          isOpen={isCreationWizardOpen}
          onClose={() => setIsCreationWizardOpen(false)}
        />
      )}
    </div>
  );
};

export default PerformanceReviews;