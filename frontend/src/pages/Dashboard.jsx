import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintsAPI } from '../services/api';

const STATUS_COLORS = {
  SUBMITTED: 'var(--info)',
  UNDER_REVIEW: 'var(--warning)',
  ASSIGNED: 'var(--primary)',
  IN_PROGRESS: 'hsl(190, 70%, 50%)',
  RESOLVED: 'var(--success)',
  CLOSED: 'var(--text-muted)',
  REOPENED: 'var(--danger)',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'ADMIN') {
          const [analyticsData, complaintsData] = await Promise.all([
            complaintsAPI.getAnalytics(),
            complaintsAPI.getAll()
          ]);
          setAnalytics(analyticsData);
          setComplaints(complaintsData);
        } else if (user.role === 'STAFF') {
          const data = await complaintsAPI.getByStaff(user.id);
          setComplaints(data);
        } else {
          const data = await complaintsAPI.getByUser(user.id);
          setComplaints(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div className="loading-container"><div className="spinner"></div><span className="loading-text">Loading dashboard...</span></div>;

  const total = analytics?.total || complaints.length;
  const resolved = analytics?.resolved || complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const pending = analytics?.pending || complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const critical = complaints.filter(c => c.priority === 'CRITICAL').length;

  const recentComplaints = [...complaints].slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Welcome back, {user.name?.split(' ')[0]} 👋</h2>
          <div className="page-header-subtitle">
            {user.role === 'ADMIN' ? 'System overview and management' :
             user.role === 'STAFF' ? 'Your assigned complaints' :
             'Track your complaint status'}
          </div>
        </div>
        {user.role === 'USER' && (
          <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
            ✏️ New Complaint
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': 'var(--primary)' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(124,77,255,0.1)', borderColor: 'rgba(124,77,255,0.2)' }}>📊</div>
            <span className="stat-card-label">Total</span>
          </div>
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-meta">All complaints</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--warning)' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(255,170,51,0.1)', borderColor: 'rgba(255,170,51,0.2)' }}>⏳</div>
            <span className="stat-card-label">Pending</span>
          </div>
          <div className="stat-card-value">{pending}</div>
          <div className="stat-card-meta">Awaiting resolution</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--success)' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(50,200,100,0.1)', borderColor: 'rgba(50,200,100,0.2)' }}>✅</div>
            <span className="stat-card-label">Resolved</span>
          </div>
          <div className="stat-card-value">{resolved}</div>
          <div className="stat-card-meta">{total > 0 ? Math.round((resolved / total) * 100) : 0}% resolution rate</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--danger)' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(230,73,73,0.1)', borderColor: 'rgba(230,73,73,0.2)' }}>🔴</div>
            <span className="stat-card-label">Critical</span>
          </div>
          <div className="stat-card-value">{critical}</div>
          <div className="stat-card-meta">High priority issues</div>
        </div>
      </div>

      {/* Charts for Admin */}
      {user.role === 'ADMIN' && analytics && (
        <div className="two-col" style={{ marginBottom: '28px' }}>
          <div className="chart-container">
            <h3>📊 Status Distribution</h3>
            <div className="chart-bar-group">
              {analytics.statusDistribution && Object.entries(analytics.statusDistribution).map(([status, count]) => (
                <div className="chart-bar-item" key={status}>
                  <span className="chart-bar-label">{status.replace('_', ' ')}</span>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${Math.max((count / total) * 100, 5)}%`,
                        background: `linear-gradient(90deg, ${STATUS_COLORS[status] || 'var(--primary)'}, transparent)`,
                      }}
                      data-value={count}
                    ></div>
                  </div>
                  <span className="chart-bar-value">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <h3>📈 Priority Breakdown</h3>
            <div className="chart-bar-group">
              {analytics.priorityDistribution && Object.entries(analytics.priorityDistribution).map(([priority, count]) => {
                const colors = {
                  CRITICAL: 'var(--danger)',
                  HIGH: 'var(--warning)',
                  MEDIUM: 'var(--primary)',
                  LOW: 'var(--success)',
                };
                return (
                  <div className="chart-bar-item" key={priority}>
                    <span className="chart-bar-label">
                      <span className={`priority-dot ${priority.toLowerCase()}`} style={{ marginRight: '6px' }}></span>
                      {priority}
                    </span>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{
                          width: `${Math.max((count / total) * 100, 5)}%`,
                          background: `linear-gradient(90deg, ${colors[priority]}, transparent)`,
                        }}
                        data-value={count}
                      ></div>
                    </div>
                    <span className="chart-bar-value">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div className="glass-card">
        <h3 className="section-title">
          📋 {user.role === 'USER' ? 'Your Recent Complaints' : user.role === 'STAFF' ? 'Assigned to You' : 'Recent Complaints'}
        </h3>
        {recentComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No complaints yet</div>
            {user.role === 'USER' && (
              <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>Submit your first complaint</button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map(c => (
                <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                  <td>#{c.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</td>
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
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
