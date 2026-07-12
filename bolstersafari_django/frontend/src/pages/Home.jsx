import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import TripCard from '../components/TripCard';
import heroBg from '../assets/hero.png';

export default function Home() {
  const { data: featuredTrips, isLoading } = useQuery({
    queryKey: ['trips', 'featured'],
    queryFn: async () => {
      const res = await apiClient.get('/trips/?featured=1');
      return res.data;
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/settings/public/');
      return res.data;
    }
  });

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: 'calc(100vh - 82px)', /* Fills the viewport minus navbar */
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(rgba(28, 53, 45, 0.4), rgba(28, 53, 45, 0.7)), url(${heroBg}) center/cover no-repeat`,
        color: 'white',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Subtle background zoom animation */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'inherit',
          animation: 'bgZoom 20s infinite alternate linear',
          zIndex: 1
        }}></div>

        <div className="container animate-3d-float" style={{ position: 'relative', zIndex: 10 }}>
          
          <div style={{ fontSize: '0.8rem', letterSpacing: '3px', marginBottom: '24px', opacity: 0.8, textTransform: 'uppercase' }}>
            &mdash; ESCAPE. EXPLORE. EXPERIENCE. &mdash;
          </div>
          
          <h1 className="font-serif home-hero-title" style={{ color: 'white', marginBottom: '24px', lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            Where every journey <br />
            becomes <span className="font-serif" style={{ color: 'var(--color-primary)', fontWeight: 400, fontStyle: 'italic' }}>a story</span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px auto', opacity: 0.9, lineHeight: 1.6, fontWeight: 300, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            Premium group tours, wildlife safaris and mountain escapes curated<br/>
            for the modern explorer. Every detail crafted to perfection.
          </p>
          
          <div className="home-hero-btn-group" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/trips" className="btn btn-primary" style={{ padding: '14px 32px' }}>
              Explore Trips &darr;
            </Link>
            <Link to="/trips" className="btn btn-outline" style={{ padding: '14px 32px', color: 'white', borderColor: 'white' }}>
              View All Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Trips Section */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div className="featured-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Featured Expeditions</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Our most popular and highly rated safari experiences.</p>
            </div>
            <Link to="/trips" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <span style={{ fontSize: '1.2rem' }}>→</span>
            </Link>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {featuredTrips?.results?.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
              {(!featuredTrips?.results || featuredTrips.results.length === 0) && (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '48px 0' }}>
                  No featured trips available at the moment.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Gallery Preview Section */}
      {settings?.gallery && settings.gallery.length > 0 && (
        <section style={{ padding: '96px 0', backgroundColor: 'var(--color-surface)' }}>
          <div className="container">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '48px', textAlign: 'center' }}>Moments in the Wild</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {settings.gallery.slice(0, 8).map(item => (
                <div key={item.id} style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1/1' }}>
                  <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-normal)' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
