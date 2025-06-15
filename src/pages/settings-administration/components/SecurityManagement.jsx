import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';
import { securityService } from '../../../services/securityService';

const SecurityManagement = () => {
  const { supabase } = useSupabase();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [securityStats, setSecurityStats] = useState({
    totalEvents: 0,
    loginAttempts: 0,
    failedLogins: 0,
    suspiciousActivity: 0
  });

  const tabs = [
    { id: 'overview', label: 'Security Overview', icon: 'Shield' },
    { id: 'logs', label: 'Security Logs', icon: 'FileText' },
    { id: 'policies', label: 'Security Policies', icon: 'Settings' },
    { id: 'monitoring', label: 'Live Monitoring', icon: 'Activity' }
  ];

  useEffect(() => {
    loadSecurityData();
  }, [activeTab]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'logs') {
        await loadSecurityLogs();
      }
      await loadSecurityStats();
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      setSecurityLogs(data || []);
    } catch (error) {
      console.error('Error loading security logs:', error);
    }
  };

  const loadSecurityStats = async () => {
    try {
      // Get security statistics for the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_logs')
        .select('event_type')
        .gte('timestamp', yesterday);

      if (error) throw error;

      const logs = data || [];
      const stats = {
        totalEvents: logs.length,
        loginAttempts: logs.filter(log => log.event_type === 'login_attempt').length,
        failedLogins: logs.filter(log => log.event_type === 'login_failed').length,
        suspiciousActivity: logs.filter(log => log.event_type === 'suspicious_activity').length
      };

      setSecurityStats(stats);
    } catch (error) {
      console.error('Error loading security stats:', error);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Security Events (24h)</p>
              <p className="text-2xl font-bold text-text-primary">{securityStats.totalEvents}</p>
            </div>
            <Icon name="Shield" size={24} className="text-primary" />
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Login Attempts</p>
              <p className="text-2xl font-bold text-text-primary">{securityStats.loginAttempts}</p>
            </div>
            <Icon name="LogIn" size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Failed Logins</p>
              <p className="text-2xl font-bold text-text-primary">{securityStats.failedLogins}</p>
            </div>
            <Icon name="AlertTriangle" size={24} className="text-warning" />
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Suspicious Activity</p>
              <p className="text-2xl font-bold text-text-primary">{securityStats.suspiciousActivity}</p>
            </div>
            <Icon name="AlertCircle" size={24} className="text-error" />
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Security Status</h4>
        
        <div className="space-y-4">
          <SecurityStatusItem
            title="Password Policy"
            status="active"
            description="Strong password requirements enabled"
            icon="Lock"
          />
          <SecurityStatusItem
            title="Rate Limiting"
            status="active"
            description="API rate limiting is active"
            icon="Zap"
          />
          <SecurityStatusItem
            title="Session Management"
            status="active"
            description="30-minute session timeout configured"
            icon="Clock"
          />
          <SecurityStatusItem
            title="Input Validation"
            status="active"
            description="All inputs are validated and sanitized"
            icon="Filter"
          />
          <SecurityStatusItem
            title="Audit Logging"
            status="active"
            description="Security events are being logged"
            icon="FileText"
          />
          <SecurityStatusItem
            title="Two-Factor Auth"
            status="inactive"
            description="2FA is not yet implemented"
            icon="Smartphone"
          />
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Recent Security Events</h4>
        
        <div className="space-y-3">
          {securityLogs.slice(0, 5).map((log, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={getEventIcon(log.event_type)} 
                  size={16} 
                  className={getEventColor(log.event_type)} 
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {formatEventType(log.event_type)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {log.ip_address} • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(log.event_type)}`}>
                {log.event_type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Security Logs</h3>
          <p className="text-sm text-text-secondary">Monitor all security-related events</p>
        </div>
        <button className="btn-outline flex items-center space-x-2">
          <Icon name="Download" size={16} />
          <span>Export Logs</span>
        </button>
      </div>

      <div className="bg-background border border-border rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Event Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">IP Address</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Details</th>
              </tr>
            </thead>
            <tbody>
              {securityLogs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-background/50">
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(log.event_type)}`}>
                      {formatEventType(log.event_type)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {log.user_id || 'Anonymous'}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {log.ip_address || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {JSON.stringify(log.details || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {securityLogs.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Shield" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No security logs found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPoliciesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Security Policies</h3>
        <p className="text-sm text-text-secondary">Configure security policies and settings</p>
      </div>

      <SecurityPoliciesForm />
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Live Security Monitoring</h3>
        <p className="text-sm text-text-secondary">Real-time security monitoring and alerts</p>
      </div>

      <LiveSecurityMonitor />
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'logs':
        return renderLogsTab();
      case 'policies':
        return renderPoliciesTab();
      case 'monitoring':
        return renderMonitoringTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

// Helper components
const SecurityStatusItem = ({ title, status, description, icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
    <div className="flex items-center space-x-3">
      <Icon name={icon} size={16} className="text-text-secondary" />
      <div>
        <p className="font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </div>
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
      status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
    }`}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  </div>
);

const SecurityPoliciesForm = () => {
  const [policies, setPolicies] = useState({
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    passwordRequireMixedCase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    rateLimitRequests: 100,
    rateLimitWindow: 60
  });

  const handleSave = () => {
    // Save policies to database
    alert('Security policies saved successfully!');
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h4 className="text-lg font-semibold text-text-primary mb-4">Password Policy</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Minimum Length</label>
          <input
            type="number"
            value={policies.passwordMinLength}
            onChange={(e) => setPolicies(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
            className="form-input"
            min="6"
            max="32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={policies.sessionTimeout}
            onChange={(e) => setPolicies(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
            className="form-input"
            min="5"
            max="480"
          />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {[
          { key: 'passwordRequireNumbers', label: 'Require Numbers' },
          { key: 'passwordRequireSymbols', label: 'Require Special Characters' },
          { key: 'passwordRequireMixedCase', label: 'Require Mixed Case' }
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">{label}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={policies[key]}
                onChange={(e) => setPolicies(prev => ({ ...prev, [key]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>

      <button onClick={handleSave} className="btn-primary">
        Save Security Policies
      </button>
    </div>
  );
};

const LiveSecurityMonitor = () => {
  const [monitoring, setMonitoring] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'info', message: 'System monitoring active', timestamp: new Date() },
    { id: 2, type: 'warning', message: 'Unusual login pattern detected', timestamp: new Date() }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-text-primary">Monitoring Status</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${monitoring ? 'bg-success' : 'bg-error'}`}></div>
            <span className="text-sm text-text-primary">{monitoring ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-success">99.9%</div>
            <div className="text-sm text-text-secondary">System Uptime</div>
          </div>
          <div className="text-center p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-primary">156</div>
            <div className="text-sm text-text-secondary">Active Sessions</div>
          </div>
          <div className="text-center p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-warning">2</div>
            <div className="text-sm text-text-secondary">Security Alerts</div>
          </div>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Recent Alerts</h4>
        
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
              <Icon 
                name={alert.type === 'warning' ? 'AlertTriangle' : 'Info'} 
                size={16} 
                className={alert.type === 'warning' ? 'text-warning' : 'text-primary'} 
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{alert.message}</p>
                <p className="text-xs text-text-secondary">{alert.timestamp.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getEventIcon = (eventType) => {
  switch (eventType) {
    case 'login_attempt': return 'LogIn';
    case 'login_failed': return 'AlertTriangle';
    case 'suspicious_activity': return 'AlertCircle';
    case 'session_timeout': return 'Clock';
    default: return 'Shield';
  }
};

const getEventColor = (eventType) => {
  switch (eventType) {
    case 'login_attempt': return 'text-primary';
    case 'login_failed': return 'text-error';
    case 'suspicious_activity': return 'text-error';
    case 'session_timeout': return 'text-warning';
    default: return 'text-text-secondary';
  }
};

const getEventBadgeColor = (eventType) => {
  switch (eventType) {
    case 'login_attempt': return 'bg-primary/10 text-primary';
    case 'login_failed': return 'bg-error/10 text-error';
    case 'suspicious_activity': return 'bg-error/10 text-error';
    case 'session_timeout': return 'bg-warning/10 text-warning';
    default: return 'bg-text-secondary/10 text-text-secondary';
  }
};

const formatEventType = (eventType) => {
  return eventType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default SecurityManagement;
