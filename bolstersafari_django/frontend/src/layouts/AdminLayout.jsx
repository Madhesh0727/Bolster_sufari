import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, CalendarCheck, LogOut, Shield, ChevronLeft, ChevronRight, Menu, Users, FileText, Tag, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out securely');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Trips Manager', path: '/admin/trips', icon: <Map size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <CalendarCheck size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Blog Posts', path: '/admin/blog', icon: <FileText size={20} /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F0F4F8', overflow: 'hidden' }}>
      
      {/* Mobile Header Overlay */}
      <div className="admin-mobile-header" style={{ display: 'none', padding: '16px', background: '#0F172A', color: 'white', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <Shield size={24} color="#3B82F6" /> BS Admin
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{ 
          width: isCollapsed ? '80px' : '260px', 
          backgroundColor: '#0F172A', 
          color: '#94A3B8', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 40
        }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <Shield size={28} color="#3B82F6" style={{ minWidth: '28px' }} />
          {!isCollapsed && <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '0.5px' }}>Bolster Safari</span>}
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '24px 16px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px', opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.2s' }}>Menu</p>
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path} 
                title={isCollapsed ? item.name : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '12px',
                  borderRadius: '12px', textDecoration: 'none',
                  color: isActive ? 'white' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if(!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  if(!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <div style={{ color: isActive ? '#3B82F6' : 'inherit', minWidth: '20px', display: 'flex', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                {!isCollapsed && <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', width: '100%',
              backgroundColor: 'transparent', color: '#EF4444', border: 'none', cursor: 'pointer', 
              borderRadius: '12px', transition: 'background 0.2s', whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>
              <LogOut size={20} />
            </div>
            {!isCollapsed && <span style={{ fontWeight: 600 }}>Secure Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="admin-collapse-btn"
          style={{
            position: 'absolute', right: '-14px', top: '32px', width: '28px', height: '28px',
            backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 50, transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{ height: '72px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#1E293B' }}>Super Admin</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Master Workspace</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              AD
            </div>
          </div>
        </header>
        
        {/* Scrollable Canvas */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </div>
      </main>

      {/* Global CSS for Mobile Overrides */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            height: 100vh !important;
            transform: translateX(-100%);
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0);
          }
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-collapse-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
