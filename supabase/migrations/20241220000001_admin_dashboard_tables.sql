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
 '<h2>New Goal Created</h2><p>A new goal "{{goal_title}}" has been created for you.</p><p><strong>Description:</strong> {{goal_description}}</p><p><strong>Due Date:</strong> {{due_date}}</p><p><a href="{{app_url}}/goals-management">View Goals</a></p>',
 '["goal_title", "goal_description", "due_date", "app_url"]'::jsonb),

('review_reminder', 'email', 'Performance Review Reminder',
 '<h2>Performance Review Reminder</h2><p>Your performance review is due soon.</p><p><strong>Review Period:</strong> {{review_period}}</p><p><strong>Due Date:</strong> {{due_date}}</p><p><a href="{{app_url}}/performance-reviews">Complete Review</a></p>',
 '["review_period", "due_date", "app_url"]'::jsonb),

('weekly_digest', 'email', 'Weekly Performance Digest',
 '<h2>Weekly Performance Summary</h2><p>Here\'s your team\'s performance summary for this week:</p><ul><li>Goals Completed: {{goals_completed}}</li><li>Reviews Submitted: {{reviews_submitted}}</li><li>Feedback Given: {{feedback_count}}</li></ul><p><a href="{{app_url}}/dashboard">View Dashboard</a></p>',
 '["goals_completed", "reviews_submitted", "feedback_count", "app_url"]'::jsonb)

ON CONFLICT DO NOTHING;

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