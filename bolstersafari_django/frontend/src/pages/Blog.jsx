import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Calendar, User } from 'lucide-react';

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      const res = await apiClient.get('/blog/');
      return res.data;
    }
  });

  return (
    <div className="animate-fade-in" style={{ padding: '48px 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Safari Stories</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Read about our latest adventures, travel tips, and wildlife encounters from our expert guides and travelers.
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {posts?.results?.map(post => (
              <Link to={`/blog/${post.slug}`} key={post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  className="glass" 
                  style={{ 
                    borderRadius: 'var(--radius-md)', 
                    overflow: 'hidden', 
                    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                  }}
                >
                  <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={post.thumbnail || post.cover_image_url || 'https://images.unsplash.com/photo-1547471080-7cb2ac647a35?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {post.youtube_embed_code && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', paddingLeft: '4px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 3l14 9-14 9V3z"/></svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', lineHeight: '1.4' }}>{post.title}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '24px', flex: 1 }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.85rem', borderTop: '1px solid #E0E0E0', paddingTop: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {post.author_name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {new Date(post.published_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {(!posts?.results || posts.results.length === 0) && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '48px 0' }}>
                No stories published yet. Check back soon!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
