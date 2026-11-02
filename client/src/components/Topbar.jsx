import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tickets': 'Tickets',
};

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    if (path.startsWith('/projects/')) return 'Project Details';
    if (path.startsWith('/tickets/')) return 'Ticket Details';
    return 'Bug Tracker';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="topbar">
      <span className="topbar-title">{getTitle()}</span>
      <div className="topbar-user">
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user?.email}</span>
        <div className="user-avatar">{getInitials(user?.name)}</div>
      </div>
    </header>
  );
}
