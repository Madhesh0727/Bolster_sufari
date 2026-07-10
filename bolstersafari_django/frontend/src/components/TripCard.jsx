import { Link } from 'react-router-dom';
import { MapPin, Clock, Users } from 'lucide-react';
import apiClient from '../api/client';

export default function TripCard({ trip }) {

  return (
    <Link to={`/trip/${trip.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div 
        className="glass" 
        style={{ 
          borderRadius: 'var(--radius-md)', 
          overflow: 'hidden', 
          transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
        }}
      >
        <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
          <img 
            src={trip.cover_image || trip.destination?.hero_image_url || 'https://via.placeholder.com/600x400?text=Safari'} 
            alt={trip.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {trip.is_soldout && (
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--color-danger)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
              Sold Out
            </div>
          )}
          {trip.is_featured && !trip.is_soldout && (
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--color-accent)', color: 'var(--color-secondary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
              Featured
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
            <MapPin size={14} /> {trip.destination_name || trip.destination?.name}
          </div>
        </div>
        
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', lineHeight: '1.3' }}>{trip.title}</h3>

          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={16} /> {trip.days}D / {trip.nights}N
            </div>
            {trip.available_seats !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={16} /> {trip.available_seats} seats left
              </div>
            )}
          </div>
          
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E0E0E0', paddingTop: '16px' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>From</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'Outfit, sans-serif' }}>
                ₹{parseInt(trip.base_price).toLocaleString()}
              </div>
            </div>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
