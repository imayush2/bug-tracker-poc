import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tickets/stats/dashboard');
        setStats(res.data.data);
      } catch {
        setError('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" style={{ width: 28, height: 28 }}></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects ?? 0, icon: '📁', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Total Tickets', value: stats?.totalTickets ?? 0, icon: '🎫', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
    { label: 'Open', value: stats?.openTickets ?? 0, icon: '🔵', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
    { label: 'In Progress', value: stats?.inProgressTickets ?? 0, icon: '🟡', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Resolved', value: stats?.resolvedTickets ?? 0, icon: '✅', color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
    { label: 'Closed', value: stats?.closedTickets ?? 0, icon: '🔒', color: '#94a3b8', bg: 'rgba(100,116,139,0.12)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your bug tracking workspace</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            📁 Projects
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/tickets')}>
            ➕ New Ticket
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Grid */}
      <div className="grid-cols-stats" style={{ marginBottom: '2rem' }}>
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets breakdown visual */}
      {stats && stats.totalTickets > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>
            Ticket Status Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Open', value: stats.openTickets, color: '#60a5fa' },
              { label: 'In Progress', value: stats.inProgressTickets, color: '#fbbf24' },
              { label: 'Resolved', value: stats.resolvedTickets, color: '#4ade80' },
              { label: 'Closed', value: stats.closedTickets, color: '#94a3b8' },
            ].map((item) => {
              const pct = stats.totalTickets ? Math.round((item.value / stats.totalTickets) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 600 }}>{item.value} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: item.color,
                        borderRadius: 3,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid-cols-2">
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/projects')}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📁</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Manage Projects</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Create, view, and manage your projects</div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/tickets')}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎫</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Manage Tickets</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Track bugs, assign work, update statuses</div>
        </div>
      </div>
    </div>
  );
}
