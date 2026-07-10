import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <Compass size={80} color="#D4AF37" style={{ marginBottom: '24px' }} />
      <h1 style={{ fontSize: '3rem', fontFamily: 'Outfit, sans-serif', color: '#0F1C2E', marginBottom: '16px' }}>
        404 - Lost in the Wild
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#64748B', maxWidth: '500px', marginBottom: '32px' }}>
        It seems you've wandered off the trail. The page you're looking for cannot be found.
      </p>
      <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem', borderRadius: '30px' }}>
        Return to Base Camp
      </Link>
    </div>
  );
}
