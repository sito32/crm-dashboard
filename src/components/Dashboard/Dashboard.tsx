import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Instagram,
  Twitter,
  Facebook,
  Mail,
  Phone,
  Globe,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { useStore } from '../../store/useStore';

export function Dashboard() {
  const { getStats, leads } = useStore();
  const stats = getStats();

  const mainStats = [
    {
      label: 'Today\'s Leads',
      value: stats.todayLeads,
      change: stats.yesterdayLeads > 0 ? ((stats.todayLeads - stats.yesterdayLeads) / stats.yesterdayLeads) * 100 : 0,
      icon: <Users size={24} />,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Yesterday\'s Leads',
      value: stats.yesterdayLeads,
      icon: <TrendingUp size={24} />,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      icon: <Users size={24} />,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Messages Sent Today',
      value: stats.todayMessages,
      icon: <MessageSquare size={24} />,
      gradient: 'from-orange-500 to-yellow-500',
    },
  ];

  const platformStats = [
    {
      platform: 'Instagram',
      count: stats.instagramCount,
      icon: <Instagram size={20} />,
      gradient: 'from-pink-500 via-purple-500 to-orange-500',
      percentage: stats.totalLeads > 0 ? (stats.instagramCount / stats.totalLeads) * 100 : 0,
    },
    {
      platform: 'Twitter',
      count: stats.twitterCount,
      icon: <Twitter size={20} />,
      gradient: 'from-sky-400 to-blue-500',
      percentage: stats.totalLeads > 0 ? (stats.twitterCount / stats.totalLeads) * 100 : 0,
    },
    {
      platform: 'Facebook',
      count: stats.facebookCount,
      icon: <Facebook size={20} />,
      gradient: 'from-blue-600 to-blue-400',
      percentage: stats.totalLeads > 0 ? (stats.facebookCount / stats.totalLeads) * 100 : 0,
    },
    {
      platform: 'Email',
      count: stats.emailCount,
      icon: <Mail size={20} />,
      gradient: 'from-emerald-500 to-teal-500',
      percentage: stats.totalLeads > 0 ? (stats.emailCount / stats.totalLeads) * 100 : 0,
    },
    {
      platform: 'Phone',
      count: stats.phoneCount,
      icon: <Phone size={20} />,
      gradient: 'from-violet-500 to-purple-500',
      percentage: stats.totalLeads > 0 ? (stats.phoneCount / stats.totalLeads) * 100 : 0,
    },
    {
      platform: 'Other',
      count: stats.otherCount,
      icon: <Globe size={20} />,
      gradient: 'from-gray-500 to-gray-400',
      percentage: stats.totalLeads > 0 ? (stats.otherCount / stats.totalLeads) * 100 : 0,
    },
  ];

  const recentLeads = leads.slice(-5).reverse();

  return (
    <div className="p-6 space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard hover className="p-6">
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                >
                  <span className="text-white">{stat.icon}</span>
                </div>
                {stat.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      stat.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stat.change >= 0 ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    <span>{Math.abs(stat.change).toFixed(0)}%</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Platform Stats & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Platform Distribution</h3>
            <div className="space-y-4">
              {platformStats.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${platform.gradient}`}
                      >
                        <span className="text-white">{platform.icon}</span>
                      </div>
                      <span className="text-white font-medium">{platform.platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{platform.count}</span>
                      <span className="text-gray-500 text-sm">
                        ({platform.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${platform.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${platform.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Clients Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard gradient="purple" className="p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <UserCheck size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Active Clients</h3>
                <p className="text-sm text-gray-400">Converted from leads</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-white mb-4">{stats.clientCount}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="text-green-400 font-medium">
                  {stats.totalLeads > 0
                    ? ((stats.clientCount / stats.totalLeads) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      stats.totalLeads > 0
                        ? (stats.clientCount / stats.totalLeads) * 100
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Leads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Leads</h3>
          {recentLeads.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No leads yet. Start adding some!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Platform</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <span className="text-white font-medium">{lead.firstName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <PlatformBadge platform={lead.platformType} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.div>
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Sent: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Replied: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Interested: 'bg-green-500/20 text-green-400 border-green-500/30',
    Client: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${
        colors[status] || colors.New
      }`}
    >
      {status}
    </span>
  );
}
