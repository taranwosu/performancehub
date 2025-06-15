-- supabase/migrations/20241220000001_admin_dashboard_tables.sql

-- Create system_settings table for storing application configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Create organizations table for multi-tenant support
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    domain TEXT,
    timezone TEXT DEFAULT 'UTC',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    language TEXT DEFAULT 'en',
    subscription_plan TEXT DEFAULT 'basic',
    subscription_status TEXT DEFAULT 'active',
    max_users INTEGER DEFAULT 100,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- email, push, slack
    subject TEXT,
    template_body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table for compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create email_queue table for notification management
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email TEXT NOT NULL,
    cc_emails TEXT[],
    bcc_emails TEXT[],
    subject TEXT NOT NULL,
    body_html TEXT,
    body_text TEXT,
    template_id UUID REFERENCES public.notification_templates(id),
    template_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
    priority INTEGER DEFAULT 5, -- 1-10, 1 being highest priority
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add organization_id to user_profiles for multi-tenant support
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON public.email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON public.user_profiles(organization_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON public.email_queue 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- System settings - only admins can access
CREATE POLICY "system_settings_admin_access" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Organizations - users can only see their own organization
CREATE POLICY "organizations_user_access" ON public.organizations
    FOR SELECT USING (
        id = (
            SELECT organization_id FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid()
        )
    );

-- Organizations - only admins can modify
CREATE POLICY "organizations_admin_modify" ON public.organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
            AND user_profiles.organization_id = organizations.id
        )
    );

-- Audit logs - users can see their own actions, admins can see all
CREATE POLICY "audit_logs_access" ON public.audit_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Notification templates - all authenticated users can read, admins can modify
CREATE POLICY "notification_templates_read" ON public.notification_templates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "notification_templates_admin_modify" ON public.notification_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Email queue - admins only
CREATE POLICY "email_queue_admin_access" ON public.email_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Insert default system settings
INSERT INTO public.system_settings (settings, created_by) 
VALUES (
    '{
        "organizationName": "PerformanceHub",
        "timezone": "UTC",
        "dateFormat": "MM/DD/YYYY",
        "language": "en",
        "emailNotifications": true,
        "reviewReminders": true,
        "weeklyDigest": true,
        "goalDeadlineAlerts": true,
        "pushNotifications": true,
        "reviewCycleFrequency": "quarterly",
        "goalTrackingMethod": "percentage",
        "feedbackAnonymous": true,
        "managerApprovalRequired": true,
        "sessionTimeout": "30",
        "passwordPolicy": "strong",
        "twoFactorAuth": false,
        "maxLoginAttempts": "5",
        "dataRetention": "7",
        "backupFrequency": "daily",
        "exportFormat": "excel",
        "gdprCompliance": true,
        "auditTrail": true,
        "dataEncryption": true
    }'::jsonb,
    (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Insert default organization
INSERT INTO public.organizations (name, domain, max_users) 
VALUES ('Default Organization', 'example.com', 100)
ON CONFLICT DO NOTHING;

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, subject, template_body, variables) VALUES
('goal_created', 'email', 'New Goal Created: {{goal_title}}', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #3B82F6; margin-bottom: 20px;">🎯 New Goal Created</h2>
    <p>Hello <strong>{{user_name}}</strong>,</p>
    <p>A new goal has been created for you:</p>
    
    <div style="background: #F8FAFC; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1E293B;">{{goal_title}}</h3>
        <p style="margin: 0; color: #64748B;">{{goal_description}}</p>
        <p style="margin: 10px 0 0 0; font-weight: bold; color: #1E293B;">Due Date: {{due_date}}</p>
    </div>
    
    <p>You can view and update your goal progress at any time by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/goals-management" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Goals</a>
    </div>
    
    <p>Best regards,<br>PerformanceHub Team</p>
  </div>',
 '["user_name", "goal_title", "goal_description", "due_date", "app_url"]'::jsonb),

('review_reminder', 'email', 'Performance Review Reminder - Due {{due_date}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #D97706; margin-bottom: 20px;">📋 Performance Review Reminder</h2>
    <p>Hello <strong>{{user_name}}</strong>,</p>
    <p>This is a friendly reminder that your performance review is due soon.</p>
    
    <div style="background: #FEF3C7; border-left: 4px solid #D97706; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Review Period:</strong> {{review_period}}</p>
        <p style="margin: 5px 0 0 0;"><strong>Due Date:</strong> {{due_date}}</p>
    </div>
    
    <p>Please complete your review at your earliest convenience to ensure timely feedback and development planning.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/performance-reviews" style="background: #D97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Review</a>
    </div>
    
    <p>If you have any questions or need assistance, please don\'t hesitate to reach out to your manager or HR team.</p>
    
    <p>Best regards,<br>PerformanceHub Team</p>
  </div>',
 '["user_name", "review_period", "due_date", "app_url"]'::jsonb),

