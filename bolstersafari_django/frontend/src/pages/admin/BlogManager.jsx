import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { useState } from 'react';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react';

const EMPTY = { title: '', cover_image_url: '', excerpt: '', content: '', tags: '', status: 'draft' };

export default function BlogManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // null = list, {} = new, {id,...} = edit
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['adminBlog'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/blog/');
      return res.data.results || res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Use FormData to support image uploads
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'tags') {
          const tagsArray = typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags;
          formData.append('tags', JSON.stringify(tagsArray));
        } else if (key === 'cover_image' && data[key] instanceof File) {
          formData.append('cover_image', data[key]);
        } else if (data[key] !== null && data[key] !== undefined && key !== 'cover_image_url') {
          formData.append(key, data[key]);
        }
      });

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (data.id) {
        return apiClient.patch(`/admin/blog/${data.id}/`, formData, config);
      }
      return apiClient.post('/admin/blog/', formData, config);
    },
    onSuccess: () => {
      qc.invalidateQueries(['adminBlog']);
      setMsg({ type: 'success', text: 'Blog post saved!' });
      setTimeout(() => { setEditing(null); setMsg(null); }, 1500);
    },
    onError: (e) => setMsg({ type: 'error', text: JSON.stringify(e.response?.data || 'Error') }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/admin/blog/${id}/`),
    onSuccess: () => qc.invalidateQueries(['adminBlog']),
  });

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (p) => { setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags, cover_image: null }); setEditing(p); };

  if (editing !== null) {
    return (
      <div>
        <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', marginBottom: '24px', fontSize: '0.9rem' }}>← Back to Posts</button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '32px' }}>{editing.id ? 'Edit Post' : 'New Blog Post'}</h1>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b' }}>{msg.text}</div>
        )}

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '0.875rem' }}>Title</label>
            <input type="text" value={form.title} placeholder="Your Amazing Safari Story..." onChange={e => setForm(p => ({...p, title: e.target.value}))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '0.875rem' }}>Cover Image (Upload)</label>
              <input type="file" accept="image/*" onChange={e => setForm(p => ({...p, cover_image: e.target.files[0]}))} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1.5px dashed #cbd5e1', outline: 'none' }} />
              {(form.thumbnail || form.cover_image_url) && !form.cover_image && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>Current image: <img src={form.thumbnail || form.cover_image_url} alt="cover" style={{height: '40px', verticalAlign: 'middle', marginLeft: '8px', borderRadius: '4px'}}/></div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '0.875rem' }}>Tags (comma separated)</label>
              <input type="text" value={form.tags} placeholder="wildlife, safari, kenya" onChange={e => setForm(p => ({...p, tags: e.target.value}))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '0.875rem' }}>YouTube Embed Code (Auto-plays at top of post)</label>
            <input type="text" value={form.youtube_embed_code || ''} placeholder='<iframe src="https://www.youtube.com/embed/..." ...></iframe>' onChange={e => setForm(p => ({...p, youtube_embed_code: e.target.value}))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'monospace' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '0.875rem' }}>Excerpt (short summary)</label>
            <textarea rows={2} value={form.excerpt} onChange={e => setForm(p => ({...p, excerpt: e.target.value}))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '0.875rem' }}>Content (Markdown supported)</label>
            <textarea
              rows={14} value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Write your safari story here..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>Status:</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', background: 'white' }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
            <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: 'white' }}>Cancel</button>
            <button onClick={() => saveMutation.mutate({ ...form, ...(editing.id ? { id: editing.id } : {}) })}
              disabled={saveMutation.isPending}
              style={{ flex: 2, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
              {saveMutation.isPending ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Safari Stories</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Create and manage blog posts and travel stories.</p>
        </div>
        <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          <PlusCircle size={18} /> New Post
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading posts...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {posts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <FileText size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No blog posts yet. Create your first story!</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {['Title', 'Status', 'Author', 'Published', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} style={{ borderTop: '1px solid #f1f5f9' }}
                    onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{post.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{post.excerpt}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, background: post.status === 'published' ? '#dcfce7' : '#f1f5f9', color: post.status === 'published' ? '#166534' : '#64748b' }}>
                        {post.status === 'published' ? <Eye size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> : <EyeOff size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{post.author_name}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEdit(post)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, fontSize: '0.85rem', color: '#475569' }}>
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this post?')) deleteMutation.mutate(post.id); }}
                          style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', color: '#dc2626' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
