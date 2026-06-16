import { useState } from 'react';
import { BomProvider } from './context/BomContext';
import { Layout } from './components/layout';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import DataTablePage from './pages/DataTablePage';

const SECTIONS = {
  dashboard: DashboardPage,
  upload: UploadPage,
  dataTable: DataTablePage,
};

function AppContent() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const ActivePage = SECTIONS[activeSection] ?? DashboardPage;

  return (
    <Layout activeSection={activeSection} onNavigate={setActiveSection}>
      <ActivePage onNavigate={setActiveSection} />
    </Layout>
  );
}

function App() {
  return (
    <BomProvider>
      <AppContent />
    </BomProvider>
  );
}

export default App;
