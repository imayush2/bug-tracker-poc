import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data.data.project);
      } catch {
        setError('Project not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loading-container"><div className="spinner"></div> Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!project) return null;

  const tickets = project.tickets || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: '0.5rem' }}>
            ← Back to Projects
          </button>
          <h1 className="page-title">📁 {project.name}</h1>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/tickets?project_id=${project.id}`)}>
          🎫 View All Tickets
        </button>
      </div>

      {/* Project meta */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Created by</div>
            <div style={{ fontWeight: 600 }}>{project.creator?.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Created at</div>
            <div style={{ fontWeight: 600 }}>{new Date(project.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Tickets</div>
            <div style={{ fontWeight: 600 }}>{tickets.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Open Tickets</div>
            <div style={{ fontWeight: 600, color: '#60a5fa' }}>
              {tickets.filter((t) => t.status === 'OPEN').length}
            </div>
          </div>
        </div>
      </div>

      {/* Tickets table */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>
        Tickets in this project
      </h2>
      {tickets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎫</div>
            <div className="empty-state-title">No tickets yet</div>
            <p style={{ fontSize: '0.875rem' }}>No tickets have been created for this project</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <td style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#{ticket.id}</td>
                  <td style={{ fontWeight: 500 }}>{ticket.title}</td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td><PriorityBadge priority={ticket.priority} /></td>
                  <td>{ticket.assignee?.name || <span style={{ color: 'var(--color-text-muted)' }}>Unassigned</span>}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{new Date(ticket.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
