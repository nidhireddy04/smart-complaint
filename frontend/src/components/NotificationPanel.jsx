import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationPanel({ onClose, onCountUpdate }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      notificationsAPI.getByUser(user.id)
        .then(data => { setNotifications(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const markAsRead = async (id) => {
    await notificationsAPI.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const unread = notifications.filter(n => !n.read && n.id !== id).length;
    onCountUpdate(unread);
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onCountUpdate(0);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return '✅';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      default: return 'ℹ️';
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'SUCCESS': return 'rgba(50,200,100,0.15)';
      case 'WARNING': return 'rgba(255,170,51,0.15)';
      case 'ERROR': return 'rgba(230,73,73,0.15)';
      default: return 'rgba(100,150,255,0.15)';
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0,0,0,0.3)' }}></div>
      <div className="notification-panel">
        <div className="notification-panel-header">
          <h2>🔔 Notifications</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="notification-panel-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔕</div>
              <div className="empty-state-text">No notifications</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? 'unread' : ''}`}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <div
                  className="notification-item-icon"
                  style={{ background: getIconBg(n.type) }}
                >
                  {getIcon(n.type)}
                </div>
                <div className="notification-item-content">
                  <div className="notification-item-title">{n.title}</div>
                  <div className="notification-item-message">{n.message}</div>
                  <div className="notification-item-time">{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
