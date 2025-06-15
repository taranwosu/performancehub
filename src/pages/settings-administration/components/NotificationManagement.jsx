import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';

const NotificationManagement = () => {
  const { supabase } = useSupabase();
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [emailQueue, setEmailQueue] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const tabs = [
    { id: 'templates', label: 'Email Templates', icon: 'FileTemplate' },
    { id: 'queue', label: 'Email Queue', icon: 'Clock' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'templates') {
        await loadTemplates();
      } else if (activeTab === 'queue') {
        await loadEmailQueue();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading templates:', error);
      return;
    }

    setTemplates(data || []);
  };

  const loadEmailQueue = async () => {
    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading email queue:', error);
      return;
    }

    setEmailQueue(data || []);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Email Templates</h3>
          <p className="text-sm text-text-secondary">Manage email templates for automated notifications</p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowTemplateModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={16} className="text-primary" />
                <h4 className="font-medium text-text-primary">{template.name}</h4>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-3">{template.subject}</p>
            
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className={`px-2 py-1 rounded-full ${
                template.is_active ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                {template.is_active ? 'Active' : 'Inactive'}
              </span>
              <span>{template.type.toUpperCase()}</span>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingTemplate(template);
                  setShowTemplateModal(true);
                }}
                className="flex-1 btn-outline text-sm py-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="p-1 text-error hover:bg-error/10 rounded"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <div className="text-center py-12">
          <Icon name="FileTemplate" size={48} className="mx-auto text-text-secondary mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No templates yet</h3>
          <p className="text-text-secondary mb-4">Create your first email template to get started</p>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="btn-primary"
          >
            Create Template
          </button>
        </div>
      )}
    </div>
  );

  const renderQueueTab = () => (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Email Queue</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Recipient</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Subject</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {emailQueue.map((email) => (
                <tr key={email.id} className="border-b border-border hover:bg-background/50">
                  <td className="py-3 px-4 text-sm text-text-primary">{email.to_email}</td>
                  <td className="py-3 px-4 text-sm text-text-primary">{email.subject}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      email.status === 'sent' ? 'bg-success/10 text-success' :
                      email.status === 'failed' ? 'bg-error/10 text-error' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {email.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {new Date(email.scheduled_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {emailQueue.length === 0 && !loading && (
          <div className="text-center py-8">
            <Icon name="Inbox" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No emails in queue</p>
          </div>
        )}
      </div>
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
      case 'templates':
        return renderTemplatesTab();
      case 'queue':
        return renderQueueTab();
      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">Notification Settings</h3>
            <div className="bg-background border border-border rounded-lg p-6">
              <p className="text-text-secondary">Global notification settings will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return renderTemplatesTab();
    }
  };

  return (
    <div className="p-6">
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

      {renderContent()}

      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          isOpen={showTemplateModal}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
          onSave={() => {
            loadTemplates();
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

const TemplateModal = ({ template, isOpen, onClose, onSave }) => {
  const { supabase } = useSupabase();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'email',
    subject: template?.subject || '',
    template_body: template?.template_body || '',
    variables: template?.variables || ['app_url'],
    is_active: template?.is_active !== false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (template) {
        const { error } = await supabase
          .from('notification_templates')
          .update(formData)
          .eq('id', template.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_templates')
          .insert(formData);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              {template ? 'Edit Template' : 'Create Email Template'}
            </h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <Icon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Template Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Subject Line</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="form-input"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email Template</label>
              <textarea
                required
                value={formData.template_body}
                onChange={(e) => setFormData(prev => ({ ...prev, template_body: e.target.value }))}
                className="form-input h-64"
                placeholder="Enter email HTML template"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-text-primary">Active Template</label>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary"
              >
                {saving ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
