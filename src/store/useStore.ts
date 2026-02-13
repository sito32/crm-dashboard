import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import type { Lead, Client, Quote, TimelineEvent, AIProfile, Settings, DashboardStats, LandingSubmission } from '../types';

export interface DailyAnalytics {
  date: string;
  leadsCollected: number;
  messagesSent: number;
}

interface AppState {
  user: { id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  leads: Lead[];
  clients: Client[];
  quotes: Quote[];
  timelineEvents: TimelineEvent[];
  aiProfiles: AIProfile[];
  settings: Settings;
  landingSubmissions: LandingSubmission[];
  dailyAnalytics: DailyAnalytics[];
  sidebarOpen: boolean;
  currentView: string;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  
  // Data loading
  loadData: () => Promise<void>;

  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastActionAt'>) => Promise<Lead>;
  addLeads: (leads: Omit<Lead, 'id' | 'createdAt' | 'lastActionAt'>[]) => Promise<Lead[]>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  markMessageSent: (id: string, sent: boolean) => Promise<void>;
  convertToClient: (leadId: string) => Promise<Client | null>;

  // Client actions
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addClientService: (clientId: string, service: string) => void;

  // Quote actions
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => Quote;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;

  // Timeline actions
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'createdAt'>) => void;

  // AI Profile actions
  addAIProfile: (profile: Omit<AIProfile, 'id'>) => AIProfile;
  updateAIProfile: (id: string, updates: Partial<AIProfile>) => void;
  deleteAIProfile: (id: string) => void;

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void;

  // Landing submissions
  addLandingSubmission: (submission: Omit<LandingSubmission, 'id' | 'createdAt'>) => void;

  // Analytics actions
  recordLeadCollected: () => void;
  recordMessageSent: () => void;
  getDailyAnalytics: () => DailyAnalytics[];

  // UI actions
  toggleSidebar: () => void;
  setCurrentView: (view: string) => void;

  // Stats
  getStats: () => DashboardStats;
}

const defaultSettings: Settings = {
  companyName: 'LeadFlow Pro',
  defaultCurrency: 'USD',
  customTags: ['Hot Lead', 'Warm Lead', 'Cold Lead', 'Follow Up', 'VIP', 'Budget', 'Premium'],
  services: ['Video Editing', 'Social Media Management', 'Content Creation', 'Consulting', 'Web Development'],
};

const defaultAIProfiles: AIProfile[] = [
  {
    id: uuidv4(),
    name: 'Video Editing Offer',
    tone: 'professional',
    offer: 'Professional video editing services',
    cta: 'Would you be open to a quick chat?',
    length: 'medium',
    template: `Hi {name}!\n\nI came across your profile and I'm impressed.\n\n{cta}`,
  },
];

