import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';

const NotificationPreferences = () => {
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email_goal_created: true,
    email_goal_deadline: true,
    email_review_reminder: true,
    email_feedback_received: true,
    email_weekly_digest: true,
    email_system_updates: true,
    push_goal_updates: true,
    push_review_reminders: true,
    push_feedback_received: true
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);

      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('notification_preferences')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (userProfile?.notification_preferences) {
        setPreferences(prev => ({
          ...prev,
          ...userProfile.notification_preferences
        }));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      alert('Notification preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const notificationCategories = [
    {
      title: 'Email Notifications',
      description: 'Manage what email notifications you receive',
      preferences: [
        {
          key: 'email_goal_created',
          label: 'Goal Created',
          description: 'When new goals are assigned to you'
        },
        {
          key: 'email_goal_deadline',
          label: 'Goal Deadlines',
          description: 'Reminders when goal deadlines are approaching'
        },
        {
          key: 'email_review_reminder',
          label: 'Review Reminders',
          description: 'Performance review due date reminders'
        },
        {
          key: 'email_feedback_received',
          label: 'Feedback Received',
          description: 'When you receive new feedback'
        },
        {
          key: 'email_weekly_digest',
          label: 'Weekly Digest',
          description: 'Weekly performance summary emails'
        }
      ]
    },
    {
      title: 'Push Notifications',
      description: 'Manage in-app and browser notifications',
      preferences: [
        {
          key: 'push_goal_updates',
          label: 'Goal Updates',
          description: 'Real-time notifications for goal changes'
        },
        {
          key: 'push_review_reminders',
          label: 'Review Reminders',
          description: 'Pop-up reminders for pending reviews'
        },
        {
          key: 'push_feedback_received',
          label: 'Feedback Alerts',
          description: 'Instant notifications for new feedback'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Notification Preferences</h3>
        <p className="text-sm text-text-secondary">
          Control how and when you receive notifications from PerformanceHub
        </p>
      </div>

      {notificationCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-background border border-border rounded-lg p-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-text-primary">{category.title}</h4>
            <p className="text-sm text-text-secondary">{category.description}</p>
          </div>

          <div className="space-y-4">
            {category.preferences.map((pref) => (
              <div key={pref.key} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-text-primary">{pref.label}</p>
                      <p className="text-sm text-text-secondary">{pref.description}</p>
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[pref.key] || false}
                    onChange={(e) => handlePreferenceChange(pref.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          onClick={savePreferences}
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
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
