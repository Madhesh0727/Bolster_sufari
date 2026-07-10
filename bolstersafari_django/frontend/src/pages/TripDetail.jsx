import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DefaultTemplate from './templates/DefaultTemplate';
import AdventureTemplate from './templates/AdventureTemplate';
import WildlifeTemplate from './templates/WildlifeTemplate';
import CulturalTemplate from './templates/CulturalTemplate';
import BeachTemplate from './templates/BeachTemplate';

export default function TripDetail() {
  const { slug } = useParams();

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ['trip', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/trips/${slug}/`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="container" style={{ padding: '96px 0', textAlign: 'center' }}>
        <h2>Trip not found</h2>
        <Link to="/trips" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Trips</Link>
      </div>
    );
  }

  // Route to specific template based on vibe/category
  switch(trip.category) {
    case 'adventure':
    case 'mountain':
    case 'solo':
      return <AdventureTemplate trip={trip} />;
    
    case 'wildlife':
    case 'safari':
      return <WildlifeTemplate trip={trip} />;
      
    case 'cultural':
    case 'spiritual':
      return <CulturalTemplate trip={trip} />;
      
    case 'beach':
    case 'couple':
    case 'leisure':
      return <BeachTemplate trip={trip} />;
      
    default:
      return <DefaultTemplate trip={trip} />;
  }
}
