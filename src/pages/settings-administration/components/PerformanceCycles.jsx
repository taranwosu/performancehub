// src/pages/settings-administration/components/PerformanceCycles.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceCycles = () => {
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock performance cycles data
  const cycles = [
    {
      id: 1,
      name: 'Q1 2024 Performance Review',
      type: 'quarterly',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      participants: 120,
      completedReviews: 45,
      description: 'First quarter performance evaluation cycle'
    },
    {
      id: 2,
      name: 'Annual Review 2024',
      type: 'annual',
      status: 'upcoming',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      participants: 150,
      completedReviews: 0,
      description: 'Annual comprehensive performance review'
    },
    {
      id: 3,
      name: 'Mid-Year Check-in 2024',
      type: 'bi-annual',
      status: 'planning',
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      participants: 0,
      completedReviews: 0,
      description: 'Mid-year performance check-in and goal adjustment'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'upcoming':
        return 'text-primary bg-primary/10';
      case 'planning':
        return 'text-warning bg-warning/10';
      case 'completed':
        return 'text-text-secondary bg-background';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quarterly':
        return 'Calendar';
      case 'annual':
        return 'CalendarDays';
      case 'bi-annual':
        return 'CalendarRange';
      default:
        return 'Calendar';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Performance Cycles
          </h3>
          <p className="text-sm text-text-secondary">
            Create and manage performance review cycles
          </p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>Create Cycle</span>
        </button>
      </div>

      {/* Cycles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {cycles?.map(cycle => (
          <div 
            key={cycle?.id} 
            className="bg-background border border-border rounded-lg p-6 hover:shadow-light transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={getTypeIcon(cycle?.type)} size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{cycle?.name}</h4>
                  <p className="text-sm text-text-secondary capitalize">{cycle?.type} Review</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle?.status)}`}>
                {cycle?.status}
              </span>
            </div>
            
            <p className="text-sm text-text-secondary mb-4">{cycle?.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Duration</span>
                <span className="text-text-primary font-medium">
                  {new Date(cycle?.startDate)?.toLocaleDateString()} - {new Date(cycle?.endDate)?.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Participants</span>
                <span className="text-text-primary font-medium">{cycle?.participants}</span>
              </div>
              
              {cycle?.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Progress</span>
                    <span className="text-text-primary font-medium">
                      {cycle?.completedReviews}/{cycle?.participants} completed
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(cycle?.completedReviews / cycle?.participants) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <button 
                onClick={() => setSelectedCycle(cycle)}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
              >
                View Details
              </button>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded hover:bg-surface transition-colors duration-200">
                  <Icon name="Edit" size={16} className="text-text-secondary hover:text-text-primary" />
                </button>
                <button className="p-1 rounded hover:bg-surface transition-colors duration-200">
                  <Icon name="MoreVertical" size={16} className="text-text-secondary hover:text-text-primary" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cycle Creation Section */}
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Quick Setup</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex flex-col items-center p-6 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Icon name="Calendar" size={24} className="text-primary" />
            </div>
            <h5 className="font-medium text-text-primary mb-1">Quarterly Review</h5>
            <p className="text-sm text-text-secondary text-center">Set up a 3-month performance cycle</p>
          </button>
          
          <button className="flex flex-col items-center p-6 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
              <Icon name="CalendarRange" size={24} className="text-accent" />
            </div>
            <h5 className="font-medium text-text-primary mb-1">Bi-Annual Review</h5>
            <p className="text-sm text-text-secondary text-center">Create a 6-month review cycle</p>
          </button>
          
          <button className="flex flex-col items-center p-6 border border-border rounded-lg hover:bg-surface transition-colors duration-200">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-3">
              <Icon name="CalendarDays" size={24} className="text-success" />
            </div>
            <h5 className="font-medium text-text-primary mb-1">Annual Review</h5>
            <p className="text-sm text-text-secondary text-center">Configure yearly performance evaluation</p>
          </button>
        </div>
      </div>

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-border w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Create Performance Cycle</h3>
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
                  <label className="block text-sm font-medium text-text-primary mb-2">Cycle Name</label>
                  <input type="text" className="input-field" placeholder="e.g., Q2 2024 Review" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Cycle Type</label>
                  <select className="input-field">
                    <option value="quarterly">Quarterly</option>
                    <option value="bi-annual">Bi-Annual</option>
                    <option value="annual">Annual</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Start Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">End Date</label>
                  <input type="date" className="input-field" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                <textarea className="input-field h-24" placeholder="Describe the purpose and goals of this cycle..."></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Participants</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-text-primary">All employees</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-text-primary">Specific departments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-text-primary">Individual selection</span>
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
              <button className="btn-primary">Create Cycle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceCycles;