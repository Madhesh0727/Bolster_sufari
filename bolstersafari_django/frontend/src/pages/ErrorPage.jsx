import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage() {
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
      <AlertTriangle size={80} color="#EF4444" style={{ marginBottom: '24px' }} />
      <h1 style={{ fontSize: '3rem', fontFamily: 'Outfit, sans-serif', color: '#0F1C2E', marginBottom: '16px' }}>
        Oops! Something went wrong.
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#64748B', maxWidth: '500px', marginBottom: '32px' }}>
        We encountered an unexpected error while trying to load this page. Our team has been notified.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-outline"
          style={{ padding: '12px 32px', fontSize: '1.1rem', borderRadius: '30px' }}
        >
          Try Again
        </button>
        <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem', borderRadius: '30px' }}>
          Return to Base Camp
        </Link>
      </div>
    </div>
  );
}
