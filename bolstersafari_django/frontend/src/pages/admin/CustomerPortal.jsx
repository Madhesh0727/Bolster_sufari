import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Search, Download, Users, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function CustomerPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [tripFilter, setTripFilter] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/bookings/');
      return res.data.results || res.data;
    }
  });

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Customers...</div>;

  // Extract unique trips for the filter dropdown
  const uniqueTrips = [...new Set(bookings?.map(b => b.trip_title))].filter(Boolean);

  const filteredCustomers = bookings?.filter(b => {
    // 1. Name & Aadhar search
    const term = searchTerm.toLowerCase();
    const matchesName = (b.customer_name || '').toLowerCase().includes(term) ||
                        (b.booking_ref || '').toLowerCase().includes(term) ||
                        (b.customer_aadhar || '').toLowerCase().includes(term);
    
    // 2. Trip place filter
    const matchesTrip = tripFilter === 'all' || b.trip_title === tripFilter;

    // 3. Age filter
    let matchesAge = true;
    const age = b.customer_age;
    if (ageFilter !== 'all') {
      if (ageFilter === 'unknown' && age != null) matchesAge = false;
      if (ageFilter === 'under18' && (age == null || age >= 18)) matchesAge = false;
      if (ageFilter === '18-35' && (age == null || age < 18 || age > 35)) matchesAge = false;
      if (ageFilter === '36-50' && (age == null || age < 36 || age > 50)) matchesAge = false;
      if (ageFilter === '50plus' && (age == null || age <= 50)) matchesAge = false;
    }

    return matchesName && matchesTrip && matchesAge;
  }) || [];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
    } else {
      setSelectedCustomers(new Set());
    }
  };

  const handleSelectOne = (id) => {
    const newSet = new Set(selectedCustomers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCustomers(newSet);
  };

  const downloadCSV = () => {
    if (selectedCustomers.size === 0) {
      alert("Please select at least one customer to download.");
      return;
    }

    const selectedData = bookings.filter(b => selectedCustomers.has(b.id));

    // Define CSV Headers
    const headers = ['Booking Ref', 'Customer Name', 'Age', 'DoB', 'Aadhar', 'Additional Travelers', 'Email', 'Phone', 'Trip', 'Date', 'Payment Status'];
    
    // Build rows
    const rows = selectedData.map(b => {
      // Format additional travelers if any
      let additional = 'None';
      if (b.additional_travelers && b.additional_travelers.length > 0) {
        additional = b.additional_travelers.map(t => `${t.name} (Age: ${t.age}, Aadhar: ${t.aadhar})`).join(' | ');
      }
      return [
      `"${b.booking_ref || ''}"`,
      `"${b.customer_name || ''}"`,
      `"${b.customer_age || 'N/A'}"`,
      `"${b.customer_dob || 'N/A'}"`,
      `"${b.customer_aadhar || 'N/A'}"`,
      `"${additional}"`,
      `"${b.customer_email || ''}"`,
      `"${b.customer_phone || ''}"`,
      `"${b.trip_title || ''}"`,
      `"${b.date || ''}"`,
      `"${b.payment_status || ''}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '4px' }}>Customer Portal</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Filter, select, and export detailed client information.</p>
        </div>
        <button 
          onClick={downloadCSV}
          disabled={selectedCustomers.size === 0}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: selectedCustomers.size > 0 ? '#3B82F6' : '#94A3B8', 
            color: 'white', padding: '10px 20px', borderRadius: '8px', 
            border: 'none', cursor: selectedCustomers.size > 0 ? 'pointer' : 'not-allowed',
            fontWeight: 600, transition: 'background 0.2s'
          }}
        >
          <Download size={18} />
          Download Selected ({selectedCustomers.size})
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Table Toolbar / Filters */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', top: '10px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Search by name or ref..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px',
                border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem'
              }}
            />
          </div>

          <select 
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem' }}
          >
            <option value="all">All Ages</option>
            <option value="under18">Under 18</option>
            <option value="18-35">18 - 35</option>
            <option value="36-50">36 - 50</option>
            <option value="50plus">50+</option>
            <option value="unknown">Age Unknown</option>
          </select>

          <select 
            value={tripFilter}
            onChange={(e) => setTripFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', maxWidth: '250px' }}
          >
            <option value="all">All Trips</option>
            {uniqueTrips.map(trip => (
              <option key={trip} value={trip}>{trip}</option>
            ))}
          </select>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: '#64748B', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', width: '50px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredCustomers.length > 0 && selectedCustomers.size === filteredCustomers.length}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Customer Name</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 600 }}>Age</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Identity</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600 }}>Trip Destination</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  
                  <td style={{ padding: '16px 24px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedCustomers.has(customer.id)}
                      onChange={() => handleSelectOne(customer.id)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#1E293B' }}>
                      <Users size={16} color="#64748B" /> {customer.customer_name}
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '4px' }}>
                      Ref: #{customer.booking_ref}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                      backgroundColor: customer.customer_age ? '#E0F2FE' : '#F1F5F9',
                      color: customer.customer_age ? '#0369A1' : '#94A3B8'
                    }}>
                      {customer.customer_age || 'N/A'}
                    </span>
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <Phone size={14} color="#94A3B8" /> {customer.customer_phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}>
                      <Mail size={14} color="#94A3B8" /> {customer.customer_email}
                    </div>
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: '#1E293B', fontWeight: 500, fontSize: '0.9rem', marginBottom: '4px' }}>
                      Aadhar: {customer.customer_aadhar || 'N/A'}
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '4px' }}>
                      DoB: {customer.customer_dob || 'N/A'}
                    </div>
                    {customer.additional_travelers?.length > 0 && (
                      <div style={{ color: '#3B82F6', fontSize: '0.8rem', fontWeight: 500 }}>
                        + {customer.additional_travelers.length} more traveler(s)
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 500, fontSize: '0.95rem' }}>
                      <MapPin size={16} color="#EF4444" /> {customer.trip_title}
                    </div>
                  </td>

                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No customers found matching your filters.
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
