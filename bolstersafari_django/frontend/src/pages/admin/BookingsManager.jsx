import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Search, CalendarCheck, User, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function BookingsManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/bookings/');
      return res.data.results || res.data;
    }
  });

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Bookings...</div>;

  const filteredBookings = bookings?.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (b.customer_name || '').toLowerCase().includes(term) || 
                          (b.trip_title || '').toLowerCase().includes(term) ||
                          (b.booking_ref || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || b.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '4px' }}>Bookings Management</h1>
          <p style={{ color: '#64748B', margin: 0 }}>View and manage customer reservations and payments.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Table Toolbar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', top: '10px', left: '12px' }} />
              <input 
                type="text" 
                placeholder="Search by name, trip, or Ref ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px',
                  border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem'
                }}
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0',
                outline: 'none', fontSize: '0.9rem', color: '#1E293B', background: 'white'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: '#64748B', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Reference / Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Customer Info</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Expedition</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 600 }}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, color: '#3B82F6', fontFamily: 'monospace', fontSize: '1rem', marginBottom: '4px' }}>
                      #{booking.booking_ref}
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CalendarCheck size={14} /> {new Date(booking.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#1E293B', marginBottom: '4px' }}>
                      <User size={16} color="#64748B" /> {booking.customer_name}
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                      {booking.primary_contact_email}
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                      {booking.number_of_people} {booking.number_of_people === 1 ? 'Person' : 'People'}
                    </div>
                  </td>

                  <td style={{ padding: '16px 24px', color: '#1E293B', fontWeight: 500 }}>
                    {booking.trip_title}
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1E293B' }}>
                      <CreditCard size={18} color="#10B981" /> ₹{parseFloat(booking.total_amount).toLocaleString('en-IN')}
                    </div>
                  </td>

                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: booking.payment_status === 'paid' ? '#DCFCE7' : (booking.payment_status === 'pending' ? '#FEF3C7' : '#FEE2E2'),
                      color: booking.payment_status === 'paid' ? '#166534' : (booking.payment_status === 'pending' ? '#92400E' : '#991B1B')
                    }}>
                      {booking.payment_status.toUpperCase()}
                    </span>
                  </td>
                  
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No bookings found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
