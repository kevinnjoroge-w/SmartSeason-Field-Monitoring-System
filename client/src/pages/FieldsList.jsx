import { useState, useEffect } from 'react';
import { fieldsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { StagePill } from '../components/StagePill';

export const FieldsList = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for Admin to create
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', crop_type: '', planting_date: '', stage: 'Planted' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchFields = async () => {
    try {
      const res = await fieldsService.getAll();
      setFields(res.data);
    } catch (err) {
      setError('Failed to fetch fields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.crop_type || !formData.planting_date) {
      setFormError('Please fill in all required fields');
      return;
    }
    setFormSubmitting(true);
    setFormError('');
    try {
      const res = await fieldsService.create(formData);
      if (res.success) {
        setFields([res.data, ...fields]);
        setShowCreateForm(false);
        setFormData({ name: '', crop_type: '', planting_date: '', stage: 'Planted' });
      }
    } catch (err) {
      setFormError('Failed to create field');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading fields...</div>;
  if (error) return <div className="p-8 text-status-risk">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-earth-800">Fields Management</h1>
          <p className="text-earth-600 mt-1">Directory of all monitored fields.</p>
        </div>
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-amber-dark text-white rounded-lg hover:bg-amber-dark/90 transition font-medium"
          >
            {showCreateForm ? 'Cancel' : 'Add New Field'}
          </button>
        )}
      </div>

      {showCreateForm && user.role === 'admin' && (
        <div className="mb-8 p-6 bg-white border border-earth-200 rounded-xl">
          <h2 className="text-lg font-bold text-earth-800 mb-4">Create New Field</h2>
          {formError && <div className="mb-4 text-status-risk text-sm">{formError}</div>}
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Field Name*</label>
              <input type="text"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg focus:outline-none focus:border-earth-600 focus:ring-1 focus:ring-earth-600 bg-white"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Crop Type*</label>
              <input type="text"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg focus:outline-none focus:border-earth-600 bg-white"
                value={formData.crop_type} onChange={(e) => setFormData({...formData, crop_type: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Planting Date*</label>
              <input type="date"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg focus:outline-none focus:border-earth-600 bg-white"
                value={formData.planting_date} onChange={(e) => setFormData({...formData, planting_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Initial Stage</label>
              <select
                className="w-full px-3 py-2 border border-earth-200 rounded-lg focus:outline-none focus:border-earth-600 bg-white"
                value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})}
              >
                <option value="Planted">Planted</option>
                <option value="Growing">Growing</option>
                <option value="Ready">Ready</option>
                <option value="Harvested">Harvested</option>
              </select>
            </div>
            <div className="md:col-span-2 pt-2">
              <button 
                type="submit" 
                disabled={formSubmitting}
                className="px-6 py-2 bg-earth-800 text-earth-100 rounded-lg hover:bg-earth-700 transition disabled:opacity-50"
              >
                {formSubmitting ? 'Creating...' : 'Create Field'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-earth-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-earth-100 text-earth-600">
              <tr>
                <th className="px-6 py-3 font-semibold">Field Name</th>
                <th className="px-6 py-3 font-semibold">Crop</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Current Stage</th>
                <th className="px-6 py-3 font-semibold">Planted On</th>
                {user.role === 'admin' && <th className="px-6 py-3 font-semibold">Assigned Agent</th>}
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-200">
              {fields.length === 0 && (
                <tr><td colSpan={user.role === 'admin' ? 7 : 6} className="px-6 py-4 text-center text-earth-600">No fields active.</td></tr>
              )}
              {fields.map(f => (
                <tr key={f.id} className="hover:bg-earth-100/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-earth-800">{f.name}</td>
                  <td className="px-6 py-4 text-earth-700">{f.crop_type}</td>
                  <td className="px-6 py-4"><StatusBadge status={f.status} /></td>
                  <td className="px-6 py-4"><StagePill stage={f.stage} /></td>
                  <td className="px-6 py-4 text-earth-600">{new Date(f.planting_date).toLocaleDateString()}</td>
                  {user.role === 'admin' && (
                    <td className="px-6 py-4 text-earth-600">{f.agent_name || <span className="text-amber-dark text-xs font-bold uppercase tracking-wider">Unassigned</span>}</td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <Link to={`/fields/${f.id}`} className="text-earth-600 hover:text-earth-800 font-medium whitespace-nowrap">
                      View Details &rarr;
                    </Link>
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
