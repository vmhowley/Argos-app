import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Report } from './pages/Report';
import { Detail } from './pages/Detail';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';
import { SOS } from './pages/SOS';
import { Verify } from './pages/Verify';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ensureAuthenticated } from './services/authService';

function App() {
  useEffect(() => {
    ensureAuthenticated();
  }, []);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sos" element={<SOS />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/report" element={<Report />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verify" element={<Verify />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
