import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { Sprout, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StagePill } from '../components/StagePill';

export const AgentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getSummary();
        setData(res.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-status-risk">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-earth-800">My Assignments</h1>
          <p className="text-earth-600 mt-1">Overview of your assigned fields and recent activity.</p>
        </div>
        <Link 
          to="/fields" 
          className="px-4 py-2 bg-earth-800 text-earth-100 rounded-lg hover:bg-earth-700 transition"
        >
          View Assigned Fields
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard title="My Assigned Fields" value={data.totalFields} icon={LayoutDashboard} colorClass="text-earth-600 bg-earth-200/50" />
        <StatCard title="Active Fields" value={data.statusBreakdown.Active || 0} icon={Sprout} colorClass="text-status-active bg-status-active-bg" />
      </div>

      <div className="bg-white rounded-xl border border-earth-200 overflow-hidden">
        <div className="p-6 border-b border-earth-200">
          <h2 className="text-xl font-bold text-earth-800">My Recent Updates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-earth-100 text-earth-600">
              <tr>
                <th className="px-6 py-3 font-semibold">Field</th>
                <th className="px-6 py-3 font-semibold">New Stage</th>
                <th className="px-6 py-3 font-semibold w-1/2">Notes</th>
                <th className="px-6 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-200">
              {data.recentUpdates.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-earth-600">No recent updates found.</td></tr>
              )}
              {data.recentUpdates.map(update => (
                <tr key={update.id} className="hover:bg-earth-100/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-earth-800">{update.field_name}</td>
                  <td className="px-6 py-4">
                    {update.new_stage ? <StagePill stage={update.new_stage} /> : <span className="text-earth-400">-</span>}
                  </td>
                  <td className="px-6 py-4 text-earth-600 truncate max-w-sm" title={update.notes}>{update.notes || '-'}</td>
                  <td className="px-6 py-4 text-earth-500 whitespace-nowrap">
                    {new Date(update.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
