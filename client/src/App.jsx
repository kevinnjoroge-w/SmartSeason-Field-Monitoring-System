import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { FieldsList } from './pages/FieldsList';
import { FieldDetail } from './pages/FieldDetail';

const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'agent') return <AgentDashboard />;
  
  return <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><DashboardRouter /></AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/fields" element={
            <ProtectedRoute>
              <AppLayout><FieldsList /></AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/fields/:id" element={
            <ProtectedRoute>
              <AppLayout><FieldDetail /></AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
