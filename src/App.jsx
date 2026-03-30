import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { DataProvider, useAppData } from './context/DataContext';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import FinancePage from './pages/FinancePage';
import HoursPage from './pages/HoursPage';
import GroupsPage from './pages/GroupsPage';
import SettingsPage from './pages/SettingsPage';
import './styles/variables.css';
import './styles/reset.css';
import './styles/components.css';

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Inicio' },
  { path: '/calendario', icon: '📅', label: 'Calendario' },
  { path: '/finanzas', icon: '💰', label: 'Finanzas' },
  { path: '/horas', icon: '⏱️', label: 'Horas' },
  { path: '/grupos', icon: '👥', label: 'Grupos' },
];

function AppHeader() {
  const { state, dispatch } = useAppData();
  const location = useLocation();

  const pageTitle = {
    '/': 'Dashboard',
    '/calendario': 'Calendario',
    '/finanzas': 'Finanzas',
    '/horas': 'Control Horas',
    '/grupos': 'Grupos',
    '/ajustes': 'Configuración',
  }[location.pathname] || 'GuardiApp';

  return (
    <header className="app-header">
      <div className="app-header__logo">
        <div className="app-header__logo-icon">🛡️</div>
        <span>GuardiApp</span>
      </div>
      <div className="app-header__actions">
        <NavLink to="/ajustes">
          <button className="btn--icon" aria-label="Configuración">⚙️</button>
        </NavLink>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function AppContent() {
  return (
    <div className="app-layout">
      <AppHeader />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/finanzas" element={<FinancePage />} />
          <Route path="/horas" element={<HoursPage />} />
          <Route path="/grupos" element={<GroupsPage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </DataProvider>
  );
}
