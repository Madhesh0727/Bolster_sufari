import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Calendar, MapPin, Clock, Download, Star, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const TABS = ['upcoming', 'past', 'wishlist'];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewModal, setReviewModal] = useState(null); // { trip_slug, trip_title }
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['customerDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/accounts/customer/dashboard/');
      return res.data;
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ trip_slug, rating, comment }) => {
      const res = await apiClient.post('/reviews/submit/', { trip_slug, rating, comment });
      return res.data;
    },
    onSuccess: () => {
      setReviewMsg({ type: 'success', text: 'Review submitted successfully! Thank you.' });
      setTimeout(() => { setReviewModal(null); setReviewMsg(null); setReviewForm({ rating: 5, comment: '' }); }, 2000);
    },
    onError: (err) => {
      setReviewMsg({ type: 'error', text: err.response?.data?.non_field_errors?.[0] || 'Failed to submit review.' });
    }
  });

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
      <div style={{ border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (isError) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
      <AlertCircle size={40} style={{ marginBottom: '16px', color: '#ef4444' }} />
      <p>Could not load dashboard data. Please refresh.</p>
    </div>
  );

  const { user, bookings, wishlist } = data;
  const tabData = activeTab === 'upcoming' ? bookings.upcoming : activeTab === 'past' ? bookings.past : wishlist;

  const statusBadge = (s) => {
    const cfg = {
      verified: { bg: '#dcfce7', color: '#166534', label: 'Confirmed' },
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    };
    const c = cfg[s] || cfg.pending;
    return <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, background: c.bg, color: c.color }}>{c.label}</span>;
  };

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
          Welcome back, {user.full_name || user.username}! 🌍
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>Your adventure hub — track trips, wishlist, and more.</p>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          { label: 'Upcoming Trips', value: bookings.upcoming.length, color: '#3b82f6' },
          { label: 'Completed Trips', value: bookings.past.length, color: '#10b981' },
          { label: 'Wishlisted', value: wishlist.length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '28px', gap: '4px' }}>
        {[
          { key: 'upcoming', label: `Upcoming (${bookings.upcoming.length})` },
          { key: 'past', label: `Past Trips (${bookings.past.length})` },
          { key: 'wishlist', label: `Wishlist (${wishlist.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            color: activeTab === t.key ? '#2563eb' : '#64748b',
            borderBottom: activeTab === t.key ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-2px',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeTab !== 'wishlist' && tabData.map((b, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Package size={20} color="#3b82f6" />
                <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#0f172a' }}>{b.trip_title}</span>
                {statusBadge(b.payment_status)}
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#64748b', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14} />{b.destinations}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} />{b.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} />Ref: {b.booking_ref}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>₹{parseFloat(b.total_amount).toLocaleString('en-IN')}</span>
              {activeTab === 'past' ? (
                <button onClick={() => setReviewModal({ trip_slug: b.trip_slug, trip_title: b.trip_title })} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
                  background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
                }}>
                  <Star size={15} fill="white" /> Review
                </button>
              ) : (
                <Link to={`/ticket/${b.booking_ref}?email=${user.email}`} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
                  background: '#eff6ff', color: '#2563eb', textDecoration: 'none', borderRadius: '8px',
                  fontWeight: 600, fontSize: '0.875rem'
                }}>
                  <Download size={15} /> Ticket
                </Link>
              )}
            </div>
          </div>
        ))}

        {activeTab === 'wishlist' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {wishlist.map(trip => (
              <div key={trip.id} style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <img src={trip.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'} alt={trip.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <div style={{ padding: '18px' }}>
                  <h3 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px', fontSize: '1rem' }}>{trip.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '14px' }}>
                    ₹{parseFloat(trip.base_price).toLocaleString('en-IN')} &bull; {trip.days}D/{trip.nights}N
                  </p>
                  <Link to={`/trip/${trip.slug}`} style={{ display: 'block', textAlign: 'center', padding: '9px', background: '#0f172a', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                    View Expedition
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {tabData.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '14px' }}>
            <Package size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontWeight: 500 }}>
              {activeTab === 'upcoming' && 'No upcoming expeditions.'}
              {activeTab === 'past' && 'No completed trips yet.'}
              {activeTab === 'wishlist' && 'Your wishlist is empty. Start exploring!'}
            </p>
            {activeTab !== 'past' && <Link to="/trips" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Browse Expeditions →</Link>}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '36px', maxWidth: '480px', width: '100%' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>Rate Your Experience</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>{reviewModal.trip_title}</p>

            {reviewMsg && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: reviewMsg.type === 'success' ? '#dcfce7' : '#fee2e2', color: reviewMsg.type === 'success' ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> {reviewMsg.text}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Rating</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))} style={{
                    width: '40px', height: '40px', borderRadius: '8px', border: 'none',
                    fontSize: '1.2rem', cursor: 'pointer',
                    background: reviewForm.rating >= n ? '#fbbf24' : '#f1f5f9',
                  }}>★</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Your Review (optional)</label>
              <textarea
                rows={4} value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Tell us about your experience..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setReviewModal(null)} style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: 'white' }}>Cancel</button>
              <button
                onClick={() => reviewMutation.mutate({ trip_slug: reviewModal.trip_slug, ...reviewForm })}
                disabled={reviewMutation.isPending}
                style={{ flex: 2, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
