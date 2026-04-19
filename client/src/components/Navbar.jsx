import { Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-earth-800 text-earth-100 py-4 px-6 mb-8 flex justify-between items-center rounded-b-xl border-b-[6px] border-earth-600">
      <div className="flex items-center gap-2">
        <Leaf className="w-6 h-6 text-amber-mid" />
        <Link to="/" className="text-xl font-bold tracking-tight">SmartSeason</Link>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-sm">
          <span className="opacity-70 mr-2">Logged in as:</span>
          <span className="font-semibold text-amber-light">{user.name}</span>
          <span className="ml-2 px-2 py-0.5 bg-earth-700 rounded text-xs uppercase tracking-wider">{user.role}</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-earth-700 hover:bg-earth-600 transition-colors rounded text-sm font-medium border border-earth-600/50"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};
