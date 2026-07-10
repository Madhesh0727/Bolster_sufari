import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccess() {
  const { ref } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', ref, email],
    queryFn: async () => {
      const res = await apiClient.get(`/bookings/${ref}/?email=${encodeURIComponent(email)}`);
      return res.data;
    }
  });

  if (isLoading) return <div style={{ padding: '96px', textAlign: 'center' }}>Loading...</div>;

  if (isError || !booking) {
    return (
      <div className="container" style={{ padding: '96px 0', textAlign: 'center' }}>
        <h2>Could not retrieve booking details.</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '16px' }}>Your booking may have been successful, but we couldn't load the confirmation right now.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '24px' }}>Return Home</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '96px 0', backgroundColor: 'var(--color-bg)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="glass" style={{ padding: '48px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          
          <CheckCircle size={80} color="var(--color-success)" style={{ margin: '0 auto 24px auto' }} />
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--color-secondary)' }}>Booking Received!</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
            Thank you, {booking.customer_name}. We have received your booking request and payment verification. Our team will review it shortly.
          </p>

          <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid #E0E0E0', textAlign: 'left', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-primary)' }}>Booking Summary</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.05rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Reference ID:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{booking.booking_ref}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Trip:</span>
                <span style={{ fontWeight: 500 }}>{booking.trip_title}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Travelers:</span>
                <span style={{ fontWeight: 500 }}>{booking.number_of_people}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Amount Paid:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>₹{parseFloat(booking.total_amount).toLocaleString()}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{booking.payment_status}</span>
              </li>
            </ul>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
            A confirmation email has been sent to {booking.customer_email}. If you have any questions, please contact our support team.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem', background: 'transparent', border: '2px solid var(--color-primary)', color: 'var(--color-primary)' }}>
              Return Home
            </Link>
            <Link to={`/ticket/${booking.booking_ref}?email=${encodeURIComponent(email)}`} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', background: '#D4AF37', color: '#0F1C2E', border: 'none', fontWeight: 'bold' }}>
              View E-Ticket
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
