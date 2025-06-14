// src/pages/settings-administration/components/Integrations.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const Integrations = () => {
  const [activeTab, setActiveTab] = useState('connected');
  const [showApiModal, setShowApiModal] = useState(false);

  // Mock integrations data
  const connectedIntegrations = [
    {
      id: 1,
      name: 'Slack',
      description: 'Team communication and notifications',
      status: 'connected',
      lastSync: '2024-01-20 14:30',
      icon: 'MessageSquare',
      color: 'bg-purple-500',
      features: ['Notifications', 'Goal Updates', 'Review Reminders']
    },
    {
      id: 2,
      name: 'Microsoft Teams',
      description: 'Collaboration and meeting integration',
      status: 'connected',
      lastSync: '2024-01-20 12:15',
      icon: 'Video',
      color: 'bg-blue-500',
      features: ['Meeting Scheduling', 'Calendar Sync', 'Notifications']
    },
    {
      id: 3,
      name: 'Google Workspace',
      description: 'Calendar and document integration',
      status: 'error',
      lastSync: '2024-01-19 09:22',
      icon: 'Calendar',
      color: 'bg-green-500',
      features: ['Calendar Sync', 'Document Sharing', 'SSO']
    }
  ];

  const availableIntegrations = [
    {
      id: 4,
      name: 'Zoom',
      description: 'Video conferencing for performance meetings',
      category: 'Communication',
      icon: 'Video',
      color: 'bg-blue-600',
      popular: true
    },
    {
      id: 5,
      name: 'Jira',
      description: 'Project tracking and goal alignment',
      category: 'Project Management',
      icon: 'Briefcase',
      color: 'bg-blue-700',
      popular: true
    },
    {
      id: 6,
      name: 'Salesforce',
      description: 'CRM integration for sales performance',
      category: 'Sales',
      icon: 'TrendingUp',
      color: 'bg-blue-400',
      popular: false
    },
    {
      id: 7,
      name: 'Workday',
      description: 'HR system integration',
      category: 'HR Systems',
      icon: 'Users',
      color: 'bg-orange-500',
      popular: true
    },
    {
      id: 8,
      name: 'GitHub',
      description: 'Code repository and development metrics',
      category: 'Development',
      icon: 'Code',
      color: 'bg-gray-700',
      popular: false
    },
    {
      id: 9,
      name: 'Tableau',
      description: 'Advanced analytics and reporting',
      category: 'Analytics',
      icon: 'BarChart3',
      color: 'bg-blue-600',
      popular: false
    }
  ];

  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      keyPreview: 'pk_live_***************1234',
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      permissions: ['read', 'write'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Development API Key',
      keyPreview: 'pk_test_***************5678',
      created: '2024-01-10',
      lastUsed: '2024-01-19',
      permissions: ['read'],
      status: 'active'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success bg-success/10';
      case 'error':
        return 'text-destructive bg-destructive/10';
      case 'pending':
        return 'text-warning bg-warning/10';
      default:
        return 'text-text-secondary bg-background';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle';
      case 'error':
        return 'AlertTriangle';
      case 'pending':
        return 'Clock';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Integrations
          </h3>
          <p className="text-sm text-text-secondary">
            Connect with external tools and services
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowApiModal(true)}
            className="btn-outline flex items-center space-x-2"
          >
            <Icon name="Key" size={16} />
            <span>API Keys</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Icon name="Plus" size={16} />
            <span>Add Integration</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('connected')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'connected' ?'text-primary border-primary' :'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Connected ({connectedIntegrations?.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'available' ?'text-primary border-primary' :'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Available ({availableIntegrations?.length})
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'webhooks' ?'text-primary border-primary' :'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Webhooks
        </button>
      </div>

      {/* Connected Integrations */}
      {activeTab === 'connected' && (
        <div className="space-y-4">
          {connectedIntegrations?.map(integration => (
            <div 
              key={integration?.id}
              className="bg-background border border-border rounded-lg p-6 hover:shadow-light transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${integration?.color} rounded-lg flex items-center justify-center`}>
                    <Icon name={integration?.icon} size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-text-primary">{integration?.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={getStatusIcon(integration?.status)} 
                          size={16} 
                          className={getStatusColor(integration?.status)?.split(' ')[0]}
                        />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration?.status)}`}>
                          {integration?.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mb-3">{integration?.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <span>Last sync: {integration?.lastSync}</span>
                      <span>•</span>
                      <span>{integration?.features?.length} features enabled</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="btn-outline text-sm">
                    Configure
                  </button>
                  <button className="p-2 rounded hover:bg-surface transition-colors duration-200">
                    <Icon name="MoreVertical" size={16} className="text-text-secondary" />
                  </button>
                </div>
              </div>
              
              {/* Features */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {integration?.features?.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-surface text-sm rounded-full border border-border"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Integrations */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Popular Integrations */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">Popular Integrations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableIntegrations?.filter(integration => integration?.popular)?.map(integration => (
                <div 
                  key={integration?.id}
                  className="bg-background border border-border rounded-lg p-6 hover:shadow-light transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 ${integration?.color} rounded-lg flex items-center justify-center`}>
                      <Icon name={integration?.icon} size={20} className="text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-text-primary">{integration?.name}</h5>
                      <p className="text-xs text-text-secondary">{integration?.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-4">{integration?.description}</p>
                  
                  <button className="w-full btn-primary text-sm">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* All Integrations */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">All Available Integrations</h4>
            <div className="space-y-3">
              {availableIntegrations?.map(integration => (
                <div 
                  key={integration?.id}
                  className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:shadow-light transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${integration?.color} rounded flex items-center justify-center`}>
                      <Icon name={integration?.icon} size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-text-primary">{integration?.name}</h5>
                        {integration?.popular && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{integration?.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-text-secondary px-2 py-1 bg-surface rounded">
                      {integration?.category}
                    </span>
                    <button className="btn-outline text-sm">
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-background border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold text-text-primary mb-4">Webhook Configuration</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Webhook URL</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="https://your-app.com/webhooks/performancehub" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Secret Key</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Enter webhook secret" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Events</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Goal Created', 'Goal Updated', 'Goal Completed',
                    'Review Started', 'Review Completed', 'Feedback Submitted',
                    'User Created', 'User Updated', 'Team Changes'
                  ]?.map(event => (
                    <label key={event} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-text-primary">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button className="btn-outline">Test Webhook</button>
                <button className="btn-primary">Save Configuration</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-border w-full max-w-3xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">API Keys Management</h3>
              <button 
                onClick={() => setShowApiModal(false)}
                className="p-2 rounded hover:bg-background transition-colors duration-200"
              >
                <Icon name="X" size={20} className="text-text-secondary" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {apiKeys?.map(key => (
                  <div key={key?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{key?.name}</h4>
                      <p className="text-sm text-text-secondary font-mono">{key?.keyPreview}</p>
                      <div className="flex items-center space-x-4 text-xs text-text-secondary mt-2">
                        <span>Created: {new Date(key?.created)?.toLocaleDateString()}</span>
                        <span>Last used: {new Date(key?.lastUsed)?.toLocaleDateString()}</span>
                        <span>Permissions: {key?.permissions?.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        key?.status === 'active' ? 'text-success bg-success/10' : 'text-text-secondary bg-background'
                      }`}>
                        {key?.status}
                      </span>
                      <button className="p-1 rounded hover:bg-background transition-colors duration-200">
                        <Icon name="Copy" size={16} className="text-text-secondary" />
                      </button>
                      <button className="p-1 rounded hover:bg-background transition-colors duration-200">
                        <Icon name="MoreVertical" size={16} className="text-text-secondary" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button className="btn-primary flex items-center space-x-2">
                  <Icon name="Plus" size={16} />
                  <span>Generate New Key</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;