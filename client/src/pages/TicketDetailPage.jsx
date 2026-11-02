import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline status/priority change state
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/tickets/${id}`);
        setTicket(res.data.data.ticket);
      } catch {
        setError('Ticket not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      const res = await api.put(`/tickets/${id}`, { status: newStatus });
      setTicket(res.data.data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div> Loading ticket...</div>;
  if (error) return <div style={{ padding: '2rem' }}><div className="alert alert-error">{error}</div></div>;
  if (!ticket) return null;

  const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tickets')} style={{ marginBottom: '0.5rem' }}>
            ← Back to Tickets
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              #{ticket.id}
            </span>
            <h1 className="page-title" style={{ margin: 0 }}>{ticket.title}</h1>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/tickets', { state: { editTicket: ticket } })}
        >
          ✏️ Edit Ticket
        </button>
      </div>

      <div className="detail-grid">
        {/* Main content */}
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Description
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
              {ticket.description || <em style={{ color: 'var(--color-text-muted)' }}>No description provided</em>}
            </p>
          </div>

          {/* Quick Status Change */}
          <div className="card">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Change Status
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {statusOptions.map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleStatusChange(s)}
                  disabled={ticket.status === s || statusLoading}
                >
                  {statusLoading && ticket.status !== s ? '...' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar metadata */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Details
          </h3>

          <div className="detail-meta-item">
            <span className="detail-meta-label">Status</span>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Priority</span>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Project</span>
            <span
              style={{ fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer' }}
              onClick={() => navigate(`/projects/${ticket.project?.id}`)}
            >
              {ticket.project?.name}
            </span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Assignee</span>
            <span style={{ fontSize: '0.8rem' }}>
              {ticket.assignee?.name || <span style={{ color: 'var(--color-text-muted)' }}>Unassigned</span>}
            </span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Reporter</span>
            <span style={{ fontSize: '0.8rem' }}>{ticket.reporter?.name}</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Created</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-meta-item" style={{ borderBottom: 'none' }}>
            <span className="detail-meta-label">Updated</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {new Date(ticket.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
