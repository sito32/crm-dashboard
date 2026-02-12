import { createClient } from '@supabase/supabase-js';

// Supabase configuration - These would be environment variables in production
// For demo purposes, we use a public anon key that only allows authenticated access
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          first_name: string;
          last_name: string | null;
          platform_type: string;
          profile_link: string | null;
          email: string | null;
          phone: string | null;
          status: string;
          tags: string[];
          notes: string;
          source: string;
          bio: string | null;
          created_at: string;
          last_action_at: string;
          message_sent: boolean;
          message_date: string | null;
          is_client: boolean;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          lead_id: string;
          services: string[];
          converted_at: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      quotes: {
        Row: {
          id: string;
          client_id: string;
          service: string;
          amount: number;
          currency: string;
          description: string;
          status: string;
          created_at: string;
          valid_until: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>;
      };
      timeline_events: {
        Row: {
          id: string;
          client_id: string;
          type: string;
          content: string;
          created_at: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['timeline_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['timeline_events']['Insert']>;
      };
      ai_profiles: {
        Row: {
          id: string;
          name: string;
          tone: string;
          offer: string;
          cta: string;
          length: string;
          template: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_profiles']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['ai_profiles']['Insert']>;
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          default_currency: string;
          ai_api_key: string | null;
          custom_tags: string[];
          services: string[];
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
      landing_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          service_interest: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['landing_submissions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['landing_submissions']['Insert']>;
      };
    };
  };
}

// SQL to create tables (run this in Supabase SQL editor)
export const createTablesSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  platform_type TEXT NOT NULL,
  profile_link TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'New',
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  source TEXT DEFAULT 'other',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_sent BOOLEAN DEFAULT FALSE,
  message_date TIMESTAMP WITH TIME ZONE,
  is_client BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id)
);

-- Clients extension table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  services TEXT[] DEFAULT '{}',
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id)
);

-- Timeline events
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- AI Profiles
CREATE TABLE IF NOT EXISTS ai_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  tone TEXT DEFAULT 'professional',
  offer TEXT NOT NULL,
  cta TEXT NOT NULL,
  length TEXT DEFAULT 'medium',
  template TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  company_name TEXT DEFAULT '',
  default_currency TEXT DEFAULT 'USD',
  ai_api_key TEXT,
  custom_tags TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}'
);

-- Landing submissions (public)
CREATE TABLE IF NOT EXISTS landing_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_interest TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own leads" ON leads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quotes" ON quotes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own timeline events" ON timeline_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI profiles" ON ai_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" ON settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit to landing" ON landing_submissions
  FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
`;
