import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintsAPI } from '../services/api';

export default function MyComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    complaintsAPI.getByUser(user.id)
      .then(data => { setComplaints(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const filtered = complaints
    .filter(c => filter === 'ALL' || c.status === filter)
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()) ||
                 c.description.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>📋 My Complaints</h2>
          <div className="page-header-subtitle">{complaints.length} total complaints</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
          ✏️ New Complaint
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="🔍 Search complaints..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="search-complaints"
        />
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)} id="filter-status">
          <option value="ALL">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No complaints found</div>
          <div className="empty-state-sub">
            {complaints.length === 0 ? 'You haven\'t submitted any complaints yet.' : 'Try adjusting your filters.'}
          </div>
          {complaints.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>Submit Complaint</button>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(c => (
            <div key={c.id} className="complaint-card" onClick={() => navigate(`/complaints/${c.id}`)}>
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
              <div className="complaint-card-title">{c.title}</div>
              <div className="complaint-card-desc">{c.description}</div>
              <div className="complaint-card-meta">
                <span className="complaint-card-meta-item">📁 {c.category?.replace('_', ' ')}</span>
                <span className="complaint-card-meta-item">📍 {c.location || 'N/A'}</span>
                <span className="complaint-card-meta-item">📅 {new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
