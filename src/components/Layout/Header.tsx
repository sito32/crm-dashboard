import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, currentView } = useStore();

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      'leads-instagram': 'Instagram Leads',
      'leads-twitter': 'Twitter Leads',
      'leads-facebook': 'Facebook Leads',
      'leads-email': 'Email Leads',
      'leads-phone': 'Phone Leads',
      clients: 'Clients (CRM)',
      'ai-builder': 'AI Message Builder',
      settings: 'Settings',
    };
    return titles[currentView] || 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-900/60 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onMenuClick}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={20} className="text-gray-300" />
          </motion.button>
          <div>
            <h2 className="text-xl font-bold text-white">{getPageTitle()}</h2>
            <p className="text-sm text-gray-500">Manage your leads and clients</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search leads..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-48"
            />
          </div>

          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} className="text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
          </motion.button>

          {/* User menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <motion.button
              onClick={logout}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <LogOut size={18} className="text-gray-400 hover:text-red-400" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
