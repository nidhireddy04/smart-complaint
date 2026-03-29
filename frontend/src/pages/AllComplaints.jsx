import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';

export default function AllComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    complaintsAPI.getAll()
      .then(data => { setComplaints(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = complaints
    .filter(c => filter === 'ALL' || c.status === filter)
    .filter(c => priorityFilter === 'ALL' || c.priority === priorityFilter)
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()) ||
                 c.description.toLowerCase().includes(search.toLowerCase()) ||
                 String(c.id).includes(search));

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>📁 All Complaints</h2>
          <div className="page-header-subtitle">{complaints.length} total complaints in system</div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="🔍 Search by title, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="ALL">All Priority</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted By</th>
                <th>Assigned To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No complaints found</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                    <td style={{ fontWeight: 700 }}>#{c.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </td>
                    <td>{c.category?.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge badge-${c.priority?.toLowerCase()}`}>
                        <span className={`priority-dot ${c.priority?.toLowerCase()}`}></span>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status?.toLowerCase()}`}>{c.status?.replace('_', ' ')}</span>
                    </td>
                    <td>{c.user?.name || 'N/A'}</td>
                    <td>{c.assignedStaff?.name || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
