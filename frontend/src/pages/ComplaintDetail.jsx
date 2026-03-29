import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { complaintsAPI, usersAPI } from '../services/api';

function timeAgo(dateStr) {
  if (!dateStr) return 'N/A';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, t] = await Promise.all([
          complaintsAPI.getById(id),
          complaintsAPI.getTimeline(id),
        ]);
        setComplaint(c);
        setTimeline(t);
        setRating(c.rating || 0);

        if (user.role === 'ADMIN') {
          const staff = await usersAPI.getByRole('STAFF');
          setStaffList(staff);
        }
      } catch (err) {
        addToast({ type: 'error', title: 'Error', message: 'Complaint not found' });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const updated = await complaintsAPI.updateStatus(id, {
        status: newStatus,
        notes,
        performedById: user.id,
      });
      setComplaint(updated);
      setNotes('');
      const tl = await complaintsAPI.getTimeline(id);
      setTimeline(tl);
      addToast({ type: 'success', title: 'Status Updated', message: `Complaint is now ${newStatus.replace('_', ' ')}` });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleAssign = async () => {
    try {
      const updated = await complaintsAPI.assign(id, {
        staffId: selectedStaff || null,
        department: selectedDepartment || null,
        adminId: user.id,
      });
      setComplaint(updated);
      const tl = await complaintsAPI.getTimeline(id);
      setTimeline(tl);
      addToast({ type: 'success', title: 'Assigned!', message: 'Complaint has been assigned.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleRate = async (star) => {
    try {
      setRating(star);
      await complaintsAPI.rate(id, star);
      addToast({ type: 'success', title: 'Rated!', message: `You gave ${star} stars` });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!complaint) return <div className="empty-state"><div className="empty-state-text">Complaint not found</div></div>;

  const DEPARTMENTS = ['Infrastructure', 'IT Services', 'Electrical', 'Housekeeping', 'Transport', 'Academic'];

  const canManage = user.role === 'ADMIN' || (user.role === 'STAFF' && complaint.assignedStaff?.id === user.id);
  const isOwner = complaint.user?.id === user.id;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '8px' }}>
            ← Back
          </button>
          <h2>Complaint #{complaint.id}</h2>
          <div className="page-header-subtitle">{complaint.title}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`badge badge-${complaint.priority?.toLowerCase()}`}>
            <span className={`priority-dot ${complaint.priority?.toLowerCase()}`}></span>
            {complaint.priority}
          </span>
          <span className={`badge badge-${complaint.status?.toLowerCase()}`}>
            {complaint.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Column */}
        <div>
          {/* Description */}
          <div className="detail-section">
            <h3>📝 Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{complaint.description}</p>
          </div>

          {/* Resolution Notes */}
          {complaint.resolutionNotes && (
            <div className="detail-section" style={{ borderLeft: '3px solid var(--success)' }}>
              <h3>✅ Resolution Notes</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{complaint.resolutionNotes}</p>
            </div>
          )}

          {/* Admin Actions */}
          {user.role === 'ADMIN' && complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
            <div className="detail-section">
              <h3>🔧 Admin Actions</h3>

              {/* Assign */}
              <div style={{ marginBottom: '16px' }}>
                <div className="form-label" style={{ marginBottom: '8px' }}>Assign to Staff & Department</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <select className="form-select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="form-select" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                    <option value="">Select Staff</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
                  </select>
                </div>
                <button className="btn btn-accent btn-sm" onClick={handleAssign} disabled={!selectedStaff && !selectedDepartment}>
                  📤 Assign
                </button>
              </div>

              {/* Status Update */}
              <div>
                <div className="form-label" style={{ marginBottom: '8px' }}>Update Status</div>
                <textarea
                  className="form-textarea"
                  placeholder="Add notes (optional)..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ minHeight: '60px', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate('UNDER_REVIEW')}>📋 Under Review</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate('IN_PROGRESS')}>🔄 In Progress</button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate('RESOLVED')}>✅ Resolve</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate('CLOSED')}>🔒 Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Staff Actions */}
          {user.role === 'STAFF' && complaint.assignedStaff?.id === user.id &&
           complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
            <div className="detail-section">
              <h3>🔧 Update Status</h3>
              <textarea
                className="form-textarea"
                placeholder="Add notes (optional)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ minHeight: '60px', marginBottom: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate('IN_PROGRESS')}>🔄 In Progress</button>
                <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate('RESOLVED')}>✅ Resolve</button>
              </div>
            </div>
          )}

          {/* Rating (User + Resolved) */}
          {isOwner && (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && (
            <div className="detail-section">
              <h3>⭐ Rate Resolution</h3>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star ${star <= rating ? 'filled' : 'empty'}`}
                    onClick={() => handleRate(star)}
                  >
                    {star <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="detail-section">
            <h3>📜 Activity Timeline</h3>
            {timeline.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activity yet</p>
            ) : (
              <div className="timeline">
                {timeline.map((item, i) => (
                  <div key={item.id || i} className="timeline-item">
                    <div className="timeline-dot" style={{
                      background: item.action === 'CREATED' ? 'var(--primary)' :
                                  item.action === 'ASSIGNED' ? 'var(--accent)' :
                                  item.newStatus === 'RESOLVED' ? 'var(--success)' : 'var(--info)',
                    }}></div>
                    <div className="timeline-item-content">
                      <div className="timeline-item-action">
                        {item.action?.replace('_', ' ')}
                        {item.oldStatus && item.newStatus && (
                          <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                            {' '}({item.oldStatus} → {item.newStatus})
                          </span>
                        )}
                      </div>
                      <div className="timeline-item-desc">{item.description}</div>
                      <div className="timeline-item-meta">
                        <span>👤 {item.performedBy}</span>
                        <span>🕐 {timeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Info */}
        <div>
          <div className="detail-section">
            <h3>ℹ️ Details</h3>
            <div className="info-row">
              <span className="info-label">Category</span>
              <span className="info-value">{complaint.category?.replace('_', ' ')}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Urgency</span>
              <span className="info-value">{complaint.urgency}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Priority Score</span>
              <span className="info-value">{complaint.priorityScore}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location</span>
              <span className="info-value">{complaint.location || 'Not specified'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Submitted By</span>
              <span className="info-value">{complaint.user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Assigned Staff</span>
              <span className="info-value">{complaint.assignedStaff?.name || 'Unassigned'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department</span>
              <span className="info-value">{complaint.assignedDepartment || 'Unassigned'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>📅 Dates</h3>
            <div className="info-row">
              <span className="info-label">Created</span>
              <span className="info-value">{new Date(complaint.createdAt).toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated</span>
              <span className="info-value">{new Date(complaint.updatedAt).toLocaleString()}</span>
            </div>
            {complaint.resolvedAt && (
              <div className="info-row">
                <span className="info-label">Resolved</span>
                <span className="info-value">{new Date(complaint.resolvedAt).toLocaleString()}</span>
              </div>
            )}
            {complaint.rating > 0 && (
              <div className="info-row">
                <span className="info-label">Rating</span>
                <span className="info-value">{'★'.repeat(complaint.rating)}{'☆'.repeat(5 - complaint.rating)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
