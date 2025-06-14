-- supabase/migrations/20241220000000_performance_management_schema.sql

-- Create custom types
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'hr', 'executive');
CREATE TYPE goal_status AS ENUM ('draft', 'active', 'completed', 'cancelled', 'on_hold');
CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE goal_type AS ENUM ('individual', 'team', 'departmental', 'organizational');
CREATE TYPE time_period AS ENUM ('weekly', 'monthly', 'quarterly', 'bi_annual', 'annual');
CREATE TYPE review_status AS ENUM ('draft', 'pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE pip_status AS ENUM ('active', 'completed', 'cancelled', 'extended');
CREATE TYPE feedback_type AS ENUM ('peer', 'manager', 'self', 'direct_report', '360');

-- Users profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role public.user_role DEFAULT 'employee',
    department TEXT,
    position TEXT,
    manager_id UUID REFERENCES public.user_profiles(id),
    hire_date DATE,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    timezone TEXT DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance cycles table
CREATE TABLE IF NOT EXISTS public.performance_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    period public.time_period NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    manager_id UUID REFERENCES auth.users(id),
    goal_type public.goal_type DEFAULT 'individual',
    status public.goal_status DEFAULT 'draft',
    priority public.goal_priority DEFAULT 'medium',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    category TEXT,
    department TEXT,
    tags TEXT[],
    performance_cycle_id UUID REFERENCES public.performance_cycles(id),
    parent_goal_id UUID REFERENCES public.goals(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Goal metrics table
CREATE TABLE IF NOT EXISTS public.goal_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    current_value TEXT,
    target_value TEXT,
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Goal dependencies table
CREATE TABLE IF NOT EXISTS public.goal_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    depends_on_goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OKRs table
CREATE TABLE IF NOT EXISTS public.okrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    team_id UUID,
    department TEXT,
    status public.goal_status DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    performance_cycle_id UUID REFERENCES public.performance_cycles(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Key Results table
CREATE TABLE IF NOT EXISTS public.key_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    okr_id UUID REFERENCES public.okrs(id) ON DELETE CASCADE,
    key_result TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_value DECIMAL,
    target_value DECIMAL,
    current_value DECIMAL,
    unit TEXT,
    status public.goal_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance reviews table
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewee_id UUID REFERENCES auth.users(id),
    reviewer_id UUID REFERENCES auth.users(id),
    performance_cycle_id UUID REFERENCES public.performance_cycles(id),
    title TEXT NOT NULL,
    review_type TEXT DEFAULT 'annual',
    status public.review_status DEFAULT 'draft',
    self_review_completed BOOLEAN DEFAULT false,
    manager_review_completed BOOLEAN DEFAULT false,
    peer_reviews_completed BOOLEAN DEFAULT false,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_achieved TEXT,
    development_goals TEXT,
    manager_comments TEXT,
    employee_comments TEXT,
    due_date DATE,
    completed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_giver_id UUID REFERENCES auth.users(id),
    feedback_receiver_id UUID REFERENCES auth.users(id),
    feedback_type public.feedback_type,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_anonymous BOOLEAN DEFAULT false,
    goal_id UUID REFERENCES public.goals(id),
    review_id UUID REFERENCES public.performance_reviews(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Improvement Plans (PIPs) table
CREATE TABLE IF NOT EXISTS public.pips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES auth.users(id),
    manager_id UUID REFERENCES auth.users(id),
    hr_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    status public.pip_status DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    review_frequency TEXT DEFAULT 'weekly',
    improvement_areas TEXT[],
    success_criteria TEXT,
    support_resources TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PIP milestones table
CREATE TABLE IF NOT EXISTS public.pip_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pip_id UUID REFERENCES public.pips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_date DATE,
    is_completed BOOLEAN DEFAULT false,
    manager_notes TEXT,
    employee_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_manager_id ON public.user_profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON public.user_profiles(department);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_manager_id ON public.goals(manager_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_due_date ON public.goals(due_date);
CREATE INDEX IF NOT EXISTS idx_goals_performance_cycle_id ON public.goals(performance_cycle_id);
CREATE INDEX IF NOT EXISTS idx_okrs_user_id ON public.okrs(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewee_id ON public.performance_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer_id ON public.performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_receiver_id ON public.feedback(feedback_receiver_id);
CREATE INDEX IF NOT EXISTS idx_pips_employee_id ON public.pips(employee_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pip_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role IN ('manager', 'hr', 'executive')
  FROM public.user_profiles
  WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_hr()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role IN ('hr', 'executive')
  FROM public.user_profiles
  WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_executive()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'executive'
  FROM public.user_profiles
  WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_uuid AND user_id = auth.uid()
  )
$$;

-- RLS Policies

-- User profiles policies
CREATE POLICY "Users can view their own profile and team members" ON public.user_profiles
FOR SELECT
USING (
  auth.uid() = id OR
  public.is_manager() OR
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE (tm.user_id = auth.uid() OR t.manager_id = auth.uid()) AND
          EXISTS (SELECT 1 FROM public.team_members tm2 WHERE tm2.team_id = t.id AND tm2.user_id = public.user_profiles.id)
  )
);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "HR can manage all profiles" ON public.user_profiles
FOR ALL
USING (public.is_hr())
WITH CHECK (public.is_hr());

-- Performance cycles policies
CREATE POLICY "Everyone can view active performance cycles" ON public.performance_cycles
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "HR and executives can manage performance cycles" ON public.performance_cycles
FOR ALL
USING (public.is_hr())
WITH CHECK (public.is_hr());

-- Goals policies
CREATE POLICY "Users can view their own goals and team goals" ON public.goals
FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.uid() = manager_id OR
  public.is_hr() OR
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid() AND 
          (t.manager_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.team_members tm2 WHERE tm2.team_id = t.id AND tm2.user_id = public.goals.user_id))
  )
);

CREATE POLICY "Users can create their own goals" ON public.goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.goals
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = manager_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = manager_id);

CREATE POLICY "Managers and HR can create goals for team members" ON public.goals
FOR INSERT
WITH CHECK (
  public.is_hr() OR
  (public.is_manager() AND 
   EXISTS (
     SELECT 1 FROM public.user_profiles up
     WHERE up.id = public.goals.user_id AND up.manager_id = auth.uid()
   ))
);

-- Goal metrics policies
CREATE POLICY "Users can view metrics for accessible goals" ON public.goal_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.goals g
    WHERE g.id = public.goal_metrics.goal_id AND
          (g.user_id = auth.uid() OR g.manager_id = auth.uid() OR public.is_hr())
  )
);

