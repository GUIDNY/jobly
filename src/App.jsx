import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Layout from './components/Layout';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import BotProfile from './pages/BotProfile';
import MyDashboard from './pages/MyDashboard';
import CreateBot from './pages/CreateBot';
import EditBot from './pages/EditBot';
import UserProfile from './pages/UserProfile';
import OrdersManager from './pages/OrdersManager';
import ProUpgrade from './pages/ProUpgrade';
import ExpertsEdit from './pages/ExpertsEdit';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Marketplace" element={<Marketplace />} />
            <Route path="/BotProfile" element={<BotProfile />} />
            <Route path="/MyDashboard" element={<MyDashboard />} />
            <Route path="/CreateBot" element={<CreateBot />} />
            <Route path="/EditBot" element={<EditBot />} />
            <Route path="/UserProfile" element={<UserProfile />} />
            <Route path="/OrdersManager" element={<OrdersManager />} />
            <Route path="/ProUpgrade" element={<ProUpgrade />} />
            <Route path="/ExpertsEdit" element={<ExpertsEdit />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Privacy" element={<Privacy />} />
            <Route path="/PrivacyPolicy" element={<Privacy />} />
            <Route path="/Terms" element={<Terms />} />
            <Route path="/Admin" element={<Admin />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
