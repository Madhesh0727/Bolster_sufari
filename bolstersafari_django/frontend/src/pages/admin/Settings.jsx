import { useState } from 'react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { Shield, Key } from 'lucide-react';

export default function Settings() {
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/accounts/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      
      toast.success('Password updated successfully');
      setPasswords({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update password';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Shield size={28} color="#3B82F6" />
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1E293B' }}>Account Settings</h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
          <Key size={20} /> Update Password
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>
              Current Password
            </label>
            <input
              type="password"
              name="old_password"
              value={passwords.old_password}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #CBD5E1', outline: 'none'
              }}
              placeholder="Enter current password"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={passwords.new_password}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #CBD5E1', outline: 'none'
              }}
              placeholder="At least 8 characters"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={passwords.confirm_password}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #CBD5E1', outline: 'none'
              }}
              placeholder="Re-enter new password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '8px', padding: '12px', background: '#3B82F6', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
