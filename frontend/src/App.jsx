import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages - We will create these shortly
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { FacilitiesPage, RulesPage, FAQPage, ContactPage, StaffPage, GalleryPage } from './pages/ExtraPages';

// Custom Private Route component
const PrivateRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roleRequired && user.role !== roleRequired) {
      return <Navigate to={`/${user.role}-dashboard`} replace />;
  }
  
  return children;
};

function App() {
  return (
    <>
      {/* We can place a global navbar here later if needed, 
          but original design had split views. Let's use routes. */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        
        {/* Extra Pages */}
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/gallery" element={<GalleryPage />} />

        <Route path="/student-dashboard/*" element={
            <PrivateRoute roleRequired="student">
                <StudentDashboard />
            </PrivateRoute>
        } />
        
        <Route path="/admin-dashboard/*" element={
            <PrivateRoute roleRequired="admin">
                <AdminDashboard />
            </PrivateRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
