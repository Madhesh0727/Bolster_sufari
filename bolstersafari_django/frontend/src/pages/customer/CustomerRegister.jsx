import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/client';
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle } from 'lucide-react';

const InputField = ({ icon: Icon, label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon size={16} color="#9ca3af" style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <input
        type={type} required={required} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: '10px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', transition: 'border 0.2s' }}
        onFocus={e => e.target.style.borderColor = '#3b82f6'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    </div>
  </div>
);

export default function CustomerRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError(null);
    try {
      await apiClient.post('/accounts/customer/register/', form);
      setSuccess(true);
      setTimeout(() => navigate('/portal/login', { state: { message: '🎉 Account created! Please log in.' } }), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #f8fafc, #e0f2fe)', fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Left hero panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: 'white', minWidth: '0' }}>
        <div style={{ maxWidth: '380px' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '48px', display: 'block' }}>← Back to site</Link>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌍</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>Join the Adventure</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '36px' }}>
            Create your BolsterSafari account to track bookings, save favorite trips, and share your experiences.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {['View and manage all your bookings', 'Save trips to your wishlist', 'Leave reviews for past adventures'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                <CheckCircle size={16} color="#34d399" /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', minWidth: '0' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Create Account</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>
            Already a traveler? <Link to="/portal/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
          </p>

          {success ? (
            <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#166534' }}>
              <CheckCircle size={20} /> Account created! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {error && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <InputField icon={User} label="Full Name" value={form.full_name} onChange={set('full_name')} placeholder="Jane Doe" required />
              <InputField icon={User} label="Username" value={form.username} onChange={set('username')} placeholder="janedoe" required />
              <InputField icon={Mail} label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" required />
              <InputField icon={Phone} label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" required />
              <InputField icon={Lock} label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />

              <button type="submit" disabled={loading} style={{
                padding: '13px', background: loading ? '#93c5fd' : '#2563eb', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', transition: 'background 0.2s'
              }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
