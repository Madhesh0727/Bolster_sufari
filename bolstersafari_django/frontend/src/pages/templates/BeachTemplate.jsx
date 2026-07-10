import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Check, Wind, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BeachTemplate({ trip }) {
  const [selectedDateId, setSelectedDateId] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-beach');
        }
      });
    }, { threshold: 0.1 });
    
    const hiddenElements = document.querySelectorAll('.beach-hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, [trip]);

  return (
    <div style={{ backgroundColor: '#f0f8fa', color: '#1a365d', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        .beach-hidden {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .beach-hidden.show-beach {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(14, 165, 233, 0.08);
          transition: all 0.4s ease;
        }
        .glass-card:hover {
          box-shadow: 0 12px 40px rgba(14, 165, 233, 0.15);
          transform: translateY(-4px);
        }
        .beach-btn {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white;
          border: none;
          border-radius: 99px;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
          transition: all 0.3s ease;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .beach-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4);
        }
      `}</style>

      {/* Hero */}
      <div style={{ 
        height: '80vh', 
        position: 'relative',
        background: `url(${trip.cover_image || trip.destination?.hero_image_url}) center/cover fixed`,
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* White gradient overlay for a bright, breezy feel */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)' }}></div>
        
        <div className="container" style={{ zIndex: 10, width: '100%', position: 'relative' }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '8px 20px', borderRadius: '50px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              <Sun size={18} /> {trip.category_display || 'Leisure'}
            </div>
            
            <h1 style={{ fontSize: '4.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-1px' }}>
              {trip.title}
            </h1>
            
            <div style={{ display: 'flex', gap: '32px', fontSize: '1.1rem', color: '#334155', alignItems: 'center', flexWrap: 'wrap', fontWeight: 400 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} color="#0ea5e9" /> {trip.destination_name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} color="#0ea5e9" /> {trip.days}D / {trip.nights}N</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '80px 0' }}>
        <div className="grid trip-detail-layout" style={{ gridTemplateColumns: '2fr 1fr', gap: '64px' }}>
          
          <div>
            <section className="beach-hidden" style={{ marginBottom: '64px' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', color: '#0f172a', fontWeight: 700 }}>Escape to Paradise</h2>
              <div style={{ fontSize: '1.15rem', color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.8, fontWeight: 300 }}>
                {trip.description}
              </div>
            </section>

            {trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0 && (
              <section className="beach-hidden glass-card" style={{ marginBottom: '64px', padding: '40px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '32px', color: '#0f172a', fontWeight: 700 }}>Choose Your Getaway</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {trip.dates.filter(d => d.available_seats > 0).map(date => {
                    const isSelected = selectedDateId === date.id;
                    const startDate = new Date(date.start_date);
                    
                    return (
                      <div 
                        key={date.id} 
                        onClick={() => setSelectedDateId(date.id)}
                        style={{ 
                          border: isSelected ? '2px solid #0ea5e9' : '2px solid transparent', 
                          background: isSelected ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                          boxShadow: isSelected ? '0 10px 25px rgba(14, 165, 233, 0.2)' : 'none',
                          borderRadius: '16px',
                          padding: '24px', 
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px' }}>
                          {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '1.2rem', color: '#0ea5e9', fontWeight: 700 }}>₹{parseFloat(date.effective_price || trip.base_price).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {trip.highlights && trip.highlights.length > 0 && (
              <section className="beach-hidden" style={{ marginBottom: '64px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '32px', color: '#0f172a', fontWeight: 700 }}>The Vibe</h2>
                <div className="grid grid-cols-2 gap-6">
                  {trip.highlights.map((h, i) => (
                    <div key={i} className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px' }}>
                      <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '50%' }}>
                        <Wind size={20} color="#0ea5e9" />
                      </div>
                      <span style={{ fontSize: '1.05rem', color: '#334155', fontWeight: 400 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trip.itinerary && trip.itinerary.length > 0 && (
              <section className="beach-hidden" style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '40px', color: '#0f172a', fontWeight: 700 }}>Your Schedule</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {trip.itinerary.map((day, i) => (
                    <div key={i} className="beach-hidden glass-card flex-col-mobile" style={{ display: 'flex', gap: '24px', padding: '32px', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '24px', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
                        {day.day}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#0f172a', fontWeight: 600 }}>{day.title}</h3>
                        {day.activities && day.activities.length > 0 ? (
                          <ul style={{ paddingLeft: '20px', color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                            {day.activities.map((act, j) => <li key={j}>{act}</li>)}
                          </ul>
                        ) : (
                          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>{day.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <div className="beach-hidden" style={{ position: 'sticky', top: '100px' }}>
              <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'left', marginBottom: '32px' }}>
                  <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Book your escape</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '3.5rem', color: '#0f172a', fontWeight: 700, lineHeight: 1 }}>
                      ₹{parseInt(trip.base_price).toLocaleString()}
                    </span>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>/ pp</span>
                  </div>
                </div>

                {trip.is_soldout ? (
                  <div style={{ background: '#fef2f2', color: '#ef4444', padding: '16px', borderRadius: '16px', textAlign: 'center', fontWeight: 600, marginBottom: '32px' }}>
                    Sold Out
                  </div>
                ) : (
                  <Link 
                    to={selectedDateId ? `/book/${trip.slug}?date_id=${selectedDateId}` : '#'} 
                    onClick={(e) => {
                      if (!selectedDateId && trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0) {
                        e.preventDefault();
                        alert('Please pick a date to continue.');
                      }
                    }}
                    className="beach-btn" 
                    style={{ width: '100%', padding: '20px', fontSize: '1.1rem', marginBottom: '40px', display: 'block', textAlign: 'center', textDecoration: 'none' }}
                  >
                    Confirm Booking
                  </Link>
                )}

                <div style={{ borderTop: '1px solid rgba(14, 165, 233, 0.2)', paddingTop: '32px' }}>
                  <h4 style={{ marginBottom: '24px', color: '#0f172a', fontSize: '1.1rem', fontWeight: 600 }}>Includes</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', color: '#475569' }}>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check color="#0ea5e9" size={20} /> {typeof trip.food_included === 'string' ? trip.food_included : 'Breakfast Included'}</li>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check color="#0ea5e9" size={20} /> {typeof trip.stay_details === 'string' ? trip.stay_details : 'Resort Stay'}</li>
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
