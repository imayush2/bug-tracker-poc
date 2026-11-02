import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import ConfirmDialog from '../components/ConfirmDialog';

// ─── Ticket Form Modal ────────────────────────────────────────────────────────
function TicketFormModal({ isOpen, onClose, onSuccess, ticket, defaultProjectId }) {
  const emptyForm = {
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    project_id: defaultProjectId || '',
    assigned_to: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!ticket;

  useEffect(() => {
    if (!isOpen) return;
    // Load projects and users for dropdowns
    const loadData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          api.get('/projects'),
          api.get('/auth/users'),
        ]);
        setProjects(projRes.data.data.projects);
        setUsers(userRes.data.data.users);
      } catch {
        setError('Failed to load form data');
      }
    };
    loadData();

    if (ticket) {
      setForm({
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
        priority: ticket.priority,
        project_id: ticket.project_id,
        assigned_to: ticket.assigned_to || '',
      });
    } else {
      setForm({ ...emptyForm, project_id: defaultProjectId || '' });
    }
    setError('');
  }, [isOpen, ticket, defaultProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        project_id: parseInt(form.project_id),
      };
      if (isEdit) {
        await api.put(`/tickets/${ticket.id}`, payload);
      } else {
        await api.post('/tickets', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? '✏️ Edit Ticket' : '🎫 New Ticket'}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="tick-title">Title *</label>
              <input
                id="tick-title"
                className="form-input"
                placeholder="Brief description of the bug..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tick-desc">Description</label>
              <textarea
                id="tick-desc"
                className="form-textarea"
                placeholder="Steps to reproduce, expected vs actual behavior, screenshots..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label" htmlFor="tick-status">Status</label>
                <select id="tick-status" className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tick-priority">Priority</label>
                <select id="tick-priority" className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label" htmlFor="tick-project">Project *</label>
                <select
                  id="tick-project"
                  className="form-select"
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  required
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tick-assign">Assign To</label>
                <select
                  id="tick-assign"
                  className="form-select"
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Saving...</> : (isEdit ? 'Save Changes' : 'Create Ticket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tickets Page ─────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state — read from URL query params so filters persist on reload
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    project_id: searchParams.get('project_id') || '',
  });

  const fetchTickets = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      // Build query string from filters, remove empty values
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([, v]) => v !== '')
      );
      const res = await api.get('/tickets', { params });
      setTickets(res.data.data.tickets);
    } catch {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load projects for filter dropdown
    api.get('/projects').then((res) => setProjects(res.data.data.projects)).catch(() => {});
    fetchTickets(filters);
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Sync to URL so users can share filtered views
    const params = Object.fromEntries(Object.entries(newFilters).filter(([, v]) => v !== ''));
    setSearchParams(params);
    fetchTickets(newFilters);
  };

  const handleClearFilters = () => {
    const cleared = { search: '', status: '', priority: '', project_id: '' };
    setFilters(cleared);
    setSearchParams({});
    fetchTickets(cleared);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/tickets/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchTickets(filters);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">
            {loading ? 'Loading...' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTicket(null); setModalOpen(true); }}>
          ➕ New Ticket
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search by title..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          id="ticket-search"
        />
        <select
          className="form-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          id="ticket-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          className="form-select"
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          id="ticket-priority-filter"
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          className="form-select"
          value={filters.project_id}
          onChange={(e) => handleFilterChange('project_id', e.target.value)}
          id="ticket-project-filter"
        >
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={handleClearFilters} title="Clear all filters">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Tickets Table */}
      {loading ? (
        <div className="loading-container"><div className="spinner"></div> Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="table-container">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">{hasActiveFilters ? 'No tickets match your filters' : 'No tickets yet'}</div>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              {hasActiveFilters ? 'Try adjusting your search or filters' : 'Create your first ticket to start tracking bugs'}
            </p>
            {!hasActiveFilters && (
              <button className="btn btn-primary" onClick={() => { setEditTicket(null); setModalOpen(true); }}>
                ➕ Create Ticket
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Reporter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${ticket.id}`)}>
                  <td style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
                    #{ticket.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ticket.title}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {ticket.project?.name}
                    </span>
                  </td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td><PriorityBadge priority={ticket.priority} /></td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {ticket.assignee?.name || <span style={{ color: 'var(--color-text-muted)' }}>Unassigned</span>}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {ticket.reporter?.name}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setEditTicket(ticket); setModalOpen(true); }}
                        title="Edit ticket"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteTarget(ticket)}
                        style={{ color: '#f87171' }}
                        title="Delete ticket"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TicketFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchTickets(filters)}
        ticket={editTicket}
        defaultProjectId={filters.project_id}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Ticket"
        message={`Are you sure you want to delete ticket #${deleteTarget?.id} "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