('weekly_digest', 'email', 'Weekly Performance Digest - {{week_start}} to {{week_end}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #059669; margin-bottom: 20px;">📊 Weekly Performance Summary</h2>
    <p>Hello <strong>{{user_name}}</strong>,</p>
    <p>Here\'s your performance summary for this week:</p>
    
    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #065F46;">This Week\'s Achievements</h3>
        <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">✅ <strong>{{goals_completed}}</strong> goals completed</li>
            <li style="margin-bottom: 8px;">📝 <strong>{{reviews_submitted}}</strong> reviews submitted</li>
            <li style="margin-bottom: 8px;">💬 <strong>{{feedback_count}}</strong> feedback items received</li>
        </ul>
    </div>
    
    <p>Keep up the great work! Your consistent effort contributes to our team\'s success.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/dashboard" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Dashboard</a>
    </div>
    
    <p>Best regards,<br>PerformanceHub Team</p>
  </div>',
 '["user_name", "goals_completed", "reviews_submitted", "feedback_count", "week_start", "week_end", "app_url"]'::jsonb),

('user_welcome', 'email', 'Welcome to PerformanceHub - Your Account is Ready!',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #3B82F6; margin-bottom: 20px;">🎉 Welcome to PerformanceHub!</h2>
    <p>Hello <strong>{{user_name}}</strong>,</p>
    <p>Welcome to PerformanceHub! Your account has been created and you can now access your performance management dashboard.</p>
    
    <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1E40AF;">Your Login Information</h3>
        <p style="margin: 0;"><strong>Login URL:</strong> <a href="{{login_url}}">{{login_url}}</a></p>
        <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> {{temp_password}}</p>
    </div>
    
    <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
    
    <h3 style="color: #374151;">What you can do with PerformanceHub:</h3>
    <ul style="color: #4B5563;">
        <li>Track and manage your goals</li>
        <li>Participate in performance reviews</li>
        <li>Give and receive feedback</li>
        <li>View team analytics and progress</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{login_url}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to PerformanceHub</a>
    </div>
    
    <p>If you have any questions or need assistance getting started, please don\'t hesitate to reach out to our support team.</p>
    
    <p>Best regards,<br>PerformanceHub Team</p>
  </div>',
 '["user_name", "temp_password", "app_url", "login_url"]'::jsonb),

('goal_deadline_reminder', 'email', '⏰ Goal Deadline Reminder: {{goal_title}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #DC2626; margin-bottom: 20px;">⏰ Goal Deadline Approaching</h2>
    <p>Hello <strong>{{user_name}}</strong>,</p>
    <p>This is a reminder that one of your goals is approaching its deadline:</p>
    
    <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #991B1B;">{{goal_title}}</h3>
        <p style="margin: 0; color: #7F1D1D;">Due in {{days_remaining}} days ({{due_date}})</p>
        <p style="margin: 10px 0 0 0; color: #7F1D1D;"><strong>Current Progress:</strong> {{progress}}%</p>
    </div>
    
    <p>Please review your goal and update your progress. If you need assistance or expect delays, consider reaching out to your manager.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/goals-management" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Update Goal Progress</a>
    </div>
    
    <p>Best regards,<br>PerformanceHub Team</p>
  </div>',
 '["user_name", "goal_title", "due_date", "days_remaining", "progress", "app_url"]'::jsonb)

ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  template_body = EXCLUDED.template_body,
  variables = EXCLUDED.variables,
  updated_at = CURRENT_TIMESTAMP;

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_audit_log(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue email notifications
CREATE OR REPLACE FUNCTION public.queue_email(
    p_to_email TEXT,
    p_subject TEXT,
    p_body_html TEXT DEFAULT NULL,
    p_body_text TEXT DEFAULT NULL,
    p_template_id UUID DEFAULT NULL,
    p_template_data JSONB DEFAULT '{}'::jsonb,
    p_priority INTEGER DEFAULT 5,
    p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) RETURNS UUID AS $$
DECLARE
    email_id UUID;
BEGIN
    INSERT INTO public.email_queue (
        to_email,
        subject,
        body_html,
        body_text,
        template_id,
        template_data,
        priority,
        scheduled_at
    ) VALUES (
        p_to_email,
        p_subject,
        p_body_html,
        p_body_text,
        p_template_id,
        p_template_data,
        p_priority,
        p_scheduled_at
    ) RETURNING id INTO email_id;
    
    RETURN email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;