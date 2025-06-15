// src/pages/settings-administration/components/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';

const SystemSettings = () => {
  const { supabase } = useSupabase();
  const [activeSection, setActiveSection] = useState('organization');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Organization Settings
    organizationName: 'PerformanceHub',
    organizationLogo: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    
    // Notification Settings
    emailNotifications: true,
    slackNotifications: false,
    pushNotifications: true,
    weeklyDigest: true,
    reviewReminders: true,
    goalDeadlineAlerts: true,
    
    // Performance Management
    reviewCycleFrequency: 'quarterly',
    goalTrackingMethod: 'percentage',
    feedbackAnonymous: true,
    managerApprovalRequired: true,
    
    // Security Settings
    sessionTimeout: '30',
    passwordPolicy: 'strong',
    twoFactorAuth: false,
    maxLoginAttempts: '5',
    
    // Data & Backup
    dataRetention: '7',
    backupFrequency: 'daily',
    exportFormat: 'excel',
    
    // Compliance
    gdprCompliance: true,
    auditTrail: true,
    dataEncryption: true
  });

  const sections = [
    { id: 'organization', label: 'Organization', icon: 'Building' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'performance', label: 'Performance', icon: 'Target' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'data', label: 'Data & Backup', icon: 'Database' },
    { id: 'compliance', label: 'Compliance', icon: 'FileCheck' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from Supabase
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setSettings(prev => ({ ...prev, ...JSON.parse(data.settings || '{}') }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('system_settings')
          .update({
            settings: JSON.stringify(settings),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('system_settings')
          .insert({
            settings: JSON.stringify(settings)
          });

        if (error) throw error;
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderOrganizationSection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Organization Information</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Organization Name</label>
            <input
              type="text"
              value={settings.organizationName}
              onChange={(e) => handleSettingChange('organizationName', e.target.value)}
              className="form-input"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Logo URL</label>
            <input
              type="url"
              value={settings.organizationLogo}
              onChange={(e) => handleSettingChange('organizationLogo', e.target.value)}
              className="form-input"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="form-input"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Date Format</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                className="form-input"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
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
              <input 
                type="checkbox" 
                checked={settings.reviewReminders}
                onChange={(e) => handleSettingChange('reviewReminders', e.target.checked)}
                className="sr-only peer" 
              />
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
                checked={settings.weeklyDigest}
                onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Goal Deadline Alerts</label>
              <p className="text-sm text-text-secondary">Notify when goal deadlines are approaching</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.goalDeadlineAlerts}
                onChange={(e) => handleSettingChange('goalDeadlineAlerts', e.target.checked)}
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
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceSection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Review Cycles</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Review Frequency</label>
            <select
              value={settings.reviewCycleFrequency}
              onChange={(e) => handleSettingChange('reviewCycleFrequency', e.target.value)}
              className="form-input"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="bi-annual">Bi-Annual</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Goal Tracking Method</label>
            <select
              value={settings.goalTrackingMethod}
              onChange={(e) => handleSettingChange('goalTrackingMethod', e.target.value)}
              className="form-input"
            >
              <option value="percentage">Percentage (0-100%)</option>
              <option value="okr">OKR Style (0.0-1.0)</option>
              <option value="milestone">Milestone Based</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Anonymous Feedback</label>
              <p className="text-sm text-text-secondary">Allow anonymous feedback submission</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.feedbackAnonymous}
                onChange={(e) => handleSettingChange('feedbackAnonymous', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Manager Approval Required</label>
              <p className="text-sm text-text-secondary">Require manager approval for goal completion</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.managerApprovalRequired}
                onChange={(e) => handleSettingChange('managerApprovalRequired', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Authentication & Access</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              className="form-input"
              min="5"
              max="480"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Password Policy</label>
            <select
              value={settings.passwordPolicy}
              onChange={(e) => handleSettingChange('passwordPolicy', e.target.value)}
              className="form-input"
            >
              <option value="basic">Basic (8+ characters)</option>
              <option value="medium">Medium (8+ chars, mixed case)</option>
              <option value="strong">Strong (8+ chars, mixed case, numbers, symbols)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Max Login Attempts</label>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
              className="form-input"
              min="3"
              max="10"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Two-Factor Authentication</label>
              <p className="text-sm text-text-secondary">Require 2FA for all users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.twoFactorAuth}
                onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
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
        <h4 className="text-lg font-semibold text-text-primary mb-4">Data Management</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Data Retention (years)</label>
            <select
              value={settings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
              className="form-input"
            >
              <option value="1">1 Year</option>
              <option value="3">3 Years</option>
              <option value="5">5 Years</option>
              <option value="7">7 Years</option>
              <option value="10">10 Years</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Backup Frequency</label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="form-input"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Export Format</label>
            <select
              value={settings.exportFormat}
              onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
              className="form-input"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="json">JSON (.json)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplianceSection = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Compliance & Privacy</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">GDPR Compliance</label>
              <p className="text-sm text-text-secondary">Enable GDPR compliance features</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.gdprCompliance}
                onChange={(e) => handleSettingChange('gdprCompliance', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Audit Trail</label>
              <p className="text-sm text-text-secondary">Log all user actions for auditing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.auditTrail}
                onChange={(e) => handleSettingChange('auditTrail', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-text-primary">Data Encryption</label>
              <p className="text-sm text-text-secondary">Encrypt sensitive data at rest</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.dataEncryption}
                onChange={(e) => handleSettingChange('dataEncryption', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'organization':
        return renderOrganizationSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'performance':
        return renderPerformanceSection();
      case 'security':
        return renderSecuritySection();
      case 'data':
        return renderDataSection();
      case 'compliance':
        return renderComplianceSection();
      default:
        return renderOrganizationSection();
    }
  };

  return (
    <div className="p-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors duration-200 ${
              activeSection === section.id
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            <Icon name={section.icon} size={16} />
            <span className="font-medium">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {renderContent()}

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-border">
          <button 
            onClick={saveSettings}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="Save" size={16} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;