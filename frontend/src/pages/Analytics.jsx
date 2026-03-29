import { useEffect, useState } from 'react';
import { complaintsAPI } from '../services/api';

const CHART_COLORS = [
  'hsl(250, 80%, 60%)', 'hsl(170, 80%, 50%)', 'hsl(0, 80%, 60%)',
  'hsl(40, 95%, 55%)', 'hsl(145, 70%, 50%)', 'hsl(210, 80%, 60%)',
  'hsl(290, 60%, 55%)', 'hsl(20, 90%, 55%)',
];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsAPI.getAnalytics()
      .then(data => { setAnalytics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!analytics) return <div className="empty-state"><div className="empty-state-text">Failed to load analytics</div></div>;

  const total = analytics.total || 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>📈 Analytics Dashboard</h2>
          <div className="page-header-subtitle">System-wide complaint analytics and insights</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': 'var(--primary)' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(124,77,255,0.1)', borderColor: 'rgba(124,77,255,0.2)' }}>📊</div>
            <span className="stat-card-label">Total</span>
          </div>
          <div className="stat-card-value">{analytics.total}</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--success)' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(50,200,100,0.1)', borderColor: 'rgba(50,200,100,0.2)' }}>✅</div>
            <span className="stat-card-label">Resolved</span>
          </div>
          <div className="stat-card-value">{analytics.resolved}</div>
          <div className="stat-card-meta">{analytics.resolutionRate}% resolution rate</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--warning)' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(255,170,51,0.1)', borderColor: 'rgba(255,170,51,0.2)' }}>⏳</div>
            <span className="stat-card-label">Pending</span>
          </div>
          <div className="stat-card-value">{analytics.pending}</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent)' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(50,200,180,0.1)', borderColor: 'rgba(50,200,180,0.2)' }}>⏱️</div>
            <span className="stat-card-label">Avg Resolution</span>
          </div>
          <div className="stat-card-value">{analytics.avgResolutionHours}h</div>
          <div className="stat-card-meta">Average resolution time</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="two-col" style={{ marginBottom: '24px' }}>
        {/* Category Distribution */}
        <div className="chart-container">
          <h3>📁 Category Distribution</h3>
          <div className="chart-bar-group">
            {analytics.categoryDistribution && Object.entries(analytics.categoryDistribution).map(([cat, count], i) => (
              <div className="chart-bar-item" key={cat}>
                <span className="chart-bar-label">{cat.replace('_', ' ')}</span>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${Math.max((count / total) * 100, 8)}%`,
                      background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, transparent)`,
                    }}
                    data-value={count}
                  ></div>
                </div>
                <span className="chart-bar-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="chart-container">
          <h3>📊 Status Overview</h3>
          <div className="chart-bar-group">
            {analytics.statusDistribution && Object.entries(analytics.statusDistribution).map(([status, count], i) => {
              const statusColors = {
                SUBMITTED: 'hsl(210, 80%, 60%)',
                UNDER_REVIEW: 'hsl(40, 95%, 55%)',
                ASSIGNED: 'hsl(250, 80%, 60%)',
                IN_PROGRESS: 'hsl(190, 70%, 50%)',
                RESOLVED: 'hsl(145, 70%, 50%)',
                CLOSED: 'hsl(230, 15%, 55%)',
                REOPENED: 'hsl(0, 80%, 60%)',
              };
              return (
                <div className="chart-bar-item" key={status}>
                  <span className="chart-bar-label">{status.replace('_', ' ')}</span>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${Math.max((count / total) * 100, 8)}%`,
                        background: `linear-gradient(90deg, ${statusColors[status] || 'var(--primary)'}, transparent)`,
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

      {/* Priority + Department */}
      <div className="two-col">
        <div className="chart-container">
          <h3>🎯 Priority Distribution</h3>
          <div className="chart-bar-group">
            {analytics.priorityDistribution && Object.entries(analytics.priorityDistribution).map(([priority, count]) => {
              const colors = { CRITICAL: 'var(--danger)', HIGH: 'var(--warning)', MEDIUM: 'var(--primary)', LOW: 'var(--success)' };
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
                        width: `${Math.max((count / total) * 100, 8)}%`,
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

        <div className="chart-container">
          <h3>🏢 Department Workload</h3>
          {analytics.departmentDistribution && Object.keys(analytics.departmentDistribution).length > 0 ? (
            <div className="chart-bar-group">
              {Object.entries(analytics.departmentDistribution).map(([dept, count], i) => (
                <div className="chart-bar-item" key={dept}>
                  <span className="chart-bar-label">{dept}</span>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${Math.max((count / total) * 100, 8)}%`,
                        background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, transparent)`,
                      }}
                      data-value={count}
                    ></div>
                  </div>
                  <span className="chart-bar-value">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No department assignment data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
