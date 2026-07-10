import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { useState } from 'react';
import { PlusCircle, Trash2, Tag, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

const EMPTY_COUPON = {
  code: '', description: '', discount_type: 'flat', discount_value: '',
  min_amount: 0, max_discount: '', max_uses: '', valid_from: '', valid_until: '', is_active: true,
};

export default function CouponsManager() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showAIForm, setShowAIForm] = useState(false);
  const [aiDate, setAiDate] = useState('');
  const [form, setForm] = useState(EMPTY_COUPON);
  const [msg, setMsg] = useState(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/coupons/');
      return res.data.results || res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/admin/coupons/', data),
    onSuccess: () => {
      qc.invalidateQueries(['adminCoupons']);
      setMsg({ type: 'success', text: 'Coupon created successfully!' });
      setTimeout(() => { setShowForm(false); setForm(EMPTY_COUPON); setMsg(null); }, 1500);
    },
    onError: (e) => setMsg({ type: 'error', text: JSON.stringify(e.response?.data || 'Failed to create coupon') }),
  });

  const aiMutation = useMutation({
    mutationFn: (valid_until) => apiClient.post('/admin/coupons/ai-generate/', { valid_until }),
    onSuccess: () => {
      qc.invalidateQueries(['adminCoupons']);
      setMsg({ type: 'success', text: 'AI auto-generated a coupon successfully!' });
      setTimeout(() => { setShowAIForm(false); setAiDate(''); setMsg(null); }, 1500);
    },
    onError: (e) => setMsg({ type: 'error', text: JSON.stringify(e.response?.data || 'Failed to auto-generate coupon') }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => apiClient.patch(`/admin/coupons/${id}/`, { is_active }),
    onSuccess: () => qc.invalidateQueries(['adminCoupons']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/admin/coupons/${id}/`),
    onSuccess: () => qc.invalidateQueries(['adminCoupons']),
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Discount Coupons</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Generate and manage discount codes for travelers.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { setShowAIForm(!showAIForm); setShowForm(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#8b5cf6', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            <Sparkles size={18} /> {showAIForm ? 'Cancel AI' : 'AI Generate'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowAIForm(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            <PlusCircle size={18} /> {showForm ? 'Cancel' : 'Create Coupon'}
          </button>
        </div>
      </div>

      {/* AI Generate Form */}
      {showAIForm && (
        <div style={{ background: 'linear-gradient(to right, #f5f3ff, #ede9fe)', borderRadius: '16px', padding: '28px', border: '1px solid #ddd6fe', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4c1d95', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18} /> Auto-Generate by AI</h2>
          <p style={{ color: '#5b21b6', fontSize: '0.9rem', marginBottom: '20px' }}>Let AI create a creative promo code and pick an optimal discount amount. Just provide the expiry date!</p>

          {msg && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b' }}>{msg.text}</div>
          )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ flex: 1, maxWidth: '300px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#4c1d95', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valid Until *</label>
              <input type="datetime-local" value={aiDate} onChange={(e) => setAiDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #c4b5fd', outline: 'none', boxSizing: 'border-box', fontSize: '0.9rem' }} />
            </div>
            <button onClick={() => { if(aiDate) aiMutation.mutate(aiDate); else alert('Please enter Valid Until date'); }} disabled={aiMutation.isPending}
              style={{ padding: '10.5px 32px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', height: '42px' }}>
              {aiMutation.isPending ? 'Generating...' : 'Generate Magic Coupon'}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>New Coupon</h2>

          {msg && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b' }}>{msg.text}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {[
              { label: 'Coupon Code', key: 'code', placeholder: 'SAFARI20' },
              { label: 'Description', key: 'description', placeholder: 'Welcome discount' },
              { label: 'Discount Value', key: 'discount_value', type: 'number', placeholder: '500' },
              { label: 'Minimum Order (₹)', key: 'min_amount', type: 'number', placeholder: '2000' },
              { label: 'Max Discount Cap (₹)', key: 'max_discount', type: 'number', placeholder: 'Leave blank for no cap' },
              { label: 'Max Uses', key: 'max_uses', type: 'number', placeholder: 'Leave blank for unlimited' },
              { label: 'Valid From', key: 'valid_from', type: 'datetime-local' },
              { label: 'Valid Until', key: 'valid_until', type: 'datetime-local' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                <input type={f.type || 'text'} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder || ''}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', fontSize: '0.9rem' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Discount Type</label>
              <select value={form.discount_type} onChange={set('discount_type')}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', background: 'white', fontSize: '0.9rem' }}>
                <option value="flat">Flat Amount (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
          </div>

          <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
            style={{ padding: '12px 32px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
            {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      )}

      {/* Coupons list */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading coupons...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {coupons.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <Tag size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No coupons yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {['Code', 'Discount', 'Usage', 'Valid Until', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}
                    onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#1e293b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>{c.code}</span>
                      {c.description && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{c.description}</div>}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1e293b' }}>
                      {c.discount_type === 'flat' ? `₹${parseFloat(c.discount_value).toLocaleString('en-IN')}` : `${c.discount_value}%`}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>
                      {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ' / ∞'}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-IN') : '∞'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, background: c.is_valid ? '#dcfce7' : '#fee2e2', color: c.is_valid ? '#166534' : '#991b1b' }}>
                        {c.is_valid ? 'Active' : 'Expired/Off'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => toggleMutation.mutate({ id: c.id, is_active: !c.is_active })}
                          title={c.is_active ? 'Deactivate' : 'Activate'}
                          style={{ padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: c.is_active ? '#10b981' : '#94a3b8' }}>
                          {c.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this coupon?')) deleteMutation.mutate(c.id); }}
                          style={{ padding: '7px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', color: '#dc2626' }}>
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
