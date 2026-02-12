import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  UserCheck,
  MessageSquareText,
  Settings,
  ChevronDown,
  ChevronRight,
  Phone,
  Globe,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  {
    id: 'leads',
    label: 'Leads',
    icon: <Users size={20} />,
    children: [
      {
        id: 'leads-social',
        label: 'Social Media Leads',
        icon: <Globe size={18} />,
        children: [
          { id: 'leads-instagram', label: 'Instagram', icon: <Instagram size={16} /> },
          { id: 'leads-twitter', label: 'Twitter', icon: <Twitter size={16} /> },
          { id: 'leads-facebook', label: 'Facebook', icon: <Facebook size={16} /> },
        ],
      },
      {
        id: 'leads-other',
        label: 'Other Leads',
        icon: <Mail size={18} />,
        children: [
          { id: 'leads-email', label: 'Email', icon: <Mail size={16} /> },
          { id: 'leads-phone', label: 'Phone', icon: <Phone size={16} /> },
        ],
      },
    ],
  },
  { id: 'clients', label: 'Clients (CRM)', icon: <UserCheck size={20} /> },
  { id: 'ai-builder', label: 'AI Message Builder', icon: <MessageSquareText size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

function NavItemComponent({
  item,
  depth = 0,
  currentView,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  currentView: string;
  onNavigate: (view: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(
    item.children?.some(
      (c) => c.id === currentView || c.children?.some((cc) => cc.id === currentView)
    )
  );
  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentView === item.id;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div>
      <motion.button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          'hover:bg-white/10',
          isActive && 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30',
          depth === 1 && 'pl-8',
          depth === 2 && 'pl-12'
        )}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <span
          className={cn(
            'transition-colors',
            isActive ? 'text-purple-400' : 'text-gray-400'
          )}
        >
          {item.icon}
        </span>
        <span
          className={cn(
            'flex-1 text-left text-sm font-medium',
            isActive ? 'text-white' : 'text-gray-300'
          )}
        >
          {item.label}
        </span>
        {hasChildren && (
          <span className="text-gray-500">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.id}
                item={child}
                depth={depth + 1}
                currentView={currentView}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentView, setCurrentView } = useStore();

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed left-0 top-0 h-full w-72 z-50',
          'bg-gray-900/80 backdrop-blur-xl',
          'border-r border-white/10',
          'flex flex-col',
          'shadow-2xl shadow-black/50'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <MessageSquareText size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">LeadFlow</h1>
                <p className="text-xs text-gray-500">Pro Dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              currentView={currentView}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">User</p>
              <p className="text-xs text-gray-500 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
