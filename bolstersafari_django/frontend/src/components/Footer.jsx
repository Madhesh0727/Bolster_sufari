import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export default function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/settings/public/');
      return res.data;
    }
  });

  return (
    <footer style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '64px 0 32px 0', marginTop: 'auto' }}>
      <div className="container grid grid-cols-3" style={{ marginBottom: '48px' }}>
        <div>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '16px' }}>{settings?.site_name || 'Bolster Safari'}</h3>
          <p style={{ color: '#A0AAB2', fontSize: '0.9rem' }}>
            {settings?.footer_description || 'Experience the adventure of a lifetime with our carefully curated safari and travel packages.'}
          </p>
        </div>
        
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/trips" style={{ color: '#A0AAB2' }}>Our Trips</Link></li>
            <li><Link to="/blog" style={{ color: '#A0AAB2' }}>Travel Blog</Link></li>
            <li><Link to="/ai-planner" style={{ color: '#A0AAB2' }}>AI Itinerary Planner</Link></li>
          </ul>
        </div>
        

        
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', color: '#A0AAB2' }}>
            {settings?.phone && <li>Phone: {settings.phone}</li>}
            {settings?.email && <li>Email: {settings.email}</li>}
            {settings?.address && <li>Address: {settings.address}</li>}
          </ul>
        </div>
      </div>
      
      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', textAlign: 'center', color: '#A0AAB2', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} {settings?.site_name || 'Bolster Safari'}. All rights reserved.
      </div>
    </footer>
  );
}
