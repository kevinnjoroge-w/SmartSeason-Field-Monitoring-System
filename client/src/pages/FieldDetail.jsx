import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fieldsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { StagePill } from '../components/StagePill';

export const FieldDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [field, setField] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [notes, setNotes] = useState('');
  const [newStage, setNewStage] = useState('');
  const [assignAgentId, setAssignAgentId] = useState('');

  const fetchData = async () => {
    try {
      const [fieldRes, updatesRes] = await Promise.all([
        fieldsService.getById(id),
        fieldsService.getUpdates(id)
      ]);
      setField(fieldRes.data);
      setUpdates(updatesRes.data);
      setNewStage(fieldRes.data.stage);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch field details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!notes && !newStage) return;
    try {
      await fieldsService.addUpdate(id, notes, newStage !== field.stage ? newStage : null);
      setNotes('');
      fetchData();
    } catch (err) {
      alert('Failed to add update');
    }
  };

  const handleAssign = async () => {
    if (!assignAgentId) return;
    try {
      await fieldsService.assign(id, assignAgentId);
      fetchData();
      setAssignAgentId('');
    } catch (err) {
      alert('Failed to assign field');
    }
  };

  if (loading) return <div className="p-8">Loading field details...</div>;
  if (error) return <div className="p-8 text-status-risk">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 pb-12">
      <Link to="/fields" className="text-earth-600 hover:text-earth-800 text-sm font-medium mb-6 inline-block">&larr; Back to Fields</Link>
      
      <div className="bg-white rounded-2xl border border-earth-200 p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-earth-800 tracking-tight">{field.name}</h1>
            <p className="text-earth-600 mt-1">Planted on {new Date(field.planting_date).toLocaleDateString()}</p>
          </div>
          <StatusBadge status={field.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-earth-100/50 p-4 rounded-xl mb-6 border border-earth-100">
          <div>
            <p className="text-sm font-medium text-earth-600">Crop Type</p>
            <p className="text-lg font-bold text-earth-800">{field.crop_type}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-earth-600 mb-2">Current Stage</p>
            <StagePill stage={field.stage} />
          </div>
          <div>
            <p className="text-sm font-medium text-earth-600">Assigned To</p>
            <p className="text-lg font-bold text-earth-800">{field.agent_name || 'Unassigned'}</p>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="flex gap-2 items-end pt-4 border-t border-earth-200">
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Assign Agent (ID)</label>
              <input type="number" placeholder="Agent ID" className="px-3 py-1.5 border border-earth-200 rounded text-sm w-32 focus:outline-none focus:border-earth-600" value={assignAgentId} onChange={e => setAssignAgentId(e.target.value)} />
            </div>
            <button onClick={handleAssign} className="px-3 py-1.5 bg-earth-800 text-earth-100 rounded hover:bg-earth-700 text-sm font-medium">Assign</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Updates Timeline */}
        <div>
          <h2 className="text-xl font-bold text-earth-800 mb-6">Timeline History</h2>
          {updates.length === 0 ? (
            <p className="text-earth-600">No updates logged yet.</p>
          ) : (
            <div className="space-y-6">
              {updates.map(u => (
                <div key={u.id} className="relative pl-6 border-l-2 border-earth-200">
                  <div className="absolute w-3 h-3 bg-earth-600 rounded-full -left-[7px] top-1.5"></div>
                  <div className="bg-white border border-earth-200 p-4 rounded-xl shadow-sm">
                    <div className="text-xs text-earth-500 mb-2">{new Date(u.created_at).toLocaleString()} by {u.agent_name}</div>
                    {u.new_stage && (
                      <div className="mb-2"><StagePill stage={u.new_stage} /></div>
                    )}
                    {u.notes && (
                      <p className="text-earth-700 text-sm bg-earth-100 p-3 rounded-lg border border-earth-200/50">{u.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Update Form (Agent Only) */}
        {user.role === 'agent' && field.assigned_agent_id === user.id && field.stage !== 'Harvested' && (
          <div>
            <h2 className="text-xl font-bold text-earth-800 mb-6">Log Observation</h2>
            <form onSubmit={handleAddUpdate} className="bg-white border border-earth-200 p-6 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Update Stage</label>
                <select 
                  className="w-full px-3 py-2 border border-earth-200 rounded-lg focus:outline-none focus:border-earth-600 bg-white"
                  value={newStage} 
                  onChange={e => setNewStage(e.target.value)}
                >
                  <option value="Planted">Planted</option>
                  <option value="Growing">Growing</option>
                  <option value="Ready">Ready</option>
                  <option value="Harvested">Harvested</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Observation Notes</label>
                <textarea 
                  rows="4"
                  className="w-full px-3 py-2 border border-earth-200 rounded-lg focus:outline-none focus:border-earth-600 bg-white"
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Record growth, issues, treatments..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-earth-800 text-earth-100 rounded-lg hover:bg-earth-700 font-medium transition"
              >
                Save Update
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
