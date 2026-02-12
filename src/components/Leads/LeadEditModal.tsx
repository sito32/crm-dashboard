import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Facebook, Twitter, Mail, Phone, Globe } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { Button } from '../UI/Button';
import { useStore } from '../../store/useStore';
import type { Lead, PlatformType, LeadStatus } from '../../types';

interface LeadEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  tags: string[];
}

export function LeadEditModal({ isOpen, onClose, lead, tags }: LeadEditModalProps) {
  const { addLead, updateLead } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    platformType: 'instagram' as PlatformType,
    profileLink: '',
    email: '',
    phone: '',
    status: 'New' as LeadStatus,
    selectedTags: [] as string[],
    notes: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        firstName: lead.firstName,
        lastName: lead.lastName || '',
        platformType: lead.platformType,
        profileLink: lead.profileLink || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status,
        selectedTags: lead.tags,
        notes: lead.notes,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        platformType: 'instagram',
        profileLink: '',
        email: '',
        phone: '',
        status: 'New',
        selectedTags: [],
        notes: '',
      });
    }
  }, [lead, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const leadData = {
      firstName: formData.firstName,
      lastName: formData.lastName || undefined,
      platformType: formData.platformType,
      profileLink: formData.profileLink || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      status: formData.status,
      tags: formData.selectedTags,
      notes: formData.notes,
      source: 'other' as const,
      isClient: false,
    };

    if (lead) {
      updateLead(lead.id, leadData);
    } else {
      addLead(leadData);
    }

    onClose();
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const platforms: { value: PlatformType; label: string; icon: React.ReactNode }[] = [
    { value: 'instagram', label: 'Instagram', icon: <Instagram size={18} /> },
    { value: 'twitter', label: 'Twitter', icon: <Twitter size={18} /> },
    { value: 'facebook', label: 'Facebook', icon: <Facebook size={18} /> },
    { value: 'email', label: 'Email', icon: <Mail size={18} /> },
    { value: 'phone', label: 'Phone', icon: <Phone size={18} /> },
    { value: 'other', label: 'Other', icon: <Globe size={18} /> },
  ];

  const statuses: LeadStatus[] = ['New', 'Sent', 'Replied', 'Interested', 'Client', 'Archived'];

  return (
    <AnimatePresence>
      {isOpen && (
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
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {lead ? 'Edit Lead' : 'Add New Lead'}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {lead ? 'Update lead information' : 'Fill in the lead details'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Platform Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform Type *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {platforms.map((platform) => (
                      <button
                        key={platform.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, platformType: platform.value })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                          formData.platformType === platform.value
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {platform.icon}
                        <span className="text-xs">{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Link */}
                {(formData.platformType === 'instagram' ||
                  formData.platformType === 'twitter' ||
                  formData.platformType === 'facebook' ||
                  formData.platformType === 'other') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profile Link
                    </label>
                    <input
                      type="url"
                      value={formData.profileLink}
                      onChange={(e) => setFormData({ ...formData, profileLink: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                )}

                {/* Email */}
                {formData.platformType === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder="john@example.com"
                    />
                  </div>
                )}

                {/* Phone */}
                {formData.platformType === 'phone' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status} className="bg-gray-800">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          formData.selectedTags.includes(tag)
                            ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full h-24 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                    placeholder="Add any notes about this lead..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    {lead ? 'Update Lead' : 'Add Lead'}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