CREATE POLICY "Goal owners and managers can manage metrics" ON public.goal_metrics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.goals g
    WHERE g.id = public.goal_metrics.goal_id AND
          (g.user_id = auth.uid() OR g.manager_id = auth.uid() OR public.is_hr())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.goals g
    WHERE g.id = public.goal_metrics.goal_id AND
          (g.user_id = auth.uid() OR g.manager_id = auth.uid() OR public.is_hr())
  )
);

-- OKRs policies
CREATE POLICY "Users can view relevant OKRs" ON public.okrs
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.is_hr() OR
  (team_id IS NOT NULL AND public.is_team_member(team_id))
);

CREATE POLICY "Managers and HR can create OKRs" ON public.okrs
FOR INSERT
WITH CHECK (public.is_manager());

CREATE POLICY "OKR creators can update their OKRs" ON public.okrs
FOR UPDATE
USING (auth.uid() = created_by OR public.is_hr())
WITH CHECK (auth.uid() = created_by OR public.is_hr());

-- Performance reviews policies
CREATE POLICY "Users can view their own reviews" ON public.performance_reviews
FOR SELECT
USING (
  auth.uid() = reviewee_id OR
  auth.uid() = reviewer_id OR
  public.is_hr()
);

CREATE POLICY "Managers and HR can create reviews" ON public.performance_reviews
FOR INSERT
WITH CHECK (public.is_manager());

CREATE POLICY "Reviewers can update reviews" ON public.performance_reviews
FOR UPDATE
USING (
  auth.uid() = reviewer_id OR
  auth.uid() = reviewee_id OR
  public.is_hr()
)
WITH CHECK (
  auth.uid() = reviewer_id OR
  auth.uid() = reviewee_id OR
  public.is_hr()
);

-- Feedback policies
CREATE POLICY "Users can view feedback they gave or received" ON public.feedback
FOR SELECT
USING (
  auth.uid() = feedback_giver_id OR
  auth.uid() = feedback_receiver_id OR
  public.is_hr()
);

CREATE POLICY "Users can give feedback" ON public.feedback
FOR INSERT
WITH CHECK (auth.uid() = feedback_giver_id);

-- PIPs policies
CREATE POLICY "Users can view PIPs they're involved in" ON public.pips
FOR SELECT
USING (
  auth.uid() = employee_id OR
  auth.uid() = manager_id OR
  auth.uid() = hr_id OR
  public.is_hr()
);

CREATE POLICY "Managers and HR can create PIPs" ON public.pips
FOR INSERT
WITH CHECK (public.is_manager());

CREATE POLICY "Managers and HR can update PIPs" ON public.pips
FOR UPDATE
USING (
  auth.uid() = manager_id OR
  auth.uid() = hr_id OR
  public.is_hr()
)
WITH CHECK (
  auth.uid() = manager_id OR
  auth.uid() = hr_id OR
  public.is_hr()
);

-- Teams policies
CREATE POLICY "Users can view teams they belong to" ON public.teams
FOR SELECT
USING (
  auth.uid() = manager_id OR
  public.is_hr() OR
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = public.teams.id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Managers and HR can create teams" ON public.teams
FOR INSERT
WITH CHECK (public.is_manager());

CREATE POLICY "Team managers can update their teams" ON public.teams
FOR UPDATE
USING (auth.uid() = manager_id OR public.is_hr())
WITH CHECK (auth.uid() = manager_id OR public.is_hr());

-- Team members policies
CREATE POLICY "Users can view team memberships" ON public.team_members
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.is_hr() OR
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = public.team_members.team_id AND t.manager_id = auth.uid()
  )
);

CREATE POLICY "Team managers can manage team members" ON public.team_members
FOR ALL
USING (
  public.is_hr() OR
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = public.team_members.team_id AND t.manager_id = auth.uid()
  )
)
WITH CHECK (
  public.is_hr() OR
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = public.team_members.team_id AND t.manager_id = auth.uid()
  )
);

-- Activity logs policies
CREATE POLICY "Users can view their own activity" ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id OR public.is_hr());

CREATE POLICY "Users can create activity logs" ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_cycles_updated_at BEFORE UPDATE ON public.performance_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goal_metrics_updated_at BEFORE UPDATE ON public.goal_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_okrs_updated_at BEFORE UPDATE ON public.okrs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_key_results_updated_at BEFORE UPDATE ON public.key_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON public.performance_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pips_updated_at BEFORE UPDATE ON public.pips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pip_milestones_updated_at BEFORE UPDATE ON public.pip_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;