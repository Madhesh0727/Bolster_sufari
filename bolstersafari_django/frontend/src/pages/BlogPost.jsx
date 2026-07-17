import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Calendar, User, ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog_post', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/blog/${slug}/`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container" style={{ padding: '96px 0', textAlign: 'center' }}>
        <h2>Post not found</h2>
        <Link to="/blog" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '96px' }}>
      
      <div style={{ 
        height: '50vh', 
        position: 'relative',
        background: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${post.thumbnail || post.cover_image_url || 'https://images.unsplash.com/photo-1547471080-7cb2ac647a35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'}) center/cover`
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px auto' }}>{post.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '1.1rem', opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18} /> {post.author_name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} /> {new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '800px', marginTop: '-48px', position: 'relative', zIndex: 10 }}>
        <div className="glass" style={{ padding: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)' }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            <ArrowLeft size={18} /> Back to all stories
          </Link>

          {post.tags && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {(Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',') : [])).map(tag => (
                <span key={tag} style={{ background: '#F1F5F9', color: 'var(--color-secondary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {post.youtube_embed_code && (
            <div 
              style={{ marginBottom: '32px', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ 
                __html: post.youtube_embed_code.replace('<iframe', '<iframe style="width:100%;height:100%;border:none;"') 
              }}
            />
          )}

          <div style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--color-text-main)', whiteSpace: 'pre-line' }}>
            {post.content}
          </div>
        </div>
      </div>
    </div>
  );
}
