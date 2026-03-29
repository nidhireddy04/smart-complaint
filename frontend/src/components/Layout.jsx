import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import NotificationPanel from './NotificationPanel';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      notificationsAPI.getUnreadCount(user.id)
        .then(data => setUnreadCount(data.count))
        .catch(() => {});
      const interval = setInterval(() => {
        notificationsAPI.getUnreadCount(user.id)
          .then(data => setUnreadCount(data.count))
          .catch(() => {});
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const role = user?.role;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['USER', 'ADMIN', 'STAFF'] },
    { path: '/complaints', label: 'My Complaints', icon: '📋', roles: ['USER'] },
    { path: '/complaints/new', label: 'New Complaint', icon: '✏️', roles: ['USER'] },
    { path: '/queue', label: 'My Queue', icon: '📥', roles: ['STAFF'] },
    { path: '/all-complaints', label: 'All Complaints', icon: '📁', roles: ['ADMIN'] },
    { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['ADMIN'] },
    { path: '/users', label: 'Manage Users', icon: '👥', roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">RX</div>
          <div>
            <h1>ResolveX</h1>
            <span>Complaint Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {filteredNav.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            {filteredNav.find(n => n.path === location.pathname)?.label || 'ResolveX'}
          </div>
          <div className="topbar-actions">
            <button
              className="btn-icon has-badge"
              onClick={() => setShowNotifications(!showNotifications)}
              id="notification-bell"
            >
              🔔
              {unreadCount > 0 && <span className="badge-dot"></span>}
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {showNotifications && (
        <NotificationPanel
          onClose={() => setShowNotifications(false)}
          onCountUpdate={setUnreadCount}
        />
      )}
    </div>
  );
}
