// src/pages/settings-administration/components/SystemSettings.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SystemSettings = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    pushNotifications: true,
    weeklyDigest: true,
    dataRetention: '7-years',
    backupFrequency: 'daily',
    twoFactorAuth: true,
    sessionTimeout: '30-minutes',
    passwordPolicy: 'strong',
    loginAttempts: '5'
  });

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'data', label: 'Data & Backup', icon: 'Database' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'system', label: 'System', icon: 'Settings' },
    { id: 'compliance', label: 'Compliance', icon: 'FileCheck' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Email Notifications</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Goal Updates</label>
              <p className="text-sm text-text-secondary">Notify users when goals are created, updated, or completed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings?.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e?.target?.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Review Reminders</label>
              <p className="text-sm text-text-secondary">Send reminders for upcoming performance reviews</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Weekly Digest</label>
              <p className="text-sm text-text-secondary">Weekly summary of team performance and activities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings?.weeklyDigest}
                onChange={(e) => handleSettingChange('weeklyDigest', e?.target?.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Push Notifications</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Browser Notifications</label>
              <p className="text-sm text-text-secondary">Show desktop notifications in browser</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings?.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e?.target?.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Slack Integration</label>
              <p className="text-sm text-text-secondary">Send notifications to Slack channels</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings?.slackNotifications}
                onChange={(e) => handleSettingChange('slackNotifications', e?.target?.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Data Retention</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Retention Period</label>
            <select 
              value={settings?.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', e?.target?.value)}
              className="input-field w-full md:w-auto"
            >
              <option value="1-year">1 Year</option>
              <option value="3-years">3 Years</option>
              <option value="5-years">5 Years</option>
              <option value="7-years">7 Years</option>
              <option value="indefinite">Indefinite</option>
            </select>
            <p className="text-sm text-text-secondary mt-1">How long to keep user data and performance records</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Backup Frequency</label>
            <select 
              value={settings?.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e?.target?.value)}
              className="input-field w-full md:w-auto"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="text-sm text-text-secondary mt-1">Frequency of automated data backups</p>
          </div>
        </div>
      </div>
      
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Data Export</h4>
        
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Export system data for backup or migration purposes</p>
          
          <div className="flex flex-wrap gap-3">
            <button className="btn-outline flex items-center space-x-2">
              <Icon name="Download" size={16} />
              <span>Export Users</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <Icon name="Download" size={16} />
              <span>Export Goals</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <Icon name="Download" size={16} />
              <span>Export Reviews</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <Icon name="Download" size={16} />
              <span>Full Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Authentication</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Two-Factor Authentication</label>
              <p className="text-sm text-text-secondary">Require 2FA for all users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings?.twoFactorAuth}
                onChange={(e) => handleSettingChange('twoFactorAuth', e?.target?.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Session Timeout</label>
            <select 
              value={settings?.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', e?.target?.value)}
              className="input-field w-full md:w-auto"
            >
              <option value="15-minutes">15 Minutes</option>
              <option value="30-minutes">30 Minutes</option>
              <option value="1-hour">1 Hour</option>
              <option value="4-hours">4 Hours</option>
              <option value="8-hours">8 Hours</option>
            </select>
            <p className="text-sm text-text-secondary mt-1">Automatic logout after inactivity</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Password Policy</label>
            <select 
              value={settings?.passwordPolicy}
              onChange={(e) => handleSettingChange('passwordPolicy', e?.target?.value)}
              className="input-field w-full md:w-auto"
            >
              <option value="basic">Basic (8+ characters)</option>
              <option value="strong">Strong (12+ chars, mixed case, numbers)</option>
              <option value="complex">Complex (16+ chars, symbols required)</option>
            </select>
            <p className="text-sm text-text-secondary mt-1">Password requirements for user accounts</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Failed Login Attempts</label>
            <select 
              value={settings?.loginAttempts}
              onChange={(e) => handleSettingChange('loginAttempts', e?.target?.value)}
              className="input-field w-full md:w-auto"
            >
              <option value="3">3 Attempts</option>
              <option value="5">5 Attempts</option>
              <option value="10">10 Attempts</option>
              <option value="unlimited">Unlimited</option>
            </select>
            <p className="text-sm text-text-secondary mt-1">Account lockout after failed attempts</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">System Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-text-secondary">Version</label>
            <p className="text-lg font-semibold text-text-primary">2.1.4</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Environment</label>
            <p className="text-lg font-semibold text-text-primary">Production</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Uptime</label>
            <p className="text-lg font-semibold text-text-primary">15 days, 4 hours</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Last Update</label>
            <p className="text-lg font-semibold text-text-primary">Jan 15, 2024</p>
          </div>
        </div>
      </div>
      
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Maintenance</h4>
        
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">System maintenance and administrative actions</p>
          
          <div className="flex flex-wrap gap-3">
            <button className="btn-outline flex items-center space-x-2">
              <Icon name="RefreshCw" size={16} />
              <span>Clear Cache</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <Icon name="Database" size={16} />
              <span>Optimize Database</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <Icon name="FileText" size={16} />
              <span>View Logs</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <Icon name="Download" size={16} />
              <span>System Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplianceSection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">GDPR Compliance</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Data Processing Consent</label>
              <p className="text-sm text-text-secondary">Require explicit consent for data processing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Right to be Forgotten</label>
              <p className="text-sm text-text-secondary">Allow users to request data deletion</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Data Portability</label>
              <p className="text-sm text-text-secondary">Enable data export for users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Audit & Logging</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">User Activity Logging</label>
              <p className="text-sm text-text-secondary">Log all user actions for audit trail</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Admin Actions</label>
              <p className="text-sm text-text-secondary">Track administrative changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'notifications':
        return renderNotificationsSection();
      case 'data':
        return renderDataSection();
      case 'security':
        return renderSecuritySection();
      case 'system':
        return renderSystemSection();
      case 'compliance':
        return renderComplianceSection();
      default:
        return renderNotificationsSection();
    }
  };

  return (
    <div className="p-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections?.map(section => (
          <button
            key={section?.id}
            onClick={() => setActiveSection(section?.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeSection === section?.id
                ? 'bg-primary text-white' :'bg-background text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Icon name={section?.icon} size={16} />
            <span>{section?.label}</span>
          </button>
        ))}
      </div>

      {/* Section Content */}
      {renderSectionContent()}

      {/* Save Button */}
      <div className="flex justify-end mt-8 pt-6 border-t border-border">
        <div className="flex items-center space-x-3">
          <button className="btn-outline">Reset to Defaults</button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;