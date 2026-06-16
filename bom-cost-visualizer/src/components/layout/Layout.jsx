import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * @param {{
 *   children: import('react').ReactNode,
 *   activeSection: string,
 *   onNavigate: (section: string) => void,
 * }} props
 */
export default function Layout({ children, activeSection, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          activeSection={activeSection}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
