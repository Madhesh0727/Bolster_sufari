import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Map } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function TripsManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: trips, isLoading } = useQuery({
    queryKey: ['adminTrips'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/trips/');
      return res.data.results || res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/admin/trips/${id}/`);
    },
    onSuccess: () => {
      toast.success('Trip deleted successfully');
      queryClient.invalidateQueries(['adminTrips']);
    },
    onError: (err) => {
      toast.error('Failed to delete trip: ' + err.message);
    }
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you absolutely sure you want to delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTrips = trips?.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Trips...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '4px' }}>Trips Manager</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Manage all expeditions, pricing, and availability.</p>
        </div>
        <Link to="/admin/trips/new" style={{ 
          background: '#10B981', color: 'white', padding: '12px 24px', borderRadius: '8px', 
          textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
        }}>
          <Plus size={20} /> New Expedition
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Table Toolbar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', top: '10px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Search trips..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px',
                border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Showing {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'}
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: '#64748B', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Trip Title</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Base Price</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(trip => (
                <tr key={trip.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {trip.cover_image ? (
                          <img src={trip.cover_image.startsWith('http') ? trip.cover_image : `http://localhost:8000${trip.cover_image}`} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Map size={20} color="#94A3B8" />
                        )}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1E293B' }}>{trip.title}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{trip.destination_name}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569', fontWeight: 500 }}>
                    {trip.days}D / {trip.nights}N
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1E293B' }}>
                    ₹{parseFloat(trip.base_price).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: trip.is_soldout ? '#FEE2E2' : '#DCFCE7',
                      color: trip.is_soldout ? '#991B1B' : '#166534'
                    }}>
                      {trip.is_soldout ? 'SOLD OUT' : 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link to={`/admin/trips/${trip.id}`} style={{ padding: '8px', color: '#3B82F6', background: '#EFF6FF', borderRadius: '6px', display: 'inline-flex' }}>
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(trip.id, trip.title)}
                        style={{ padding: '8px', color: '#EF4444', background: '#FEF2F2', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No trips found matching your search.
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
