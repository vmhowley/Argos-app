import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { PublicRoute } from './components/auth/PublicRoute';
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
function App() {
  // Automatic anonymous login removed to prevent duplicate users


  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Authenticated Redirects (Login/Signup/Onboarding hidden if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Semi-Public Routes (Accessible by all, but often used by authenticated) */}
          <Route path="/home" element={<Home />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sos" element={<SOS />} />

          {/* Protected Routes (Must be logged in) */}
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
