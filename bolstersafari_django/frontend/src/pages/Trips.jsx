import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import TripCard from '../components/TripCard';
import { Search, Filter } from 'lucide-react';

export default function Trips() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('q') || '';
  
  const [searchInput, setSearchInput] = useState(currentSearch);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/trips/categories/');
      return res.data;
    },
    staleTime: 15 * 60 * 1000,
    retry: 3,
  });

  const { data: trips, isLoading, isError, refetch, fetchStatus } = useQuery({
    queryKey: ['trips', currentCategory, currentSearch],
    queryFn: async () => {
      const res = await apiClient.get('/trips/', {
        params: { category: currentCategory, q: currentSearch }
      });
      return res.data;
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set('q', searchInput);
    else params.delete('q');
    setSearchParams(params);
  };

  const handleCategory = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set('category', val);
    else params.delete('category');
    setSearchParams(params);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '48px 0', minHeight: '80vh' }}>
      <div className="container">
        
        {/* Header & Search */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Explore All Trips</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '32px' }}>
            Find your perfect safari adventure from our curated selection of expeditions.
          </p>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearch} style={{ flex: '1 1 300px', display: 'flex', position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search destinations, trip names..." 
                className="input-field"
                style={{ width: '100%', paddingLeft: '48px' }}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
              <button type="submit" className="btn btn-primary" style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', padding: '0 16px' }}>Search</button>
            </form>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '250px' }}>
              <Filter size={20} color="var(--color-text-muted)" />
              <select 
                className="input-field" 
                style={{ flex: 1 }}
                value={currentCategory}
                onChange={e => handleCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories?.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading || fetchStatus === 'fetching' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: '16px' }}>
            <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading trips... (server may be waking up, please wait)</p>
          </div>
        ) : isError ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>Could not load trips. The server may still be waking up.</p>
            <button className="btn btn-primary" onClick={() => refetch()}>Retry</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '24px', color: 'var(--color-text-muted)' }}>
              Showing {trips?.results?.length || 0} result(s)
            </div>
            
            {trips?.results?.length > 0 ? (
              <div className="grid grid-cols-3">
                {trips.results.map(trip => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <div style={{ padding: '64px 0', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed #E0E0E0' }}>
                <h3 style={{ marginBottom: '8px' }}>No trips found</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>Try adjusting your search or filters.</p>
                <button 
                  className="btn btn-outline" 
                  onClick={() => { setSearchInput(''); setSearchParams(new URLSearchParams()); }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
