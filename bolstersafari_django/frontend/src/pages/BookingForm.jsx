import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Check, Users } from 'lucide-react';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const calculateAge = (dob) => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function BookingForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date_id = searchParams.get('date_id');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    age: '',
    aadhar: '',
    dob: '',
    people: 1,
    coupon: ''
  });

  const [additionalTravelers, setAdditionalTravelers] = useState([]);
  
  const [couponRes, setCouponRes] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/trips/${slug}/`);
      return res.data;
    }
  });

  useEffect(() => {
    if (formData.dob) {
      setFormData(prev => ({ ...prev, age: calculateAge(prev.dob) }));
    }
  }, [formData.dob]);

  useEffect(() => {
    const targetLength = Math.max(0, formData.people - 1);
    setAdditionalTravelers(prev => {
      if (prev.length === targetLength) return prev;
      if (prev.length > targetLength) return prev.slice(0, targetLength);
      
      const newTravelers = [...prev];
      while (newTravelers.length < targetLength) {
        newTravelers.push({ name: '', aadhar: '', dob: '', age: '' });
      }
      return newTravelers;
    });
  }, [formData.people]);

  const updateAdditionalTraveler = (index, field, value) => {
    const updated = [...additionalTravelers];
    if (field === 'aadhar') {
        value = value.replace(/\D/g, ''); // numbers only
    }
    updated[index][field] = value;
    if (field === 'dob') {
        updated[index].age = calculateAge(value);
    }
    setAdditionalTravelers(updated);
  };

  const handleApplyCoupon = async () => {
    if (!formData.coupon) return;
    try {
      const baseAmount = trip.base_price * formData.people;
      const res = await apiClient.post('/bookings/coupon/validate/', {
        code: formData.coupon,
        amount: baseAmount
      });
      if (res.data.valid) {
        setCouponRes(res.data);
        setCouponError('');
      } else {
        setCouponError(res.data.error);
        setCouponRes(null);
      }
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Failed to validate coupon');
      setCouponRes(null);
    }
  };

  const displayRazorpay = async (bookingData) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: bookingData.razorpay_key_id,
      amount: (parseFloat(bookingData.total_amount) * 100).toString(),
      currency: 'INR',
      name: 'Bolster Safari',
      description: `Booking for ${trip.title}`,
      order_id: bookingData.razorpay_order_id,
      handler: async function (response) {
        try {
          // Verify payment
          const verifyRes = await apiClient.post('/bookings/verify/', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          
          if (verifyRes.data.status === 'verified') {
            navigate(`/booking/success/${verifyRes.data.booking_ref}?email=${encodeURIComponent(bookingData.customer_email)}`);
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          alert('Payment verification failed. Please contact support.');
          setIsSubmitting(false);
        }
      },
      prefill: {
        name: bookingData.customer_name,
        email: bookingData.customer_email,
        contact: bookingData.customer_phone
      },
      theme: {
        color: '#1C352D'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    
    paymentObject.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
        setIsSubmitting(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        trip_slug: trip.slug,
        trip_date_id: date_id,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_whatsapp: formData.whatsapp,
        customer_age: formData.age,
        customer_aadhar: formData.aadhar,
        customer_dob: formData.dob,
        number_of_people: formData.people,
        additional_travelers: additionalTravelers,
        coupon_code: couponRes ? formData.coupon : ''
      };

      const res = await apiClient.post('/bookings/create/', payload);
      
      if (res.status === 201) {
        await displayRazorpay(res.data);
      }
    } catch (error) {
      console.error(error);
      
      let errorMsg = 'Failed to initiate booking. Please try again.';
      if (error.response?.data) {
        const data = error.response.data;
        if (data.non_field_errors) {
          errorMsg = data.non_field_errors[0];
        } else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          errorMsg = data[firstKey][0] || data[firstKey];
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
      }
      
      alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ padding: '96px', textAlign: 'center' }}>Loading...</div>;

  const selectedDate = trip?.dates?.find(d => d.id === date_id);
  const basePrice = selectedDate?.effective_price || trip?.base_price || 0;
  
  const baseAmount = basePrice * formData.people;
  const totalAmount = couponRes ? Math.max(0, baseAmount - couponRes.discount) : baseAmount;

  return (
    <div className="animate-fade-in" style={{ padding: '64px 0', backgroundColor: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Traveler Details</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>You are booking: <strong>{trip?.title}</strong></p>
          {selectedDate && (
            <p style={{ color: 'var(--color-primary)', fontWeight: 500, margin: 0 }}>
              Departure: {new Date(selectedDate.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>

        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Primary Traveler</h3>
                <div className="grid grid-cols-2 booking-form-grid">
                <div className="input-group">
                    <label className="input-label">Full Name *</label>
                    <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isSubmitting} />
                </div>
                <div className="input-group">
                    <label className="input-label">Email Address *</label>
                    <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isSubmitting} />
                </div>
                </div>

                <div className="grid grid-cols-2">
                <div className="input-group">
                    <label className="input-label">Phone Number *</label>
                    <input required type="tel" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={isSubmitting} />
                </div>
                <div className="input-group">
                    <label className="input-label">WhatsApp (Optional)</label>
                    <input type="tel" className="input-field" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} disabled={isSubmitting} />
                </div>
                </div>

                <div className="grid grid-cols-2">
                <div className="input-group">
                    <label className="input-label">Date of Birth *</label>
                    <input required type="date" className="input-field" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} disabled={isSubmitting} max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="input-group">
                    <label className="input-label">Age</label>
                    <input type="number" className="input-field" value={formData.age} readOnly disabled style={{ backgroundColor: '#F1F5F9', color: '#64748B' }} />
                </div>
                </div>

                <div className="grid grid-cols-2">
                <div className="input-group">
                    <label className="input-label">Aadhar Number *</label>
                    <input required type="text" pattern="[0-9]{12}" title="12 digit Aadhar Number" placeholder="123412341234" className="input-field" value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value.replace(/\D/g, '')})} disabled={isSubmitting} maxLength="12" />
                </div>
                <div className="input-group">
                    <label className="input-label">Number of People *</label>
                    <input required type="number" min="1" max={trip?.max_capacity || 50} className="input-field" value={formData.people} onChange={e => setFormData({...formData, people: parseInt(e.target.value) || 1})} disabled={isSubmitting} />
                </div>
                </div>
            </div>

            {additionalTravelers.length > 0 && (
                <div style={{ marginTop: '32px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20}/> Additional Travelers</h3>
                    
                    {additionalTravelers.map((traveler, index) => (
                        <div key={index} style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#475569' }}>Traveler {index + 2}</h4>
                            <div className="grid grid-cols-2">
                                <div className="input-group">
                                    <label className="input-label">Full Name *</label>
                                    <input required type="text" className="input-field" value={traveler.name} onChange={e => updateAdditionalTraveler(index, 'name', e.target.value)} disabled={isSubmitting} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Aadhar Number *</label>
                                    <input required type="text" pattern="[0-9]{12}" title="12 digit Aadhar Number" placeholder="123412341234" className="input-field" value={traveler.aadhar} onChange={e => updateAdditionalTraveler(index, 'aadhar', e.target.value)} disabled={isSubmitting} maxLength="12" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div className="input-group">
                                    <label className="input-label">Date of Birth *</label>
                                    <input required type="date" className="input-field" value={traveler.dob} onChange={e => updateAdditionalTraveler(index, 'dob', e.target.value)} disabled={isSubmitting} max={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Age</label>
                                    <input type="number" className="input-field" value={traveler.age} readOnly disabled style={{ backgroundColor: '#E2E8F0', color: '#64748B' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <hr style={{ border: 0, borderTop: '1px solid #E0E0E0', margin: '32px 0' }} />

            <div className="input-group">
              <label className="input-label">Coupon Code (Optional)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" style={{ flex: 1 }} value={formData.coupon} onChange={e => setFormData({...formData, coupon: e.target.value})} disabled={isSubmitting} />
                <button type="button" className="btn btn-outline" onClick={handleApplyCoupon} disabled={isSubmitting}>Apply</button>
              </div>
              {couponError && <span style={{ color: 'var(--color-danger)', fontSize: '0.9rem', marginTop: '4px' }}>{couponError}</span>}
              {couponRes && <span style={{ color: 'var(--color-success)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={16} /> {couponRes.message}</span>}
            </div>

            <div style={{ background: '#F8F9FA', padding: '24px', borderRadius: 'var(--radius-sm)', marginTop: '32px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1.1rem' }}>
                <span>Base Price ({formData.people}x)</span>
                <span>₹{baseAmount.toLocaleString()}</span>
              </div>
              {couponRes && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--color-success)', fontSize: '1.1rem' }}>
                  <span>Discount</span>
                  <span>-₹{couponRes.discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E0E0E0', paddingTop: '12px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', justifyContent: 'center' }} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
