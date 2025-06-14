import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const QuickActions = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Define actions based on current page context
  const getContextualActions = () => {
    const currentPath = location.pathname;
    
    switch (currentPath) {
      case '/dashboard':
        return [
          { label: 'Create Goal', icon: 'Target', action: () => navigate('/goals-management'), color: 'primary' },
          { label: 'Start Review', icon: 'FileText', action: () => navigate('/performance-reviews'), color: 'accent' },
          { label: 'View Analytics', icon: 'BarChart3', action: () => navigate('/team-analytics'), color: 'success' }
        ];
      
      case '/goals-management':
        return [
          { label: 'New Goal', icon: 'Plus', action: () => console.log('Create new goal'), color: 'primary' },
          { label: 'Import Goals', icon: 'Upload', action: () => console.log('Import goals'), color: 'secondary' },
          { label: 'Export Report', icon: 'Download', action: () => console.log('Export report'), color: 'accent' }
        ];
      
      case '/performance-reviews':
        return [
          { label: 'New Review', icon: 'Plus', action: () => console.log('Create new review'), color: 'primary' },
          { label: 'Review Template', icon: 'FileTemplate', action: () => console.log('Create template'), color: 'secondary' },
          { label: 'Send Reminder', icon: 'Bell', action: () => console.log('Send reminder'), color: 'warning' }
        ];
      
      case '/team-analytics':
        return [
          { label: 'Generate Report', icon: 'FileBarChart', action: () => console.log('Generate report'), color: 'primary' },
          { label: 'Export Data', icon: 'Download', action: () => console.log('Export data'), color: 'accent' },
          { label: 'Schedule Report', icon: 'Calendar', action: () => console.log('Schedule report'), color: 'success' }
        ];
      
      case '/employee-profile':
        return [
          { label: 'Give Feedback', icon: 'MessageSquare', action: () => console.log('Give feedback'), color: 'primary' },
          { label: 'Update Profile', icon: 'Edit', action: () => console.log('Update profile'), color: 'secondary' },
          { label: 'View History', icon: 'History', action: () => console.log('View history'), color: 'accent' }
        ];
      
      default:
        return [
          { label: 'Quick Action', icon: 'Zap', action: () => console.log('Quick action'), color: 'primary' }
        ];
    }
  };

  const actions = getContextualActions();

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return 'bg-primary hover:bg-primary/90 text-white';
      case 'secondary':
        return 'bg-secondary hover:bg-secondary/90 text-white';
      case 'accent':
        return 'bg-accent hover:bg-accent/90 text-white';
      case 'success':
        return 'bg-success hover:bg-success/90 text-white';
      case 'warning':
        return 'bg-warning hover:bg-warning/90 text-white';
      default:
        return 'bg-primary hover:bg-primary/90 text-white';
    }
  };

  return (
    <>
      {/* Desktop Toolbar */}
      <div className="hidden lg:flex items-center space-x-3 mb-6">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 hover-lift ${getColorClasses(action.color)}`}
          >
            <Icon name={action.icon} size={16} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-1000">
        {/* Expanded Actions */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 space-y-3 animate-scale-in">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  setIsExpanded(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-full shadow-medium transition-all duration-200 hover-lift ${getColorClasses(action.color)}`}
              >
                <Icon name={action.icon} size={18} />
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-medium transition-all duration-200 hover-lift ${
            isExpanded 
              ? 'bg-error hover:bg-error/90 text-white rotate-45' :'bg-primary hover:bg-primary/90 text-white'
          }`}
        >
          <Icon name={isExpanded ? 'X' : 'Plus'} size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isExpanded && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-999"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default QuickActions;