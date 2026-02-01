import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TimeTracker from './pages/TimeTracker';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MobileTimeTracker from './pages/MobileTimeTracker';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { GardenProvider } from './context/GardenContext';

function App() {
  return (
    <AuthProvider>
      <GardenProvider>
        <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/app" element={<TimeTracker />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mobile" element={<Navigate to="/mobile/app" replace />} />
          <Route path="/mobile/app" element={<MobileTimeTracker />} />
          {/* Support legacy route or random paths redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </GardenProvider>
    </AuthProvider>
  );
}

export default App;
