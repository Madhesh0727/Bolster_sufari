import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  
  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post('/accounts/token/', {
        username: data.username,
        password: data.password
      });
      
      // Assume the backend returns an access token
      localStorage.setItem('adminToken', response.data.access);
      toast.success('Authentication successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials or unauthorized');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#0F172A',
      backgroundImage: 'radial-gradient(circle at top right, #1E293B, #0F172A)',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', margin: '0 auto 24px auto',
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0' }}>Secure Workspace</h1>
          <p style={{ color: '#94A3B8', margin: 0 }}>Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '14px', left: '16px', color: '#64748B' }}>
              <Shield size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Admin Username"
              {...register('username', { required: 'Username is required' })}
              style={{
                width: '100%', padding: '14px 16px 14px 48px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: 'white', fontSize: '1rem',
                outline: 'none', transition: 'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            {errors.username && <span style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '6px', display: 'block' }}>{errors.username.message}</span>}
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '14px', left: '16px', color: '#64748B' }}>
              <Lock size={20} />
            </div>
            <input 
              type="password" 
              placeholder="Password"
              {...register('password', { required: 'Password is required' })}
              style={{
                width: '100%', padding: '14px 16px 14px 48px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: 'white', fontSize: '1rem',
                outline: 'none', transition: 'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            {errors.password && <span style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '6px', display: 'block' }}>{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '14px', marginTop: '8px',
              background: '#3B82F6', color: 'white', fontWeight: 600, fontSize: '1rem',
              border: 'none', borderRadius: '12px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => { if(!isSubmitting) e.target.style.background = '#2563EB' }}
            onMouseOut={e => { if(!isSubmitting) e.target.style.background = '#3B82F6' }}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Authenticate'}
          </button>
          
        </form>
      </div>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::placeholder { color: #64748B; }
      `}</style>
    </div>
  );
}
