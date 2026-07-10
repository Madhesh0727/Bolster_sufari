import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Check, Info, Compass, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DefaultTemplate({ trip }) {
  const [selectedDateId, setSelectedDateId] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });
    
    const hiddenElements = document.querySelectorAll('.scroll-hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, [trip]);

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--color-bg)' }}>
      <style>{`
        .scroll-hidden {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .scroll-hidden.show {
          opacity: 1;
          transform: translateY(0);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
      `}</style>

      {/* Hero */}
      <div style={{ 
        height: '70vh', 
        position: 'relative',
        background: `linear-gradient(to bottom, rgba(28,53,45,0.4), rgba(28,53,45,0.9)), url(${trip.cover_image || trip.destination?.hero_image_url}) center/cover fixed`,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ color: 'white', zIndex: 10, width: '100%', marginTop: 'auto', paddingBottom: '48px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <span style={{ background: 'var(--color-primary)', color: 'white', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {trip.category_display || 'Adventure'}
            </span>
            {trip.is_soldout && (
              <span style={{ background: 'var(--color-danger)', color: 'white', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Sold Out
              </span>
            )}
          </div>
          <h1 className="font-serif trip-hero" style={{ fontSize: '4rem', color: 'white', marginBottom: '16px', textShadow: '0 4px 12px rgba(0,0,0,0.3)', lineHeight: 1.1 }}>
            {trip.title}
          </h1>
          <div style={{ display: 'flex', gap: '32px', fontSize: '1.1rem', opacity: 0.9, alignItems: 'center', flexWrap: 'wrap', fontWeight: 300 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} color="var(--color-primary)" /> {trip.destination_name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} color="var(--color-primary)" /> {trip.days} Days, {trip.nights} Nights</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} color="var(--color-primary)" /> {trip.available_seats} Seats Left (Max {trip.max_capacity})</span>
            {trip.review_count > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
                <Star size={20} fill="currentColor" /> {trip.avg_rating} ({trip.review_count} reviews)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '64px 0' }}>
        <div className="grid trip-detail-layout" style={{ gridTemplateColumns: '2fr 1fr', gap: '64px' }}>
          
          {/* Main Content */}
          <div>
            {trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0 && (
              <section className="scroll-hidden" style={{ marginBottom: '40px', background: '#0F172A', color: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Select Departure Date</h2>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    AVAILABLE
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {trip.dates.filter(d => d.available_seats > 0).map(date => {
                    const isSelected = selectedDateId === date.id;
                    const startDate = new Date(date.start_date);
                    const formattedDate = startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                    
                    return (
                      <div 
                        key={date.id} 
                        onClick={() => setSelectedDateId(date.id)}
                        style={{ 
                          border: isSelected ? '2px solid #F97316' : '1px solid #334155', 
                          backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.05)' : '#1E293B',
                          borderRadius: '8px', 
                          padding: '16px', 
                          cursor: 'pointer',
                          minWidth: '160px',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: isSelected ? 'white' : '#E2E8F0' }}>{formattedDate}</span>
                        <div style={{ fontSize: '0.85rem', display: 'flex', gap: '6px', color: '#94A3B8' }}>
                          <span>₹{parseFloat(date.effective_price || trip.base_price).toLocaleString()}</span>
                          <span>•</span>
                          <span style={{ color: '#10B981' }}>{date.available_seats} available</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#64748B' }}>
                  Click a date above to select it before booking.
                </div>
              </section>
            )}

            <section className="scroll-hidden" style={{ marginBottom: '64px' }}>
              <div className="flex-col-mobile" style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <div className="feature-card" style={{ flex: 1, padding: '24px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.3s ease' }}>
                  <Compass size={32} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                  <h4 style={{ marginBottom: '8px' }}>Guided Tours</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Expert local guides for every excursion</p>
                </div>
                <div className="feature-card" style={{ flex: 1, padding: '24px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.3s ease' }}>
                  <Shield size={32} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                  <h4 style={{ marginBottom: '8px' }}>Safe Travel</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Comprehensive safety protocols in place</p>
                </div>
              </div>

              <h2 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '24px', color: 'var(--color-secondary)' }}>The Experience</h2>
              <div style={{ fontSize: '1.15rem', color: 'var(--color-text-main)', whiteSpace: 'pre-line', lineHeight: 1.8, fontWeight: 300 }}>
                {trip.description}
              </div>
            </section>

            {trip.highlights && trip.highlights.length > 0 && (
              <section className="scroll-hidden" style={{ marginBottom: '64px', background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid #E0E0E0' }}>
                <h2 className="font-serif" style={{ fontSize: '2.2rem', marginBottom: '32px', color: 'var(--color-secondary)' }}>Highlights</h2>
                <div className="grid grid-cols-2">
                  {trip.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                        <Check size={20} />
                      </div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trip.itinerary && trip.itinerary.length > 0 && (
              <section className="scroll-hidden" style={{ marginBottom: '48px' }}>
                <h2 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '32px', color: 'var(--color-secondary)' }}>Itinerary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                  {/* Vertical line for timeline */}
                  <div style={{ position: 'absolute', left: '28px', top: '24px', bottom: '24px', width: '2px', background: '#E0E0E0', zIndex: 0 }}></div>
                  
                  {trip.itinerary.map((day, i) => (
                    <div key={i} className="scroll-hidden" style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'var(--color-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 600, fontSize: '1.2rem', border: '4px solid var(--color-bg)' }}>
                        {day.day}
                      </div>
                      <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid #E0E0E0', flex: 1, boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s ease' }} onMouseEnter={(e)=>e.currentTarget.style.transform='translateX(8px)'} onMouseLeave={(e)=>e.currentTarget.style.transform='translateX(0)'}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', color: 'var(--color-primary)' }}>{day.title}</h3>
                        
                        {day.activities && day.activities.length > 0 ? (
                          <ul style={{ paddingLeft: '20px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {day.activities.map((act, j) => <li key={j}>{act}</li>)}
                          </ul>
                        ) : (
                          <p style={{ color: 'var(--color-text-muted)' }}>{day.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / Booking Card */}
          <div>
            <div className="scroll-hidden" style={{ position: 'sticky', top: '100px' }}>
              <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid #E0E0E0', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Starting from</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '32px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-secondary)', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                    ₹{parseInt(trip.base_price).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/ person</span>
                </div>

                {trip.is_soldout ? (
                  <div style={{ background: '#FEE2E2', color: 'var(--color-danger)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 600, marginBottom: '32px' }}>
                    This trip is currently sold out.
                  </div>
                ) : (
                  <Link 
                    to={selectedDateId ? `/book/${trip.slug}?date_id=${selectedDateId}` : '#'} 
                    onClick={(e) => {
                      if (!selectedDateId && trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0) {
                        e.preventDefault();
                        alert('Please select a departure date first.');
                      }
                    }}
                    className="btn btn-primary" 
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      fontSize: '1.2rem', 
                      marginBottom: '32px', 
                      justifyContent: 'center', 
                      boxShadow: '0 4px 16px rgba(243, 112, 33, 0.4)',
                      opacity: (!selectedDateId && trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0) ? 0.6 : 1
                    }}
                  >
                    Book Your Journey
                  </Link>
                )}

                <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '32px' }}>
                  <h4 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem' }}>
                    <Info size={20} color="var(--color-primary)" /> What's Included
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '1rem', color: 'var(--color-text-muted)' }}>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ background: '#E9F5E9', padding: '6px', borderRadius: '50%' }}>
                        <Check size={14} color="var(--color-success)" />
                      </div>
                      Meals: {typeof trip.food_included === 'string' ? trip.food_included : 'Breakfast & Dinner'}
                    </li>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ background: '#E9F5E9', padding: '6px', borderRadius: '50%' }}>
                        <Check size={14} color="var(--color-success)" />
                      </div>
                      Accommodation: {typeof trip.stay_details === 'string' ? trip.stay_details : 'Premium Stay'}
                    </li>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ background: '#E9F5E9', padding: '6px', borderRadius: '50%' }}>
                        <Check size={14} color="var(--color-success)" />
                      </div>
                      Local Transfers
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
