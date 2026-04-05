import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';

import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import CardPage from './pages/CardPage';
import DashboardPage from './pages/DashboardPage';
import VizzitAdmin from './pages/VizzitAdmin';
import ProUpgrade from './pages/ProUpgrade';
import StoreBuilderPage from './pages/StoreBuilderPage';
import StorePage from './pages/StorePage';
import WarehousePage from './pages/WarehousePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/builder/:cardId" element={<BuilderPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/store-builder" element={<StoreBuilderPage />} />
          <Route path="/store-builder/:storeId" element={<StoreBuilderPage />} />
          <Route path="/store/:slug" element={<StorePage />} />
          <Route path="/admin" element={<VizzitAdmin />} />
          <Route path="/pro" element={<ProUpgrade />} />
          <Route path="/c/:slug" element={<CardPage />} />
          <Route path="/:slug" element={<CardPage />} />
          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
