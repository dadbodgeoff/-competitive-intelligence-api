-- Competitive Intelligence API Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analyses table
CREATE TABLE public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    restaurant_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'restaurant',
    review_sources TEXT[] DEFAULT ARRAY['google', 'yelp'],
    time_range VARCHAR(50) DEFAULT '6_months',
    competitor_count INTEGER DEFAULT 5,
    exclude_seen BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'pending',
    current_step VARCHAR(255),
    error_message TEXT,
    total_reviews_analyzed INTEGER,
    processing_time_seconds INTEGER,
    llm_provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Competitors table
CREATE TABLE public.competitors (
    id VARCHAR(255) PRIMARY KEY, -- Google Place ID or Yelp ID
    name VARCHAR(255) NOT NULL,
    address TEXT,
    rating DECIMAL(2,1),
    review_count INTEGER,
    phone VARCHAR(50),
    website VARCHAR(500),
    google_place_id VARCHAR(255),
    yelp_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analysis-Competitor junction table
CREATE TABLE public.analysis_competitors (
    analysis_id UUID REFERENCES public.analyses(id),
    competitor_id VARCHAR(255) REFERENCES public.competitors(id),
    competitor_name VARCHAR(255),
    rating DECIMAL(2,1),
    review_count INTEGER,
    distance_miles DECIMAL(5,2),
    PRIMARY KEY (analysis_id, competitor_id)
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id VARCHAR(255) REFERENCES public.competitors(id),
    source VARCHAR(50) NOT NULL, -- 'google' or 'yelp'
    external_id VARCHAR(255), -- Review ID from source
    author_name VARCHAR(255),
    rating INTEGER,
    text TEXT,
    review_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(competitor_id, source, external_id)
);

-- Insights table
CREATE TABLE public.insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id),
    competitor_id VARCHAR(255) REFERENCES public.competitors(id),
    category VARCHAR(50) NOT NULL, -- 'threat', 'opportunity', 'watch'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
    mention_count INTEGER DEFAULT 0,
    significance DECIMAL(4,2), -- 0-100 percentage
    proof_quote TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User sessions for enhanced security
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    session_token VARCHAR(255) UNIQUE,
    refresh_token VARCHAR(255) UNIQUE,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Security events tracking
CREATE TABLE public.user_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    attempted_at TIMESTAMP DEFAULT NOW(),
    success BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_status ON public.analyses(status);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at);
CREATE INDEX idx_competitors_name ON public.competitors(name);
CREATE INDEX idx_reviews_competitor_id ON public.reviews(competitor_id);
CREATE INDEX idx_reviews_source ON public.reviews(source);
CREATE INDEX idx_insights_analysis_id ON public.insights(analysis_id);
CREATE INDEX idx_insights_category ON public.insights(category);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_login_attempts_email ON public.user_login_attempts(email);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own analyses
CREATE POLICY "Users can view own analyses" ON public.analyses
    FOR ALL USING (auth.uid() = user_id);

-- Users can only see insights from their analyses
CREATE POLICY "Users can view own insights" ON public.insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analyses 
            WHERE analyses.id = insights.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.analyses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON public.competitors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();