export const useStore = create<AppState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  leads: [],
  clients: [],
  quotes: [],
  timelineEvents: [],
  aiProfiles: defaultAIProfiles,
  settings: defaultSettings,
  landingSubmissions: [],
  dailyAnalytics: [],
  sidebarOpen: true,
  currentView: 'dashboard',
  isLoading: false,

  // Load data from Supabase
  loadData: async () => {
    set({ isLoading: true });
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading leads:', error);
      } else if (leads) {
        const formattedLeads: Lead[] = leads.map((lead: Record<string, unknown>) => ({
          id: lead.id as string,
          firstName: lead.first_name as string,
          lastName: lead.last_name as string | undefined,
          platformType: lead.platform_type as Lead['platformType'],
          profileLink: lead.profile_link as string | undefined,
          email: lead.email as string | undefined,
          phone: lead.phone as string | undefined,
          status: lead.status as Lead['status'],
          tags: (lead.tags as string[]) || [],
          notes: (lead.notes as string) || '',
          source: lead.source as string | undefined,
          bio: lead.bio as string | undefined,
          createdAt: lead.created_at as string,
          lastActionAt: lead.last_action_at as string,
          messageSent: lead.message_sent as boolean,
          messageDate: lead.message_date as string | undefined,
          isClient: lead.is_client as boolean,
        }));
        set({ leads: formattedLeads });
      }
    } catch (err) {
      console.error('Error:', err);
    }
    set({ isLoading: false });
  },

  // Auth actions
  login: async (email: string, _password: string) => {
    set({
      user: { id: uuidv4(), email, name: email.split('@')[0] },
      isAuthenticated: true,
    });
    await get().loadData();
    return true;
  },

  loginWithGoogle: async () => {
    set({
      user: { id: uuidv4(), email: 'user@gmail.com', name: 'Google User' },
      isAuthenticated: true,
    });
    await get().loadData();
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, leads: [] });
  },

  // Lead actions - Now syncs with Supabase
  addLead: async (leadData) => {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const newLead: Lead = {
      ...leadData,
      id,
      createdAt: now,
      lastActionAt: now,
    };

    // Add to local state immediately
    set((state) => ({ leads: [newLead, ...state.leads] }));

    // Sync to Supabase
    const { error } = await supabase.from('leads').insert({
      id,
      first_name: leadData.firstName,
      last_name: leadData.lastName || null,
      platform_type: leadData.platformType,
      profile_link: leadData.profileLink || null,
      email: leadData.email || null,
      phone: leadData.phone || null,
      status: leadData.status || 'New',
      tags: leadData.tags || [],
      notes: leadData.notes || '',
      source: leadData.source || 'other',
      bio: leadData.bio || null,
      created_at: now,
      last_action_at: now,
      message_sent: false,
      message_date: null,
      is_client: false,
      user_id: get().user?.id || null,
    });

    if (error) {
      console.error('Error adding lead to Supabase:', error);
    }

    get().recordLeadCollected();
    return newLead;
  },

  addLeads: async (leadsData) => {
    const now = new Date().toISOString();
    const newLeads: Lead[] = leadsData.map((lead) => ({
      ...lead,
      id: uuidv4(),
      createdAt: now,
      lastActionAt: now,
    }));

    set((state) => ({ leads: [...newLeads, ...state.leads] }));

    // Sync to Supabase
    const supabaseLeads = newLeads.map((lead) => ({
      id: lead.id,
      first_name: lead.firstName,
      last_name: lead.lastName || null,
      platform_type: lead.platformType,
      profile_link: lead.profileLink || null,
      email: lead.email || null,
      phone: lead.phone || null,
      status: lead.status || 'New',
      tags: lead.tags || [],
      notes: lead.notes || '',
      source: lead.source || 'other',
      bio: lead.bio || null,
      created_at: now,
      last_action_at: now,
      message_sent: false,
      message_date: null,
      is_client: false,
      user_id: get().user?.id || null,
    }));

    const { error } = await supabase.from('leads').insert(supabaseLeads);
    if (error) {
      console.error('Error adding leads to Supabase:', error);
    }

    return newLeads;
  },

  updateLead: async (id, updates) => {
    const now = new Date().toISOString();
    
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id
          ? { ...lead, ...updates, lastActionAt: now }
          : lead
      ),
    }));

    // Sync to Supabase
    const supabaseUpdates: Record<string, unknown> = { last_action_at: now };
    if (updates.firstName !== undefined) supabaseUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) supabaseUpdates.last_name = updates.lastName;
    if (updates.platformType !== undefined) supabaseUpdates.platform_type = updates.platformType;
    if (updates.profileLink !== undefined) supabaseUpdates.profile_link = updates.profileLink;
    if (updates.email !== undefined) supabaseUpdates.email = updates.email;
    if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
    if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
    if (updates.messageSent !== undefined) supabaseUpdates.message_sent = updates.messageSent;
    if (updates.messageDate !== undefined) supabaseUpdates.message_date = updates.messageDate;
    if (updates.isClient !== undefined) supabaseUpdates.is_client = updates.isClient;

    const { error } = await supabase.from('leads').update(supabaseUpdates).eq('id', id);
    if (error) {
      console.error('Error updating lead in Supabase:', error);
    }
  },

  deleteLead: async (id) => {
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
    }));

    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Error deleting lead from Supabase:', error);
    }
  },

  markMessageSent: async (id, sent) => {
    const now = new Date().toISOString();
    
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              messageSent: sent,
              messageDate: sent ? now : undefined,
              status: sent ? 'Sent' : lead.status,
              lastActionAt: now,
            }
          : lead
      ),
    }));

    const { error } = await supabase.from('leads').update({
      message_sent: sent,
      message_date: sent ? now : null,
      status: sent ? 'Sent' : undefined,
      last_action_at: now,
    }).eq('id', id);

    if (error) {
      console.error('Error updating message status:', error);
    }

    if (sent) {
      get().recordMessageSent();
    }
  },

  convertToClient: async (leadId) => {
    const state = get();
    const lead = state.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const client: Client = {
      ...lead,
      isClient: true,
      status: 'Client',
      services: [],
      quotes: [],
      timeline: [],
      convertedAt: new Date().toISOString(),
    };

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, isClient: true, status: 'Client' } : l
      ),
      clients: [...state.clients, client],
    }));

    await supabase.from('leads').update({
      is_client: true,
      status: 'Client',
    }).eq('id', leadId);

    return client;
  },

  // Client actions
  updateClient: (id, updates) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id ? { ...client, ...updates } : client
      ),
    }));
  },

  deleteClient: (id) => {
    set((state) => ({
      leads: state.leads.map(lead =>
        lead.id === id ? { ...lead, isClient: false, status: 'Interested' as const } : lead
      ),
      clients: state.clients.filter(c => c.id !== id),
    }));
  },

  addClientService: (clientId, service) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === clientId
          ? { ...client, services: [...client.services, service] }
          : client
      ),
    }));
  },

  // Quote actions
  addQuote: (quoteData) => {
    const newQuote: Quote = {
      ...quoteData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ quotes: [...state.quotes, newQuote] }));
    return newQuote;
  },

  updateQuote: (id, updates) => {
    set((state) => ({
      quotes: state.quotes.map((quote) =>
        quote.id === id ? { ...quote, ...updates } : quote
      ),
    }));
  },

  deleteQuote: (id) => {
    set((state) => ({
      quotes: state.quotes.filter((quote) => quote.id !== id),
    }));
  },

  // Timeline actions
  addTimelineEvent: (eventData) => {
    const newEvent: TimelineEvent = {
      ...eventData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      timelineEvents: [...state.timelineEvents, newEvent],
    }));
  },

  // AI Profile actions
  addAIProfile: (profileData) => {
    const newProfile: AIProfile = {
      ...profileData,
      id: uuidv4(),
    };
    set((state) => ({
      aiProfiles: [...state.aiProfiles, newProfile],
    }));
    return newProfile;
  },

  updateAIProfile: (id, updates) => {
    set((state) => ({
      aiProfiles: state.aiProfiles.map((profile) =>
        profile.id === id ? { ...profile, ...updates } : profile
      ),
    }));
  },

  deleteAIProfile: (id) => {
    set((state) => ({
      aiProfiles: state.aiProfiles.filter((profile) => profile.id !== id),
    }));
  },

  // Settings actions
  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
  },

  // Landing submissions
  addLandingSubmission: (submissionData) => {
    const newSubmission: LandingSubmission = {
      ...submissionData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    const lead: Omit<Lead, 'id' | 'createdAt' | 'lastActionAt'> = {
      firstName: submissionData.name.split(' ')[0],
      lastName: submissionData.name.split(' ').slice(1).join(' ') || undefined,
      platformType: 'email',
      email: submissionData.email,
      phone: submissionData.phone,
      status: 'New',
      tags: ['Inbound', submissionData.serviceInterest],
      notes: `Interested in: ${submissionData.serviceInterest}`,
      source: 'inbound',
      isClient: false,
    };

    set((state) => ({
      landingSubmissions: [...state.landingSubmissions, newSubmission],
    }));

    get().addLead(lead);
  },

  // Analytics actions
  recordLeadCollected: () => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => {
      const existingIndex = state.dailyAnalytics.findIndex(a => a.date === today);
      if (existingIndex >= 0) {
        const updated = [...state.dailyAnalytics];
        updated[existingIndex] = {
          ...updated[existingIndex],
          leadsCollected: updated[existingIndex].leadsCollected + 1,
        };
        return { dailyAnalytics: updated };
      } else {
        return {
          dailyAnalytics: [...state.dailyAnalytics, { date: today, leadsCollected: 1, messagesSent: 0 }],
        };
      }
    });
  },

  recordMessageSent: () => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => {
      const existingIndex = state.dailyAnalytics.findIndex(a => a.date === today);
      if (existingIndex >= 0) {
        const updated = [...state.dailyAnalytics];
        updated[existingIndex] = {
          ...updated[existingIndex],
          messagesSent: updated[existingIndex].messagesSent + 1,
        };
        return { dailyAnalytics: updated };
      } else {
        return {
          dailyAnalytics: [...state.dailyAnalytics, { date: today, leadsCollected: 0, messagesSent: 1 }],
        };
      }
    });
  },

  getDailyAnalytics: () => {
    return get().dailyAnalytics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // UI actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setCurrentView: (view) => {
    set({ currentView: view });
  },

  // Stats
  getStats: () => {
    const state = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayLeads = state.leads.filter(
      (l) => new Date(l.createdAt) >= today
    ).length;

    const yesterdayLeads = state.leads.filter((l) => {
      const date = new Date(l.createdAt);
      return date >= yesterday && date < today;
    }).length;

    const todayMessages = state.leads.filter(
      (l) => l.messageDate && new Date(l.messageDate) >= today
    ).length;

    return {
      todayLeads,
      yesterdayLeads,
      totalLeads: state.leads.length,
      todayMessages,
      instagramCount: state.leads.filter((l) => l.platformType === 'instagram').length,
      twitterCount: state.leads.filter((l) => l.platformType === 'twitter').length,
      facebookCount: state.leads.filter((l) => l.platformType === 'facebook').length,
      emailCount: state.leads.filter((l) => l.platformType === 'email').length,
      phoneCount: state.leads.filter((l) => l.platformType === 'phone').length,
      otherCount: state.leads.filter((l) => l.platformType === 'other').length,
      clientCount: state.clients.length,
    };
  },
}));

// Load data when the store is created
if (typeof window !== 'undefined') {
  useStore.getState().loadData();
}