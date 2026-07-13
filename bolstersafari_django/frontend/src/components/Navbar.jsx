import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoFallback from '../media/logo.svg';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/settings/public/');
      return res.data;
    }
  });

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 0', background: 'var(--color-secondary)' }}>
      <div className="container justify-between items-center" style={{ display: 'flex' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={settings?.site_logo || logoFallback} 
            alt={settings?.site_name || 'Bolster Safari'} 
            style={{ height: '70px', width: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          {!settings?.site_logo && (
            <span className="logo-text" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
              {settings?.site_name || ''}
            </span>
          )}
        </Link>

        {/* Desktop Menu */}
        <div style={{ display: 'flex', gap: '32px' }} className="desktop-menu hidden-mobile">
          <Link to="/" style={{ fontWeight: 500, color: 'white' }}>Home</Link>
          <Link to="/trips" style={{ fontWeight: 500, color: 'white' }}>Destinations</Link>
          <Link to="/blog" style={{ fontWeight: 500, color: 'white' }}>Blog</Link>
          <Link to="/about" style={{ fontWeight: 500, color: 'white' }}>About</Link>
          <Link to="/ai-planner" style={{ fontWeight: 500, color: 'var(--color-primary)' }}>✨ AI Planner</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'none' }}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="mobile-menu-dropdown" style={{ backgroundColor: 'var(--color-secondary-light)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to="/" onClick={() => setIsOpen(false)} style={{ color: 'white', fontWeight: 500, fontSize: '1.1rem' }}>Home</Link>
          <Link to="/trips" onClick={() => setIsOpen(false)} style={{ color: 'white', fontWeight: 500, fontSize: '1.1rem' }}>Destinations</Link>
          <Link to="/blog" onClick={() => setIsOpen(false)} style={{ color: 'white', fontWeight: 500, fontSize: '1.1rem' }}>Blog</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} style={{ color: 'white', fontWeight: 500, fontSize: '1.1rem' }}>About</Link>
          <Link to="/ai-planner" onClick={() => setIsOpen(false)} style={{ color: 'white', fontWeight: 500, fontSize: '1.1rem' }}>AI Planner</Link>
        </div>
      )}
    </nav>
  );
}
