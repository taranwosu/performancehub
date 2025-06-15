// src/pages/settings-administration/components/OrganizationManagement.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';

const OrganizationManagement = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    departments: 0,
    storageUsed: '0 MB'
  });

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    domain: '',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    language: 'en',
    subscription_plan: 'basic',
    max_users: 100
  });

  useEffect(() => {
    loadOrganizationData();
    loadStats();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)
        .single();

      if (orgError && orgError.code !== 'PGRST116') {
        console.error('Error loading organization:', orgError);
        return;
      }

      if (orgData) {
        setOrganization(orgData);
        setFormData({
          name: orgData.name || '',
          logo_url: orgData.logo_url || '',
          domain: orgData.domain || '',
          timezone: orgData.timezone || 'UTC',
          date_format: orgData.date_format || 'MM/DD/YYYY',
          language: orgData.language || 'en',
          subscription_plan: orgData.subscription_plan || 'basic',
          max_users: orgData.max_users || 100
        });
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: userStats, error: userError } = await supabase
        .from('user_profiles')
        .select('id, is_active, department')
        .not('department', 'is', null);

      if (userError) {
        console.error('Error loading user stats:', userError);
        return;
      }

      const totalUsers = userStats?.length || 0;
      const activeUsers = userStats?.filter(user => user.is_active)?.length || 0;
      const departments = new Set(userStats?.map(user => user.department).filter(Boolean)).size;

      setStats({
        totalUsers,
        activeUsers,
        departments,
        storageUsed: '15.2 MB'
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (organization) {
        const { error } = await supabase
          .from('organizations')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', organization.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('organizations')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;
        setOrganization(data);
      }

      alert('Organization settings saved successfully!');
    } catch (error) {
      console.error('Error saving organization:', error);
      alert('Failed to save organization settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Users</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalUsers}</p>
            </div>
            <Icon name="Users" size={24} className="text-primary" />
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Users</p>
              <p className="text-2xl font-bold text-text-primary">{stats.activeUsers}</p>
            </div>
            <Icon name="UserCheck" size={24} className="text-success" />
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Departments</p>
              <p className="text-2xl font-bold text-text-primary">{stats.departments}</p>
            </div>
            <Icon name="Building" size={24} className="text-accent" />
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Storage Used</p>
              <p className="text-2xl font-bold text-text-primary">{stats.storageUsed}</p>
            </div>
            <Icon name="Database" size={24} className="text-warning" />
          </div>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-6">Organization Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Domain
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="form-input"
              placeholder="example.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              className="form-input"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="form-input"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Date Format
            </label>
            <select
              value={formData.date_format}
              onChange={(e) => handleInputChange('date_format', e.target.value)}
              className="form-input"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          {saving ? (
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
  );
};

export default OrganizationManagement;
