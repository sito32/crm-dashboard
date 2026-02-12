import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareText,
  User,
  Sparkles,
  Copy,
  ExternalLink,
  Check,
  X,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Save,
} from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { Button } from '../UI/Button';
import { useStore } from '../../store/useStore';
import type { AIProfile, Lead } from '../../types';
import toast, { Toaster } from 'react-hot-toast';

export function AIMessageBuilder() {
  const { leads, aiProfiles, addAIProfile, updateAIProfile, deleteAIProfile, markMessageSent } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<AIProfile | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    highlights: '',
  });
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AIProfile | null>(null);
  const [copied, setCopied] = useState(false);

  // Only show leads with "New" status in AI Message Builder
  const eligibleLeads = leads.filter((l) => !l.isClient && l.status === 'New');

  const handleProfileReview = () => {
    if (!selectedLead) {
      toast.error('Please select a lead first');
      return;
    }
    setProfileData({
      name: selectedLead.firstName,
      bio: selectedLead.bio || '',
      highlights: '',
    });
    setStep(2);
  };

  const generateMessage = () => {
    if (!selectedProfile) {
      toast.error('Please select a message profile');
      return;
    }

    let message = selectedProfile.template;
    message = message.replace(/{name}/g, profileData.name);
    message = message.replace(/{bio_highlight}/g, profileData.highlights || profileData.bio || 'your content');
    message = message.replace(/{offer}/g, selectedProfile.offer);
    message = message.replace(/{cta}/g, selectedProfile.cta);
    message = message.replace(/{platform}/g, selectedLead?.platformType || 'social media');

    setGeneratedMessage(message);
    setStep(3);
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    toast.success('Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openProfile = () => {
    if (selectedLead?.profileLink) {
      window.open(selectedLead.profileLink, '_blank');
    }
  };

  const handleMessageSent = (sent: boolean) => {
    if (selectedLead) {
      markMessageSent(selectedLead.id, sent);
      toast.success(sent ? 'Marked as sent!' : 'Marked as not sent');
      // Reset
      setStep(1);
      setSelectedLead(null);
      setGeneratedMessage('');
    }
  };

  const resetWorkflow = () => {
    setStep(1);
    setSelectedLead(null);
    setSelectedProfile(null);
    setGeneratedMessage('');
    setProfileData({ name: '', bio: '', highlights: '' });
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-purple-400" />
            AI Message Builder
          </h1>
          <p className="text-gray-400 mt-1">Create personalized outreach messages</p>
        </div>
        <Button
          variant="secondary"
          icon={<Plus size={18} />}
          onClick={() => {
            setEditingProfile(null);
            setShowProfileEditor(true);
          }}
        >
          New Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Profiles */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Message Profiles</h3>
            <div className="space-y-2">
              {aiProfiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedProfile?.id === profile.id
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedProfile(profile)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{profile.name}</p>
                      <p className="text-gray-400 text-sm capitalize">{profile.tone} • {profile.length}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProfile(profile);
                          setShowProfileEditor(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAIProfile(profile.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Workflow Steps */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-sm ${step >= s ? 'text-white' : 'text-gray-500'}`}>
                  {s === 1 ? 'Select Lead' : s === 2 ? 'Review Profile' : 'Send Message'}
                </span>
                {s < 3 && <ChevronRight size={18} className="text-gray-600 mx-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Select Lead */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <User size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Step 1: Select Lead</h3>
                      <p className="text-gray-400 text-sm">Choose a lead to create a message for</p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                    {eligibleLeads.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No eligible leads available</p>
                    ) : (
                      eligibleLeads.map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            selectedLead?.id === lead.id
                              ? 'bg-purple-500/20 border border-purple-500/30'
                              : 'bg-white/5 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{lead.firstName}</p>
                              <p className="text-gray-400 text-sm capitalize">{lead.platformType}</p>
                            </div>
                            {lead.profileLink && (
                              <ExternalLink size={16} className="text-gray-500" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleProfileReview}
                    disabled={!selectedLead}
                    className="w-full"
                  >
                    Continue to Profile Review
                  </Button>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 2: Profile Review */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <MessageSquareText size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Step 2: Profile Review</h3>
                      <p className="text-gray-400 text-sm">Extract or paste profile information</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio / Description (paste from profile)
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="Paste the profile bio here..."
                        className="w-full h-24 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Highlights (what stood out to you)
                      </label>
                      <input
                        type="text"
                        value={profileData.highlights}
                        onChange={(e) => setProfileData({ ...profileData, highlights: e.target.value })}
                        placeholder="e.g., your amazing travel content"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>

                    {selectedLead?.profileLink && (
                      <Button
                        variant="secondary"
                        icon={<ExternalLink size={16} />}
                        onClick={() => window.open(selectedLead.profileLink, '_blank')}
                        className="w-full"
                      >
                        Open Profile to Copy Bio
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={generateMessage}
                      disabled={!selectedProfile}
                      className="flex-1"
                    >
                      Generate Message
                    </Button>
                  </div>

                  {!selectedProfile && (
                    <p className="text-yellow-400 text-sm text-center mt-3">
                      Please select a message profile from the left panel
                    </p>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* Step 3: Send Message */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard gradient="purple" className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Sparkles size={20} className="text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Step 3: Send Message</h3>
                      <p className="text-gray-400 text-sm">Copy and manually send your message</p>
                    </div>
                  </div>

                  {/* Generated Message */}
                  <div className="relative">
                    <textarea
                      value={generatedMessage}
                      onChange={(e) => setGeneratedMessage(e.target.value)}
                      className="w-full h-48 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 resize-none"
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

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button variant="secondary" icon={<Copy size={16} />} onClick={copyMessage}>
                      Copy Message
                    </Button>
                    <Button
                      variant="primary"
                      icon={<ExternalLink size={16} />}
                      onClick={openProfile}
                      disabled={!selectedLead?.profileLink}
                    >
                      Open Profile
                    </Button>
                  </div>

                  {/* Confirm Actions */}
                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white font-medium mb-3">Did you send the message?</p>
                    <div className="flex gap-3">
                      <Button
                        variant="success"
                        icon={<Check size={16} />}
                        onClick={() => handleMessageSent(true)}
                        className="flex-1"
                      >
                        Yes, Message Sent
                      </Button>
                      <Button
                        variant="danger"
                        icon={<X size={16} />}
                        onClick={() => handleMessageSent(false)}
                        className="flex-1"
                      >
                        No, Not Sent
                      </Button>
                    </div>
                  </div>

                  <Button variant="ghost" onClick={resetWorkflow} className="w-full mt-4">
                    Start Over
                  </Button>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Profile Editor Modal */}
      <AnimatePresence>
        {showProfileEditor && (
          <ProfileEditorModal
            profile={editingProfile}
            onSave={(profile) => {
              if (editingProfile) {
                updateAIProfile(editingProfile.id, profile);
              } else {
                addAIProfile(profile);
              }
              setShowProfileEditor(false);
              setEditingProfile(null);
            }}
            onClose={() => {
              setShowProfileEditor(false);
              setEditingProfile(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileEditorModal({
  profile,
  onSave,
  onClose,
}: {
  profile: AIProfile | null;
  onSave: (profile: Omit<AIProfile, 'id'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    tone: profile?.tone || 'professional',
    offer: profile?.offer || '',
    cta: profile?.cta || '',
    length: profile?.length || 'medium',
    template: profile?.template || `Hi {name}! 👋

I came across your profile and was impressed by {bio_highlight}.

{offer}

{cta}`,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<AIProfile, 'id'>);
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
            <h2 className="text-xl font-bold text-white">
              {profile ? 'Edit Profile' : 'New Message Profile'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                placeholder="e.g., Video Editing Offer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as AIProfile['tone'] })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="professional" className="bg-gray-800">Professional</option>
                  <option value="casual" className="bg-gray-800">Casual</option>
                  <option value="friendly" className="bg-gray-800">Friendly</option>
                  <option value="formal" className="bg-gray-800">Formal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Length</label>
                <select
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value as AIProfile['length'] })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="short" className="bg-gray-800">Short</option>
                  <option value="medium" className="bg-gray-800">Medium</option>
                  <option value="long" className="bg-gray-800">Long</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Offer</label>
              <input
                type="text"
                required
                value={formData.offer}
                onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                placeholder="e.g., Professional video editing services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Call to Action</label>
              <input
                type="text"
                required
                value={formData.cta}
                onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                placeholder="e.g., Would you be open to a quick chat?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message Template
                <span className="text-gray-500 ml-2">
                  (Use: {'{name}'}, {'{bio_highlight}'}, {'{offer}'}, {'{cta}'}, {'{platform}'})
                </span>
              </label>
              <textarea
                required
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="w-full h-40 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<Save size={16} />} className="flex-1">
                Save Profile
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
