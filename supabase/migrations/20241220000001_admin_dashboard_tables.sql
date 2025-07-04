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

-- Create export_history table for data export tracking
CREATE TABLE IF NOT EXISTS public.export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_type TEXT NOT NULL, -- users, goals, reviews, feedback, analytics
    format TEXT NOT NULL, -- csv, json, excel, pdf
    record_count INTEGER DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    filters JSONB DEFAULT '{}',
    status TEXT DEFAULT 'completed', -- pending, completed, failed
    error_message TEXT,
    file_url TEXT, -- Optional: store file location if keeping exports
    exported_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create scheduled_reports table for automated reporting
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL, -- users, goals, reviews, analytics, custom
    format TEXT NOT NULL DEFAULT 'csv', -- csv, json, excel, pdf
    schedule_pattern TEXT NOT NULL, -- cron-like pattern: '0 9 * * 1' for Monday 9 AM
    filters JSONB DEFAULT '{}',
    recipients TEXT[] DEFAULT '{}', -- Email addresses to send reports to
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create security_logs table for security event tracking
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- login_attempt, login_failed, suspicious_activity, etc.
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    severity TEXT DEFAULT 'info' -- info, warning, error, critical
);

-- Create failed_login_attempts table for tracking login failures
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    failure_reason TEXT -- invalid_password, account_locked, etc.
);

-- Create rate_limits table for tracking API rate limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- user_id, ip_address, etc.
    action TEXT NOT NULL, -- api_call, login_attempt, etc.
    attempts INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create performance_metrics table for detailed performance tracking
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL, -- page_load, api_call, custom_timing, business_event
    data JSONB NOT NULL DEFAULT '{}',
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics_sessions table for session-based analytics
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    metrics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create error_logs table for detailed error tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL, -- javascript_error, promise_rejection, api_error
    error_data JSONB NOT NULL DEFAULT '{}',
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    severity TEXT DEFAULT 'error', -- info, warning, error, critical
    resolved BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create health_checks table for system health monitoring
CREATE TABLE IF NOT EXISTS public.health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    status TEXT NOT NULL, -- healthy, degraded, unhealthy
    response_time_ms INTEGER,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add organization_id to user_profiles for multi-tenant support
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Add notification preferences column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}' NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON public.email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON public.user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_export_history_exported_by ON public.export_history(exported_by);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON public.export_history(created_at);
CREATE INDEX IF NOT EXISTS idx_export_history_type ON public.export_history(export_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_is_active ON public.scheduled_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON public.scheduled_reports(next_run_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON public.security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON public.failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_time ON public.failed_login_attempts(attempt_time);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits(expires_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON public.performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session ON public.performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON public.analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_updated_at ON public.analytics_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON public.error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON public.error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_health_checks_service ON public.health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_health_checks_timestamp ON public.health_checks(timestamp);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON public.health_checks(status);

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
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

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

-- Export history - users can see their own exports, admins can see all
CREATE POLICY "export_history_access" ON public.export_history
    FOR SELECT USING (
        exported_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Export history - only admins can create exports
CREATE POLICY "export_history_admin_create" ON public.export_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Scheduled reports - admins only
CREATE POLICY "scheduled_reports_admin_access" ON public.scheduled_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Security logs - admins only
CREATE POLICY "security_logs_admin_read" ON public.security_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Security logs - system can insert
CREATE POLICY "security_logs_system_insert" ON public.security_logs
    FOR INSERT WITH CHECK (true);

-- Failed login attempts - admins only
CREATE POLICY "failed_login_attempts_admin_access" ON public.failed_login_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('hr', 'executive')
        )
    );

-- Rate limits - system access only
CREATE POLICY "rate_limits_system_access" ON public.rate_limits
    FOR ALL USING (true);

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