// Platform types
export type PlatformType = 'instagram' | 'twitter' | 'facebook' | 'email' | 'phone' | 'other';

// Lead status options
export type LeadStatus = 'New' | 'Sent' | 'Replied' | 'Interested' | 'Client' | 'Archived';

// Lead source
export type LeadSource = 'social' | 'email' | 'phone' | 'inbound' | 'other';

// Lead interface
export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  platformType: PlatformType;
  profileLink?: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  tags: string[];
  notes: string;
  source: LeadSource;
  bio?: string;
  createdAt: string;
  lastActionAt: string;
  messageSent?: boolean;
  messageDate?: string;
  isClient: boolean;
}

// Client interface (extended lead)
export interface Client extends Lead {
  isClient: true;
  services: string[];
  quotes: Quote[];
  timeline: TimelineEvent[];
  convertedAt: string;
}

// Quote interface
export interface Quote {
  id: string;
  clientId: string;
  service: string;
  amount: number;
  currency: string;
  description: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  validUntil: string;
}

// Timeline event
export interface TimelineEvent {
  id: string;
  clientId: string;
  type: 'note' | 'message' | 'quote' | 'status_change' | 'call';
  content: string;
  createdAt: string;
}

// AI Message Profile
export interface AIProfile {
  id: string;
  name: string;
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  offer: string;
  cta: string;
  length: 'short' | 'medium' | 'long';
  template: string;
}

// Dashboard stats
export interface DashboardStats {
  todayLeads: number;
  yesterdayLeads: number;
  totalLeads: number;
  todayMessages: number;
  instagramCount: number;
  twitterCount: number;
  facebookCount: number;
  emailCount: number;
  phoneCount: number;
  otherCount: number;
  clientCount: number;
}

// Landing page submission
export interface LandingSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  serviceInterest: string;
  createdAt: string;
}

// Settings
export interface Settings {
  companyName: string;
  defaultCurrency: string;
  aiApiKey?: string;
  customTags: string[];
  services: string[];
}
