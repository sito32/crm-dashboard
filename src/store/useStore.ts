import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Lead, Client, Quote, TimelineEvent, AIProfile, Settings, DashboardStats, LandingSubmission } from '../types';

export interface DailyAnalytics {
  date: string;
  leadsCollected: number;
  messagesSent: number;
}

interface AppState {
  // Auth state
  user: { id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  
  // Leads
  leads: Lead[];
  
  // Clients
  clients: Client[];
  
  // Quotes
  quotes: Quote[];
  
  // Timeline
  timelineEvents: TimelineEvent[];
  
  // AI Profiles
  aiProfiles: AIProfile[];
  
  // Settings
  settings: Settings;
  
  // Landing submissions
  landingSubmissions: LandingSubmission[];
  
  // Daily Analytics
  dailyAnalytics: DailyAnalytics[];
  
  // UI State
  sidebarOpen: boolean;
  currentView: string;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  
  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastActionAt'>) => Lead;
  addLeads: (leads: Omit<Lead, 'id' | 'createdAt' | 'lastActionAt'>[]) => Lead[];
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  markMessageSent: (id: string, sent: boolean) => void;
  convertToClient: (leadId: string) => Client | null;
  
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
    offer: 'Professional video editing services to help grow your social media presence',
    cta: 'Would you be open to a quick chat about how we can help?',
    length: 'medium',
    template: `Hi {name}! 👋

I came across your profile and I'm really impressed by {bio_highlight}.

I specialize in {offer}, and I think we could create some amazing content together.

{cta}

Best regards!`,
  },
  {
    id: uuidv4(),
    name: 'Short-Form Content Offer',
    tone: 'casual',
    offer: 'Transform your long content into viral short-form videos',
    cta: "Let's connect and discuss how we can boost your engagement!",
    length: 'short',
    template: `Hey {name}! 🔥

Love your content! I help creators like you turn long videos into viral short-form content.

{cta}`,
  },
  {
    id: uuidv4(),
    name: 'Cold Outreach',
    tone: 'professional',
    offer: 'Custom services tailored to your needs',
    cta: 'Would you be interested in learning more?',
    length: 'medium',
    template: `Hello {name},

I noticed your impressive work on {platform}. Your {bio_highlight} really stands out.

I believe my {offer} could help take your brand to the next level.

{cta}

Looking forward to connecting!`,
  },
  {
    id: uuidv4(),
    name: 'Warm Follow-Up',
    tone: 'friendly',
    offer: 'Continue our conversation about potential collaboration',
    cta: 'When would be a good time to continue our chat?',
    length: 'short',
    template: `Hi {name}! 😊

Just following up on our previous conversation. I'm still excited about the possibility of working together!

{cta}`,
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
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

      // Auth actions
      login: async (email: string, _password: string) => {
        // Simulate auth - in production, use Supabase auth
        set({
          user: { id: uuidv4(), email, name: email.split('@')[0] },
          isAuthenticated: true,
        });
        return true;
      },

      loginWithGoogle: async () => {
        // Simulate Google auth
        set({
          user: { id: uuidv4(), email: 'user@gmail.com', name: 'Google User' },
          isAuthenticated: true,
        });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      // Lead actions
      addLead: (leadData) => {
        const now = new Date().toISOString();
        const newLead: Lead = {
          ...leadData,
          id: uuidv4(),
          createdAt: now,
          lastActionAt: now,
        };
        set((state) => ({ leads: [...state.leads, newLead] }));
        get().recordLeadCollected();
        return newLead;
      },

      addLeads: (leadsData) => {
        const now = new Date().toISOString();
        const newLeads: Lead[] = leadsData.map((lead) => ({
          ...lead,
          id: uuidv4(),
          createdAt: now,
          lastActionAt: now,
        }));
        set((state) => ({ leads: [...state.leads, ...newLeads] }));
        return newLeads;
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? { ...lead, ...updates, lastActionAt: new Date().toISOString() }
              : lead
          ),
        }));
      },

      deleteLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
        }));
      },

      markMessageSent: (id, sent) => {
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
        if (sent) {
          get().recordMessageSent();
        }
      },

      convertToClient: (leadId) => {
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
        set((state) => {
          // Find the client to get the lead ID
          const client = state.clients.find(c => c.id === id);
          if (!client) return state;
          
          // Update the lead to not be a client anymore
          const updatedLeads = state.leads.map(lead => 
            lead.id === id ? { ...lead, isClient: false, status: 'Interested' as const } : lead
          );
          
          // Remove from clients list
          const updatedClients = state.clients.filter(c => c.id !== id);
          
          return {
            leads: updatedLeads,
            clients: updatedClients,
          };
        });
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
        
        // Also create a lead from this submission
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
    }),
    {
      name: 'leadflow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        leads: state.leads,
        clients: state.clients,
        quotes: state.quotes,
        timelineEvents: state.timelineEvents,
        aiProfiles: state.aiProfiles,
        settings: state.settings,
        landingSubmissions: state.landingSubmissions,
        dailyAnalytics: state.dailyAnalytics,
      }),
    }
  )
);
