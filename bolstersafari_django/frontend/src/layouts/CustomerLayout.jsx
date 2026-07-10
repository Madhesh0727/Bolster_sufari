import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Heart, Settings, LogOut, User, ChevronRight } from 'lucide-react';

export default function CustomerLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!user) return <Navigate to="/portal/login" replace />;

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { label: 'My Expeditions', path: '/customer/dashboard', icon: Compass },
    { label: 'Wishlist', path: '/customer/wishlist', icon: Heart },
    { label: 'Settings', path: '/customer/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-link { transition: all 0.2s; }
        .nav-link:hover { background: #f1f5f9 !important; color: #1e293b !important; }
        .nav-link.active { background: #eff6ff !important; color: #2563eb !important; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: '264px', minHeight: '100vh', background: 'white',
        borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>BolsterSafari</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>Traveler Portal</div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}
                className={`nav-link${active ? ' active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '10px', marginBottom: '4px',
                  textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
                  color: active ? '#2563eb' : '#475569',
                  background: active ? '#eff6ff' : 'transparent',
                }}>
                <Icon size={18} />
                {label}
                {active && <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <User size={18} color="white" />
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.full_name || user.username}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '9px 14px', border: 'none', background: '#fef2f2',
            color: '#dc2626', fontWeight: 500, fontSize: '0.875rem',
            cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s'
          }}
            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
