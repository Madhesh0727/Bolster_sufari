import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Users, Map, CalendarCheck, TrendingUp, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats/');
      return res.data;
    }
  });

  const handleReset = async () => {
    if (confirmText !== 'RESET') {
      toast.error('Please type RESET to confirm');
      return;
    }
    setIsResetting(true);
    try {
      await apiClient.post('/admin/system/reset-database/', { confirm: confirmText });
      toast.success('Test database successfully reset!');
      setShowResetModal(false);
      setConfirmText('');
      queryClient.invalidateQueries(['adminDashboardStats']);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset database');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading Dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${(stats?.revenue || 0).toLocaleString('en-IN')}`, icon: <DollarSign size={24} color="#10B981" />, bg: '#ECFDF5' },
    { title: 'Total Bookings', value: stats?.bookings || 0, icon: <CalendarCheck size={24} color="#3B82F6" />, bg: '#EFF6FF' },
    { title: 'Active Expeditions', value: stats?.trips?.active || 0, icon: <Map size={24} color="#F59E0B" />, bg: '#FFFBEB' },
    { title: 'Registered Users', value: stats?.users || 0, icon: <Users size={24} color="#8B5CF6" />, bg: '#F5F3FF' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '4px' }}>Dashboard Overview</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Monitor your business analytics and recent activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowResetModal(true)} style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #F87171', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Reset Test Data
          </button>
          <Link to="/admin/trips/new" style={{ background: '#3B82F6', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            + Create New Trip
          </Link>
        </div>
      </div>

      {showResetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#DC2626', marginBottom: '16px' }}>
              <AlertTriangle size={32} />
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Danger Zone</h2>
            </div>
            <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
              This will permanently delete all <strong>Bookings, Wishlists, Reviews,</strong> and <strong>Customer Accounts</strong>. 
              Your trips, settings, and admin accounts will be kept. 
            </p>
            <p style={{ color: '#1E293B', fontWeight: 600, marginBottom: '8px' }}>Type RESET to confirm:</p>
            <input 
              type="text" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESET"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '24px', fontSize: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => {setShowResetModal(false); setConfirmText('');}} style={{ padding: '10px 16px', borderRadius: '8px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleReset} disabled={isResetting} style={{ padding: '10px 16px', borderRadius: '8px', background: '#DC2626', border: 'none', color: 'white', fontWeight: 600, cursor: isResetting ? 'not-allowed' : 'pointer' }}>
                {isResetting ? 'Resetting...' : 'Delete All Test Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 4px 0', fontWeight: 500 }}>{stat.title}</p>
              <h3 style={{ color: '#1E293B', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Bookings Table */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: 0 }}>Recent Bookings</h2>
            <Link to="/admin/bookings" style={{ color: '#3B82F6', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>View All &rarr;</Link>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.85rem', textAlign: 'left' }}>
                <th style={{ padding: '12px 0' }}>Customer</th>
                <th style={{ padding: '12px 0' }}>Trip</th>
                <th style={{ padding: '12px 0' }}>Amount</th>
                <th style={{ padding: '12px 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_bookings?.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 0', fontWeight: 500, color: '#1E293B' }}>{b.customer_name}</td>
                  <td style={{ padding: '16px 0', color: '#64748B' }}>{b.trip_title}</td>
                  <td style={{ padding: '16px 0', fontWeight: 600 }}>₹{parseFloat(b.total_amount).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: b.payment_status === 'paid' || b.payment_status === 'verified' ? '#DCFCE7' : '#FEF3C7',
                      color: b.payment_status === 'paid' || b.payment_status === 'verified' ? '#166534' : '#92400E'
                    }}>
                      {b.payment_status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.recent_bookings || stats.recent_bookings.length === 0) && (
                <tr><td colSpan="4" style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8' }}>No recent bookings.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* System Activity */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#64748B" /> System Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6', marginTop: '6px' }} />
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#1E293B' }}>Admin logged in securely</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>Just now</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', marginTop: '6px' }} />
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#1E293B' }}>Dashboard accessed</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>Session active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
