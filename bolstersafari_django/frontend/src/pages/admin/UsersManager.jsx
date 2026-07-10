import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { Ban, CheckCircle, EyeOff, Eye } from 'lucide-react';

export default function UsersManager() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users/');
      return res.data.results || res.data;
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await apiClient.patch(`/admin/users/${id}/`, updates);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries(['admin_users']);
    },
    onError: () => {
      toast.error('Failed to update user');
    }
  });

  if (isLoading) return <div style={{ padding: '40px' }}>Loading users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#111827' }}>Global User Management</h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: '16px', color: '#6B7280', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '16px', color: '#6B7280', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '16px', color: '#6B7280', fontWeight: 600 }}>Joined</th>
              <th style={{ padding: '16px', color: '#6B7280', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '16px', color: '#6B7280', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{user.display_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{user.email} • @{user.username}</div>
                </td>
                <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                  {user.role}
                </td>
                <td style={{ padding: '16px', color: '#6B7280' }}>
                  {new Date(user.date_joined).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '24px', 
                      fontSize: '0.85rem', 
                      fontWeight: 600,
                      background: user.is_active ? '#D1FAE5' : '#FEE2E2',
                      color: user.is_active ? '#065F46' : '#991B1B'
                    }}>
                      {user.is_active ? 'Active' : 'Banned'}
                    </span>
                    {user.is_hidden && (
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '24px', 
                        fontSize: '0.85rem', 
                        fontWeight: 600,
                        background: '#F3F4F6',
                        color: '#4B5563'
                      }}>
                        Hidden
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Toggle Ban/Active */}
                    <button 
                      onClick={() => toggleUserStatusMutation.mutate({ id: user.id, updates: { is_active: !user.is_active } })}
                      style={{ 
                        background: user.is_active ? '#FEE2E2' : '#D1FAE5', 
                        color: user.is_active ? '#991B1B' : '#065F46', 
                        border: 'none', 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600
                      }}
                      title={user.is_active ? "Ban User" : "Unban User"}
                    >
                      {user.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                      {user.is_active ? 'Ban' : 'Unban'}
                    </button>

                    {/* Toggle Hide/Show (only relevant for creators, but available globally) */}
                    <button 
                      onClick={() => toggleUserStatusMutation.mutate({ id: user.id, updates: { is_hidden: !user.is_hidden } })}
                      style={{ 
                        background: '#F3F4F6', 
                        color: '#4B5563', 
                        border: 'none', 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600
                      }}
                      title={user.is_hidden ? "Show on Public Pages" : "Hide from Public Pages"}
                    >
                      {user.is_hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                      {user.is_hidden ? 'Show' : 'Hide'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
