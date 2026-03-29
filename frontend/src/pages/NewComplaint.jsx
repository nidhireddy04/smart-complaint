import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { complaintsAPI } from '../services/api';

const CATEGORIES = [
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'SAFETY', label: 'Safety & Security' },
  { value: 'CLEANLINESS', label: 'Cleanliness & Hygiene' },
  { value: 'IT_SERVICES', label: 'IT Services' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'HOSTEL', label: 'Hostel' },
  { value: 'CANTEEN', label: 'Canteen & Food' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'OTHER', label: 'Other' },
];

const URGENCIES = [
  { value: 'LOW', label: 'Low — Not urgent', color: 'var(--success)' },
  { value: 'MEDIUM', label: 'Medium — Can wait a few days', color: 'var(--primary)' },
  { value: 'HIGH', label: 'High — Needs prompt attention', color: 'var(--warning)' },
  { value: 'CRITICAL', label: 'Critical — Immediate action required', color: 'var(--danger)' },
];

export default function NewComplaint() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'INFRASTRUCTURE',
    urgency: 'MEDIUM',
    location: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const complaint = await complaintsAPI.create({
        ...form,
        userId: user.id,
      });
      addToast({
        type: 'success',
        title: 'Complaint Submitted!',
        message: `Complaint #${complaint.id} has been registered with ${complaint.priority} priority.`,
      });
      navigate(`/complaints/${complaint.id}`);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>✏️ Submit New Complaint</h2>
          <div className="page-header-subtitle">Fill in the details below. Priority will be assigned automatically.</div>
        </div>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              id="complaint-title"
              className="form-input"
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Brief summary of the issue"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              id="complaint-description"
              className="form-textarea"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Describe the issue in detail. Include relevant information like timestamps, affected areas, and impact."
              required
              maxLength={2000}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                id="complaint-category"
                className="form-select"
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level *</label>
              <select
                id="complaint-urgency"
                className="form-select"
                value={form.urgency}
                onChange={e => handleChange('urgency', e.target.value)}
              >
                {URGENCIES.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              id="complaint-location"
              className="form-input"
              type="text"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="Building, floor, room number, etc."
            />
          </div>

          {/* Priority Preview */}
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid var(--glass-border)',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Priority will be auto-calculated based on:
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              📁 Category weight × ⚡ Urgency level × Similar complaints boost
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              id="submit-complaint"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? '⏳ Submitting...' : '📤 Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
