import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { LeadsTable } from './components/Leads/LeadsTable';
import { ClientsPage } from './components/Clients/ClientsPage';
import { AIMessageBuilder } from './components/AIBuilder/AIMessageBuilder';
import { SettingsPage } from './components/Settings/SettingsPage';
import { LandingPage } from './components/Landing/LandingPage';

export function App() {
  const { currentView, sidebarOpen, toggleSidebar } = useStore();
  const [showLanding, setShowLanding] = useState(false);

  // Handle landing page route
  if (typeof window !== 'undefined' && window.location.hash === '#landing') {
    return <LandingPage />;
  }

  // Keyboard shortcut (Ctrl + L)
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'l') {
        setShowLanding((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (showLanding) {
    return (
      <div>
        <button
          onClick={() => setShowLanding(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Back to App
        </button>
        <LandingPage />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads-instagram':
        return <LeadsTable filterPlatform="instagram" />;
      case 'leads-twitter':
        return <LeadsTable filterPlatform="twitter" />;
      case 'leads-facebook':
        return <LeadsTable filterPlatform="facebook" />;
      case 'leads-email':
        return <LeadsTable filterPlatform="email" />;
      case 'leads-phone':
        return <LeadsTable filterPlatform="phone" />;
      case 'leads-social':
      case 'leads-other':
      case 'leads':
        return <LeadsTable />;
      case 'clients':
        return <ClientsPage />;
      case 'ai-builder':
        return <AIMessageBuilder />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />

      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-72' : 'ml-0'
        }`}
      >
        <Header onMenuClick={toggleSidebar} />
        <main className="min-h-[calc(100vh-80px)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}