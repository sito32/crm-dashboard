import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  FileText,
  MessageSquare,
  Clock,
  DollarSign,
  ChevronRight,
  X,
  Trash2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { Button } from '../UI/Button';
import { useStore } from '../../store/useStore';
import type { Client, Quote, AIProfile } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function ClientsPage() {
  const { 
    clients, 
    leads, 
    convertToClient, 
    addQuote, 
    quotes, 
    timelineEvents, 
    addTimelineEvent, 
    settings,
    aiProfiles,
    deleteClient,
  } = useStore();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAIMessageModal, setShowAIMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const eligibleLeads = leads.filter((l) => !l.isClient && l.status !== 'Archived');
  const filteredClients = clients.filter((c) =>
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientQuotes = selectedClient
    ? quotes.filter((q) => q.clientId === selectedClient.id)
    : [];
  const clientTimeline = selectedClient
    ? timelineEvents.filter((e) => e.clientId === selectedClient.id)
    : [];

  const platformIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram size={16} className="text-pink-400" />,
    twitter: <Twitter size={16} className="text-sky-400" />,
    facebook: <Facebook size={16} className="text-blue-400" />,
    email: <Mail size={16} className="text-emerald-400" />,
    phone: <Phone size={16} className="text-violet-400" />,
    other: <Globe size={16} className="text-gray-400" />,
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to remove this client? They will be converted back to a lead.')) {
      deleteClient(clientId);
      // Remove from selected if it was selected
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      toast.success('Client removed and converted back to lead');
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients List */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Clients</h2>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={16} />}
                  onClick={() => setShowAddClientModal(true)}
                  title="Add New Client"
                >
                  Add
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserCheck size={16} />}
                  onClick={() => setShowConvertModal(true)}
                  title="Convert Lead to Client"
                >
                  Convert
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Client List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck size={48} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No clients yet</p>
                  <p className="text-gray-500 text-sm">Convert leads to clients to see them here</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <motion.div
                    key={client.id}
                    className={`p-4 rounded-xl transition-all cursor-pointer ${
                      selectedClient?.id === client.id
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {client.firstName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {client.firstName} {client.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            {platformIcons[client.platformType]}
                            <span>Since {format(new Date(client.convertedAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400"
                          title="Remove client"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={18} className="text-gray-500" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Client Details */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="space-y-6">
              {/* Client Header */}
              <GlassCard gradient="purple" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedClient.firstName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        {platformIcons[selectedClient.platformType]}
                        <span className="text-gray-400 capitalize">{selectedClient.platformType}</span>
                        {selectedClient.email && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400">{selectedClient.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Sparkles size={16} />}
                      onClick={() => setShowAIMessageModal(true)}
                    >
                      AI Message
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<FileText size={16} />}
                      onClick={() => setShowQuoteModal(true)}
                    >
                      New Quote
                    </Button>
                  </div>
                </div>

                {/* Services */}
                <div className="mt-6">
                  <p className="text-sm text-gray-400 mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.services.length === 0 ? (
                      <span className="text-gray-500 text-sm">No services assigned</span>
                    ) : (
                      selectedClient.services.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm"
                        >
                          {service}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Quotes */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-400" />
                  Quotes & Proposals
                </h3>
                {clientQuotes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No quotes yet</p>
                ) : (
                  <div className="space-y-3">
                    {clientQuotes.map((quote) => (
                      <QuoteCard key={quote.id} quote={quote} />
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Timeline */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-purple-400" />
                  Activity Timeline
                </h3>
                {clientTimeline.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No activity recorded</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        addTimelineEvent({
                          clientId: selectedClient.id,
                          type: 'note',
                          content: 'Client profile created',
                        });
                      }}
                    >
                      Add first note
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientTimeline.map((event) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          {event.type === 'note' && <MessageSquare size={14} className="text-gray-400" />}
                          {event.type === 'quote' && <FileText size={14} className="text-green-400" />}
                          {event.type === 'message' && <Mail size={14} className="text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{event.content}</p>
                          <p className="text-gray-500 text-sm">
                            {format(new Date(event.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Notes */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                <p className="text-gray-300">{selectedClient.notes || 'No notes added'}</p>
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="p-12 text-center h-full flex flex-col items-center justify-center">
              <UserCheck size={64} className="text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Select a Client</h3>
              <p className="text-gray-400">Choose a client from the list to view their details</p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Convert Lead Modal */}
      <AnimatePresence>
        {showConvertModal && (
          <ConvertLeadModal
            leads={eligibleLeads}
            onConvert={(leadId) => {
              convertToClient(leadId);
              setShowConvertModal(false);
              toast.success('Lead converted to client!');
            }}
            onClose={() => setShowConvertModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddClientModal && (
          <AddClientModal
            services={settings.services}
            onClose={() => setShowAddClientModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Quote Modal */}
      <AnimatePresence>
        {showQuoteModal && selectedClient && (
          <QuoteModal
            client={selectedClient}
            services={settings.services}
            onSave={(quote) => {
              addQuote(quote);
              addTimelineEvent({
                clientId: selectedClient.id,
                type: 'quote',
                content: `Quote created: ${quote.service} - $${quote.amount}`,
              });
              setShowQuoteModal(false);
              toast.success('Quote created!');
            }}
            onClose={() => setShowQuoteModal(false)}
          />
        )}
      </AnimatePresence>

      {/* AI Message Modal */}
      <AnimatePresence>
        {showAIMessageModal && selectedClient && (
          <AIMessageModal
            client={selectedClient}
            profiles={aiProfiles}
            onMessageSent={(content) => {
              addTimelineEvent({
                clientId: selectedClient.id,
                type: 'message',
                content: `Message sent: ${content.substring(0, 50)}...`,
              });
              setShowAIMessageModal(false);
              toast.success('Message recorded!');
            }}
            onClose={() => setShowAIMessageModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuoteCard({ quote }: { quote: Quote }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    sent: 'bg-blue-500/20 text-blue-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-white font-medium">{quote.service}</h4>
          <p className="text-gray-400 text-sm mt-1">{quote.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-400">
            ${quote.amount.toLocaleString()}
          </p>
          <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${statusColors[quote.status]}`}>
            {quote.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function ConvertLeadModal({
  leads,
  onConvert,
  onClose,
}: {
  leads: { id: string; firstName: string; platformType: string }[];
  onConvert: (leadId: string) => void;
  onClose: () => void;
}) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Convert Lead to Client</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {leads.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No eligible leads to convert</p>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {leads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedLeadId === lead.id
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-white font-medium">{lead.firstName}</p>
                    <p className="text-gray-400 text-sm capitalize">{lead.platformType}</p>
                  </button>
                ))}
              </div>
              <Button
                variant="success"
                onClick={() => selectedLeadId && onConvert(selectedLeadId)}
                disabled={!selectedLeadId}
                className="w-full"
              >
                Convert to Client
              </Button>
            </>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function AddClientModal({
  services,
  onClose,
}: {
  services: string[];
  onClose: () => void;
}) {
  const { addLead, convertToClient } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    selectedServices: [] as string[],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First create a lead
    const lead = addLead({
      firstName: formData.firstName,
      lastName: formData.lastName || undefined,
      platformType: 'email',
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      status: 'New',
      tags: ['Direct Client'],
      notes: formData.notes,
      source: 'other',
      isClient: false,
    });
    
    // Then convert to client
    const client = convertToClient(lead.id);
    if (client) {
      toast.success('Client added successfully!');
    }
    onClose();
  };

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter((s) => s !== service)
        : [...prev.selectedServices, service],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Add New Client</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Services</label>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      formData.selectedServices.includes(service)
                        ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full h-20 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="success" className="flex-1">
                Add Client
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function QuoteModal({
  client,
  services,
  onSave,
  onClose,
}: {
  client: Client;
  services: string[];
  onSave: (quote: Omit<Quote, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    service: services[0] || '',
    amount: '',
    description: '',
    validDays: '30',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parseInt(formData.validDays));

    onSave({
      clientId: client.id,
      service: formData.service,
      amount: parseFloat(formData.amount),
      currency: 'USD',
      description: formData.description,
      status: 'draft',
      validUntil: validUntil.toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Create Quote</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Service</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
              >
                {services.map((service) => (
                  <option key={service} value={service} className="bg-gray-800">
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount ($)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                placeholder="1000.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-24 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                placeholder="Describe the scope of work..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Valid for (days)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.validDays}
                onChange={(e) => setFormData({ ...formData, validDays: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="success" className="flex-1">
                Create Quote
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function AIMessageModal({
  client,
  profiles,
  onMessageSent,
  onClose,
}: {
  client: Client;
  profiles: AIProfile[];
  onMessageSent: (content: string) => void;
  onClose: () => void;
}) {
  const [selectedProfile, setSelectedProfile] = useState<AIProfile | null>(profiles[0] || null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const generateMessage = () => {
    if (!selectedProfile) return;

    let message = selectedProfile.template;
    message = message.replace(/{name}/g, client.firstName);
    message = message.replace(/{bio_highlight}/g, client.notes || 'your work');
    message = message.replace(/{offer}/g, selectedProfile.offer);
    message = message.replace(/{cta}/g, selectedProfile.cta);
    message = message.replace(/{platform}/g, client.platformType);

    setGeneratedMessage(message);
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    toast.success('Message copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openProfile = () => {
    if (client.profileLink) {
      window.open(client.profileLink, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Sparkles size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Message Builder</h2>
                <p className="text-gray-400 text-sm">For {client.firstName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Profile Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Message Profile</label>
            <div className="grid grid-cols-2 gap-2">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedProfile?.id === profile.id
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-white font-medium text-sm">{profile.name}</p>
                  <p className="text-gray-400 text-xs capitalize">{profile.tone}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={generateMessage}
            disabled={!selectedProfile}
            className="w-full mb-4"
            icon={<Sparkles size={16} />}
          >
            Generate Message
          </Button>

          {generatedMessage && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  className="w-full h-40 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 resize-none"
                />
                <button
                  onClick={copyMessage}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copied ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <Copy size={18} className="text-gray-400" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" icon={<Copy size={16} />} onClick={copyMessage}>
                  Copy Message
                </Button>
                <Button
                  variant="primary"
                  icon={<ExternalLink size={16} />}
                  onClick={openProfile}
                  disabled={!client.profileLink}
                >
                  Open Profile
                </Button>
              </div>

              <Button
                variant="success"
                onClick={() => onMessageSent(generatedMessage)}
                className="w-full"
                icon={<Check size={16} />}
              >
                Mark as Sent
              </Button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
