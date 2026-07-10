import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, FileText, IndianRupee, Calendar, List, Star, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TripForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { dates: [], itinerary: [], highlights: [], galleryText: '' }
  });
  const { fields: dateFields, append: appendDate, remove: removeDate } = useFieldArray({ control, name: 'dates' });
  const { fields: itFields, append: appendIt, remove: removeIt } = useFieldArray({ control, name: 'itinerary' });
  const { fields: hlFields, append: appendHl, remove: removeHl } = useFieldArray({ control, name: 'highlights' });

  // Load existing trip data if edit
  const { data: tripData, isLoading } = useQuery({
    queryKey: ['adminTrip', id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/trips/${id}/`);
      return res.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (tripData) {
      reset({
        ...tripData,
        destination_text: tripData.destination?.name || tripData.destination_text || '',
        category: tripData.category || 'adventure',
        highlights: (tripData.highlights || []).map(h => ({ text: h })),
        galleryText: (tripData.gallery || []).join(', '),
        food_included: typeof tripData.food_included === 'string' ? tripData.food_included : '',
        stay_details: typeof tripData.stay_details === 'string' ? tripData.stay_details : '',
        cover_image_url: tripData.cover_image || '',
        itinerary: (tripData.itinerary || []).map(day => {
          if (day.activities && day.activities.length > 0) {
            return { ...day, description: day.activities.join(', ') };
          }
          return day;
        }),
      });
    }
  }, [tripData, reset]);

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const res = await apiClient.get('/trips/destinations/');
      return res.data.results || res.data;
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await apiClient.post('/admin/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setValue('cover_image_url', res.data.url, { shouldDirty: true });
      toast.success('Image uploaded!');
    } catch (err) {
      console.error('Image upload failed', err);
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const matchedDest = destinations?.find(d => d.name.toLowerCase() === data.destination_text?.toLowerCase());
      
      const payload = {
        ...data,
        destination_id: matchedDest ? matchedDest.id : null,
        destination_text: data.destination_text,
        highlights: (data.highlights || []).map(h => h.text).filter(Boolean),
        gallery: (data.galleryText || '').split(',').map(s => s.trim()).filter(Boolean),
        itinerary: (data.itinerary || []).map(day => {
          if (typeof day.description === 'string' && day.description.includes(',')) {
            return {
              ...day,
              activities: day.description.split(',').map(s => s.trim()).filter(Boolean),
              description: ''
            };
          }
          return day;
        }),
        dates: (data.dates || []).map(d => {
          const cleanDate = { ...d };
          if (!cleanDate.id) delete cleanDate.id;
          return cleanDate;
        })
      };
      
      if (isEdit) {
        return apiClient.put(`/admin/trips/${id}/`, payload);
      } else {
        return apiClient.post('/admin/trips/', payload);
      }
    },
    onSuccess: () => {
      toast.success(`Trip successfully ${isEdit ? 'updated' : 'created'}!`);
      queryClient.invalidateQueries(['adminTrips']);
      navigate('/admin/trips');
    },
    onError: (err) => {
      let errMsg = 'Failed to save trip. Check the form for errors.';
      if (err.response?.data) {
        if (err.response.data.detail) errMsg = err.response.data.detail;
        else errMsg = JSON.stringify(err.response.data);
      }
      toast.error(errMsg);
    }
  });

  const onSubmit = (data) => saveMutation.mutate(data);

  if (isEdit && isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 className="animate-spin" size={48} color="#3B82F6" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link to="/admin/trips" style={{ color: '#64748B', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <ArrowLeft size={20} />
            </Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>
              {isEdit ? 'Edit Expedition' : 'Create New Expedition'}
            </h1>
          </div>
          <p style={{ color: '#64748B', margin: 0, paddingLeft: '32px' }}>Fill in the details to publish a new trip offering.</p>
        </div>
        
        <button 
          onClick={handleSubmit(onSubmit)}
          disabled={saveMutation.isPending}
          style={{ 
            background: '#3B82F6', color: 'white', padding: '12px 24px', borderRadius: '8px', 
            border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            cursor: saveMutation.isPending ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
          }}
        >
          {saveMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {isEdit ? 'Save Changes' : 'Publish Trip'}
        </button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong>Please fix the following validation errors:</strong>
          {Object.entries(errors).map(([field, err]) => (
            <span key={field}>- {field}: {err.message || 'Invalid value'}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Left Column: Primary Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Basic Info Card */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#3B82F6" /> Basic Information
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Trip Title *</label>
                <input 
                  type="text" 
                  {...register('title', { required: 'Title is required' })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem' }}
                />
                {errors.title && <span style={{ color: '#EF4444', fontSize: '0.8rem' }}>{errors.title.message}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Destination *</label>
                  <input 
                    list="destinations-list"
                    {...register('destination_text', { required: 'Destination is required' })}
                    placeholder="e.g. Kodaikanal, Bali..."
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', background: 'white' }}
                  />
                  <datalist id="destinations-list">
                    {destinations?.map(d => <option key={d.id} value={d.name} />)}
                  </datalist>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Category *</label>
                  <select 
                    {...register('category', { required: 'Category is required' })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', background: 'white' }}
                  >
                    <option value="group">Group Tour</option>
                    <option value="family">Family Trip</option>
                    <option value="couple">Couple Getaway</option>
                    <option value="solo">Solo Adventure</option>
                    <option value="safari">Safari</option>
                    <option value="wildlife">Wildlife</option>
                    <option value="beach">Beach Getaway</option>
                    <option value="mountain">Mountain Trek</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural Tour</option>
                    <option value="spiritual">Spiritual Journey</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Days</label>
                  <input type="number" {...register('days')} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Nights</label>
                  <input type="number" {...register('nights')} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Description</label>
                <textarea 
                  {...register('description')}
                  rows="5"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

                <div style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Travel Agency Name (E-Ticket Signature)</label>
                  <input
                    type="text"
                    {...register('agency_name')}
                    placeholder="e.g. BOLSTER SAFARI"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                  />
                </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IndianRupee size={20} color="#10B981" /> Pricing & Capacity
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Base Price (₹) *</label>
                <input 
                  type="number" step="0.01" 
                  {...register('base_price', { required: 'Base price is required' })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Maximum Capacity (Total Seats)</label>
                <input 
                  type="number" 
                  {...register('max_capacity')}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Extended Details - Inclusions */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coffee size={20} color="#F59E0B" /> Inclusions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Food Included</label>
                <input 
                  type="text" 
                  {...register('food_included')}
                  placeholder="e.g. Breakfast & Dinner"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Accommodation</label>
                <input 
                  type="text" 
                  {...register('stay_details')}
                  placeholder="e.g. 4-Star Hotels"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Extended Details - Itinerary & Highlights */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List size={20} color="#3B82F6" /> Itinerary
              </h2>
              <button 
                type="button" 
                onClick={() => appendIt({ day: itFields.length + 1, title: '', description: '' })}
                style={{ color: '#3B82F6', background: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Day
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {itFields.map((field, index) => (
                <div key={field.id} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative' }}>
                  <button 
                    type="button" 
                    onClick={() => removeIt(index)}
                    style={{ position: 'absolute', top: '12px', right: '12px', color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#64748B' }}>Day</label>
                      <input type="number" {...register(`itinerary.${index}.day`)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#64748B' }}>Title</label>
                      <input type="text" {...register(`itinerary.${index}.title`)} placeholder="e.g. Arrival in Kyoto" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#64748B' }}>Description</label>
                    <textarea {...register(`itinerary.${index}.description`)} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0', resize: 'vertical' }} />
                  </div>
                </div>
              ))}
              {itFields.length === 0 && (
                <p style={{ color: '#94A3B8', textAlign: 'center', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>No itinerary days added.</p>
              )}
            </div>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} color="#EAB308" /> Highlights
              </h2>
              <button 
                type="button" 
                onClick={() => appendHl({ text: '' })}
                style={{ color: '#3B82F6', background: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Highlight
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hlFields.map((field, index) => (
                <div key={field.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    {...register(`highlights.${index}.text`)} 
                    placeholder="e.g. Visit the ancient ruins" 
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeHl(index)}
                    style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
              {hlFields.length === 0 && (
                <p style={{ color: '#94A3B8', textAlign: 'center', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>No highlights added.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Media, Dates & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={20} color="#8B5CF6" /> Media
            </h2>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Cover Image URL / Upload</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  {...register('cover_image_url')}
                  placeholder="https://example.com/cover.jpg"
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                />
                <label style={{ 
                  background: '#F1F5F9', color: '#475569', padding: '12px 16px', borderRadius: '8px', 
                  cursor: isUploading ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : 'Upload Image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Gallery (Comma-separated URLs)</label>
              <textarea 
                {...register('galleryText')}
                placeholder="url1.jpg, url2.jpg"
                rows="3"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="#F59E0B" /> Schedule Dates
              </h2>
              <button 
                type="button" 
                onClick={() => appendDate({ start_date: '', available_seats: 10, is_active: true })}
                style={{ color: '#3B82F6', background: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Date
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dateFields.map((field, index) => (
                <div key={field.id} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative' }}>
                  <button 
                    type="button" 
                    onClick={() => removeDate(index)}
                    style={{ position: 'absolute', top: '12px', right: '12px', color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                  <input type="hidden" {...register(`dates.${index}.id`)} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#64748B' }}>Start Date</label>
                      <input type="date" {...register(`dates.${index}.start_date`)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#64748B' }}>Available Seats</label>
                    <input type="number" {...register(`dates.${index}.available_seats`)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }} />
                  </div>
                </div>
              ))}
              {dateFields.length === 0 && (
                <p style={{ color: '#94A3B8', textAlign: 'center', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>No dates scheduled. Add one above.</p>
              )}
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
