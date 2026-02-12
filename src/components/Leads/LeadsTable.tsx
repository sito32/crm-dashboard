import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Check,
  X,
  ChevronDown,
  Plus,
  Upload,
  FileSpreadsheet,
  Trash2,
  Edit,
  CheckSquare,
  Square,
} from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { Button } from '../UI/Button';
import { useStore } from '../../store/useStore';
import type { Lead, LeadStatus, PlatformType } from '../../types';
import { LeadUploadModal } from './LeadUploadModal';
import { LeadEditModal } from './LeadEditModal';
import toast from 'react-hot-toast';

interface LeadsTableProps {
  filterPlatform?: PlatformType;
}

export function LeadsTable({ filterPlatform }: LeadsTableProps) {
  const { leads, updateLead, deleteLead, markMessageSent, settings } = useStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const filteredLeads = filterPlatform
    ? leads.filter((lead) => lead.platformType === filterPlatform && !lead.isClient)
    : leads.filter((lead) => !lead.isClient);

  const handleStatusChange = (leadId: string, status: LeadStatus) => {
    updateLead(leadId, { status });
  };

  const handleViewProfile = (lead: Lead) => {
    if (lead.profileLink) {
      window.open(lead.profileLink, '_blank');
    }
  };

  const handleMessageAction = (leadId: string, sent: boolean) => {
    markMessageSent(leadId, sent);
    toast.success(sent ? 'Marked as sent!' : 'Status updated');
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  };

  const handleDelete = (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(leadId);
      setSelectedLeads((prev) => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
      toast.success('Lead deleted');
    }
  };

  const handleBulkDelete = () => {
    if (selectedLeads.size === 0) {
      toast.error('No leads selected');
      return;
    }
    if (confirm(`Are you sure you want to delete ${selectedLeads.size} lead(s)?`)) {
      selectedLeads.forEach((id) => deleteLead(id));
      setSelectedLeads(new Set());
      toast.success(`${selectedLeads.size} leads deleted`);
    }
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const isAllSelected = filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {filterPlatform ? `${filterPlatform.charAt(0).toUpperCase() + filterPlatform.slice(1)} Leads` : 'All Leads'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{filteredLeads.length} leads found</p>
        </div>
        <div className="flex gap-3">
          {selectedLeads.size > 0 && (
            <Button
              variant="danger"
              icon={<Trash2 size={18} />}
              onClick={handleBulkDelete}
            >
              Delete ({selectedLeads.size})
            </Button>
          )}
          <Button
            variant="secondary"
            icon={<Upload size={18} />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Import Leads
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => {
              setEditingLead(null);
              setIsEditModalOpen(true);
            }}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <FileSpreadsheet size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No leads yet</h3>
            <p className="text-gray-400 mb-6">Start by importing or adding leads manually</p>
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                icon={<Upload size={18} />}
                onClick={() => setIsUploadModalOpen(true)}
              >
                Import CSV
              </Button>
              <Button
                variant="primary"
                icon={<Plus size={18} />}
                onClick={() => {
                  setEditingLead(null);
                  setIsEditModalOpen(true);
                }}
              >
                Add Lead
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {isAllSelected ? (
                        <CheckSquare size={18} className="text-purple-400" />
                      ) : (
                        <Square size={18} className="text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">First Name</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Tags</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Action</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredLeads.map((lead) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        selectedLeads.has(lead.id) ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleSelectLead(lead.id)}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          {selectedLeads.has(lead.id) ? (
                            <CheckSquare size={18} className="text-purple-400" />
                          ) : (
                            <Square size={18} className="text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white font-medium">{lead.firstName}</span>
                        {lead.lastName && (
                          <span className="text-gray-400 ml-1">{lead.lastName}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <PlatformBadge platform={lead.platformType} />
                      </td>
                      <td className="py-4 px-4">
                        <StatusDropdown
                          status={lead.status}
                          onChange={(status) => handleStatusChange(lead.id, status)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {lead.tags.length > 3 && (
                            <span className="text-gray-500 text-xs">+{lead.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <ActionButton
                          lead={lead}
                          onViewProfile={() => handleViewProfile(lead)}
                          onMessageSent={() => handleMessageAction(lead.id, true)}
                          onMessageNotSent={() => handleMessageAction(lead.id, false)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(lead)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Modals */}
      <LeadUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      <LeadEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLead(null);
        }}
        lead={editingLead}
        tags={settings.customTags}
      />
    </div>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const config: Record<string, { icon: React.ReactNode; gradient: string }> = {
    instagram: {
      icon: <Instagram size={14} />,
      gradient: 'from-pink-500 via-purple-500 to-orange-500',
    },
    twitter: {
      icon: <Twitter size={14} />,
      gradient: 'from-sky-400 to-blue-500',
    },
    facebook: {
      icon: <Facebook size={14} />,
      gradient: 'from-blue-600 to-blue-400',
    },
    email: {
      icon: <Mail size={14} />,
      gradient: 'from-emerald-500 to-teal-500',
    },
    phone: {
      icon: <Phone size={14} />,
      gradient: 'from-violet-500 to-purple-500',
    },
    other: {
      icon: <Globe size={14} />,
      gradient: 'from-gray-500 to-gray-400',
    },
  };

  const { icon, gradient } = config[platform] || config.other;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${gradient} text-white text-xs font-medium`}
    >
      {icon}
      <span className="capitalize">{platform}</span>
    </span>
  );
}

function StatusDropdown({
  status,
  onChange,
}: {
  status: LeadStatus;
  onChange: (status: LeadStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const statuses: LeadStatus[] = ['New', 'Sent', 'Replied', 'Interested', 'Client', 'Archived'];

  const colors: Record<string, string> = {
    New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Sent: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Replied: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Interested: 'bg-green-500/20 text-green-400 border-green-500/30',
    Client: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${colors[status]}`}
      >
        {status}
        <ChevronDown size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 z-20 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-32"
            >
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                    s === status ? 'bg-white/5 text-white' : 'text-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  lead,
  onViewProfile,
  onMessageSent,
  onMessageNotSent,
}: {
  lead: Lead;
  onViewProfile: () => void;
  onMessageSent: () => void;
  onMessageNotSent: () => void;
}) {
  const [profileViewed, setProfileViewed] = useState(false);
  const isNew = lead.status === 'New';

  const handleViewProfile = () => {
    onViewProfile();
    // Only set profileViewed to true if status is 'New'
    if (isNew) {
      setProfileViewed(true);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* View Profile Button - Always visible and clickable */}
      <button
        onClick={handleViewProfile}
        disabled={!lead.profileLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ExternalLink size={14} />
        View Profile
      </button>
      
      {/* Show "Message Sent" green box only if status is NOT "New" */}
      {!isNew && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
          <Check size={14} />
          Message Sent
        </span>
      )}
      
      {/* Sent/Not Sent buttons - Only show if status is "New" AND profile has been viewed */}
      {isNew && profileViewed && (
        <div className="flex items-center gap-1">
          <button
            onClick={onMessageSent}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium hover:bg-green-500/30 transition-colors"
            title="Mark as sent"
          >
            <Check size={12} />
            Sent
          </button>
          <button
            onClick={onMessageNotSent}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30 transition-colors"
            title="Mark as not sent"
          >
            <X size={12} />
            Not Sent
          </button>
        </div>
      )}
      
      {/* Show hint text only if status is "New" and profile not viewed yet */}
      {isNew && !profileViewed && (
        <span className="text-gray-500 text-xs italic">View profile first</span>
      )}
    </div>
  );
}
