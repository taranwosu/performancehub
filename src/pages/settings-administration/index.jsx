// src/pages/settings-administration/index.jsx
import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';

// Import components
import UserManagement from './components/UserManagement';
import OrganizationManagement from './components/OrganizationManagement';
import NotificationManagement from './components/NotificationManagement';
import PerformanceCycles from './components/PerformanceCycles';
import GoalTemplates from './components/GoalTemplates';
import ReviewTemplates from './components/ReviewTemplates';
import Integrations from './components/Integrations';
import SystemSettings from './components/SystemSettings';

const SettingsAdministration = () => {
  const [activeSection, setActiveSection] = useState('user-management');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigationSections = [
    {
      id: 'user-management',
      label: 'User Management',
      icon: 'Users',
      description: 'Manage employees, roles, and permissions'
    },
    {
      id: 'organization',
      label: 'Organization',
      icon: 'Building',
      description: 'Configure organization settings and information'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      description: 'Manage email templates and notification settings'
    },
    {
      id: 'performance-cycles',
      label: 'Performance Cycles',
      icon: 'RotateCcw',
      description: 'Configure review cycles and schedules'
    },
    {
      id: 'goal-templates',
      label: 'Goal Templates',
      icon: 'Target',
      description: 'Create and manage goal templates'
    },
    {
      id: 'review-templates',
      label: 'Review Templates',
      icon: 'FileText',
      description: 'Design review forms and questions'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'Link',
      description: 'Connect with external tools and services'
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: 'Settings',
      description: 'Configure system-wide preferences'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeSection) {
      case 'user-management':
        return <UserManagement />;
      case 'organization':
        return <OrganizationManagement />;
      case 'notifications':
        return <NotificationManagement />;
      case 'performance-cycles':
        return <PerformanceCycles />;
      case 'goal-templates':
        return <GoalTemplates />;
      case 'review-templates':
        return <ReviewTemplates />;
      case 'integrations':
        return <Integrations />;
      case 'system-settings':
        return <SystemSettings />;
      default:
        return <UserManagement />;
    }
  };

  const getActiveSection = () => {
    return navigationSections.find(section => section.id === activeSection) || navigationSections[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-full mx-auto">
          <div className="px-6 lg:px-8 py-6">
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Settings & Administration
              </h1>
              <p className="text-text-secondary">
                Configure system settings and manage administrative functions
              </p>
            </div>
          </div>

          {/* Main Layout */}
          <div className="flex">
            {/* Sidebar Navigation */}
            <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 border-r border-border bg-surface`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  {!isSidebarCollapsed && (
                    <h2 className="text-lg font-semibold text-text-primary">
                      Administration
                    </h2>
                  )}
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="p-2 rounded-md hover:bg-background transition-colors duration-200"
                  >
                    <Icon 
                      name={isSidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} 
                      size={16} 
                      className="text-text-secondary" 
                    />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {navigationSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                        activeSection === section.id
                          ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-background'
                      }`}
                    >
                      <Icon 
                        name={section.icon} 
                        size={20} 
                        className={activeSection === section.id ? 'text-white' : 'text-text-secondary'}
                      />
                      {!isSidebarCollapsed && (
                        <div className="flex-1">
                          <div className="font-medium">{section.label}</div>
                          <div className={`text-xs mt-1 ${
                            activeSection === section.id ? 'text-white/80' : 'text-text-tertiary'
                          }`}>
                            {section.description}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-screen">
              <div className="p-6 lg:p-8">
                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon 
                      name={getActiveSection().icon} 
                      size={24} 
                      className="text-primary" 
                    />
                    <h2 className="text-2xl font-bold text-text-primary">
                      {getActiveSection().label}
                    </h2>
                  </div>
                  <p className="text-text-secondary">
                    {getActiveSection().description}
                  </p>
                </div>

                {/* Dynamic Content */}
                <div className="bg-surface rounded-xl border border-border">
                  {renderActiveComponent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsAdministration;