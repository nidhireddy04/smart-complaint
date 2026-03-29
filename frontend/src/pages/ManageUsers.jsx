import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    usersAPI.getAll()
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter);

  const roleColors = {
    ADMIN: 'var(--danger)',
    STAFF: 'var(--accent)',
    USER: 'var(--primary)',
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>👥 Manage Users</h2>
          <div className="page-header-subtitle">{users.length} registered users</div>
        </div>
      </div>

      <div className="filter-bar">
        {['ALL', 'ADMIN', 'STAFF', 'USER'].map(role => (
          <button
            key={role}
            className={`btn ${roleFilter === role ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setRoleFilter(role)}
          >
            {role === 'ALL' ? '👥 All' : role === 'ADMIN' ? '👑 Admins' : role === 'STAFF' ? '🔧 Staff' : '👤 Users'}
            {' '}({role === 'ALL' ? users.length : users.filter(u => u.role === role).length})
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>#{u.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${roleColors[u.role]}, var(--bg-surface))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {u.name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className="badge" style={{
                    background: `${roleColors[u.role]}22`,
                    color: roleColors[u.role],
                    border: `1px solid ${roleColors[u.role]}44`,
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>{u.department || '—'}</td>
                <td>{u.phone || '—'}</td>
                <td>
                  <span className="badge" style={{
                    background: u.active ? 'rgba(50,200,100,0.12)' : 'rgba(230,73,73,0.12)',
                    color: u.active ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
