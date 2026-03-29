import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { complaintsAPI } from '../services/api';

export default function StaffQueue() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');

  useEffect(() => {
    complaintsAPI.getByStaff(user.id)
      .then(data => { setComplaints(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleQuickUpdate = async (id, status) => {
    try {
      await complaintsAPI.updateStatus(id, {
        status,
        notes: status === 'IN_PROGRESS' ? 'Started working on this issue' : 'Issue has been resolved',
        performedById: user.id,
      });
      // Refresh
      const data = await complaintsAPI.getByStaff(user.id);
      setComplaints(data);
      addToast({ type: 'success', title: 'Updated!', message: `Complaint status changed to ${status.replace('_', ' ')}` });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const filtered = filter === 'ACTIVE'
    ? complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED')
    : filter === 'RESOLVED'
    ? complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED')
    : complaints;

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  const activeCount = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>📥 My Queue</h2>
          <div className="page-header-subtitle">
            {activeCount} active • {resolvedCount} resolved • {complaints.length} total
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <button className={`btn ${filter === 'ACTIVE' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter('ACTIVE')}>
          ⏳ Active ({activeCount})
        </button>
        <button className={`btn ${filter === 'RESOLVED' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter('RESOLVED')}>
          ✅ Resolved ({resolvedCount})
        </button>
        <button className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter('ALL')}>
          📋 All ({complaints.length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No complaints in this category</div>
          <div className="empty-state-sub">
            {filter === 'ACTIVE' ? 'All complaints have been resolved!' : 'No resolved complaints yet.'}
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(c => (
            <div key={c.id} className="complaint-card">
              <div className="complaint-card-header">
                <span className="complaint-card-id">#{c.id}</span>
                <span className={`badge badge-${c.priority?.toLowerCase()}`}>
                  <span className={`priority-dot ${c.priority?.toLowerCase()}`}></span>
                  {c.priority}
                </span>
                <span className={`badge badge-${c.status?.toLowerCase()}`} style={{ marginLeft: 'auto' }}>
                  {c.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="complaint-card-title" onClick={() => navigate(`/complaints/${c.id}`)} style={{ cursor: 'pointer' }}>
                {c.title}
              </div>
              <div className="complaint-card-desc">{c.description}</div>
              <div className="complaint-card-meta" style={{ marginBottom: '12px' }}>
                <span className="complaint-card-meta-item">📁 {c.category?.replace('_', ' ')}</span>
                <span className="complaint-card-meta-item">📍 {c.location || 'N/A'}</span>
                <span className="complaint-card-meta-item">👤 {c.user?.name}</span>
              </div>

              {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                  {c.status === 'ASSIGNED' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleQuickUpdate(c.id, 'IN_PROGRESS')}>
                      🔄 Start Working
                    </button>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={() => handleQuickUpdate(c.id, 'RESOLVED')}>
                    ✅ Mark Resolved
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/complaints/${c.id}`)}>
                    View Details →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
