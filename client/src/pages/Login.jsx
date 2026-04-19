import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-earth-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-earth-800 mb-4">
            <Leaf className="w-6 h-6 text-amber-mid" />
          </div>
          <h1 className="text-2xl font-bold text-earth-800">SmartSeason</h1>
          <p className="text-earth-600 mt-2">Field Monitoring System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-status-risk-bg text-status-risk text-sm font-medium border border-status-risk/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-earth-200 rounded-lg focus:outline-none focus:border-earth-600 focus:ring-1 focus:ring-earth-600 transition-colors bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@smartseason.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-earth-200 rounded-lg focus:outline-none focus:border-earth-600 focus:ring-1 focus:ring-earth-600 transition-colors bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-earth-800 hover:bg-earth-700 text-earth-100 font-medium rounded-lg transition-colors disabled:opacity-70 mt-6"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-earth-200 text-sm text-earth-600">
          <p className="font-medium mb-2">Demo Credentials:</p>
          <ul className="space-y-1">
            <li>Admin: admin@smartseason.com / admin123</li>
            <li>Agent: agent@smartseason.com / agent123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
