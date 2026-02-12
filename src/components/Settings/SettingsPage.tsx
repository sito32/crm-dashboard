import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Tag, Briefcase, Database, Plus, X, Save, AlertCircle } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { Button } from '../UI/Button';
import { useStore } from '../../store/useStore';
import toast, { Toaster } from 'react-hot-toast';

export function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState(settings.defaultCurrency);
  const [newTag, setNewTag] = useState('');
  const [newService, setNewService] = useState('');
  const [tags, setTags] = useState(settings.customTags);
  const [services, setServices] = useState(settings.services);

  const handleSave = () => {
    updateSettings({
      companyName,
      defaultCurrency: currency,
      customTags: tags,
      services,
    });
    toast.success('Settings saved successfully!');
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addService = () => {
    if (newService && !services.includes(newService)) {
      setServices([...services, newService]);
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter((s) => s !== service));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="text-purple-400" />
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your application settings</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-400" />
              General Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="USD" className="bg-gray-800">USD ($)</option>
                  <option value="EUR" className="bg-gray-800">EUR (€)</option>
                  <option value="GBP" className="bg-gray-800">GBP (£)</option>
                  <option value="CAD" className="bg-gray-800">CAD ($)</option>
                  <option value="AUD" className="bg-gray-800">AUD ($)</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Tag size={20} className="text-pink-400" />
              Custom Tags
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                placeholder="Add new tag..."
              />
              <Button variant="secondary" icon={<Plus size={18} />} onClick={addTag}>
                Add
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-green-400" />
              Services
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30"
                >
                  {service}
                  <button
                    onClick={() => removeService(service)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addService()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                placeholder="Add new service..."
              />
              <Button variant="secondary" icon={<Plus size={18} />} onClick={addService}>
                Add
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Database Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Database size={20} className="text-orange-400" />
              Data Storage
            </h2>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">Local Storage Mode</p>
                  <p className="text-yellow-300/70 text-sm mt-1">
                    Data is currently stored in your browser's local storage. To enable cloud persistence
                    and real-time sync across devices, configure Supabase environment variables.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-gray-400">Storage Type</p>
                <p className="text-white font-medium">Local Storage</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-gray-400">Sync Status</p>
                <p className="text-green-400 font-medium">Active (Local)</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="primary"
            size="lg"
            icon={<Save size={20} />}
            onClick={handleSave}
            className="w-full"
          >
            Save Settings
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
