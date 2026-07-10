import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Check, Info, Compass, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdventureTemplate({ trip }) {
  const [selectedDateId, setSelectedDateId] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-adventure');
        }
      });
    }, { threshold: 0.1 });
    
    const hiddenElements = document.querySelectorAll('.adv-hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, [trip]);

  return (
    <div style={{ backgroundColor: '#09090b', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Oswald', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;500;700&family=Inter:wght@300;400;600&display=swap');
        .adv-hidden {
          opacity: 0;
          transform: scale(0.95) translateY(40px);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .adv-hidden.show-adventure {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        .adv-card {
          background: #18181b;
          border: 1px solid #3f3f46;
          transition: all 0.3s ease;
        }
        .adv-card:hover {
          border-color: #ef4444;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.15);
        }
        .adv-text {
          font-family: 'Inter', sans-serif;
        }
        .adv-btn {
          background: linear-gradient(45deg, #ef4444, #b91c1c);
          color: white;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
          border: none;
          transition: all 0.3s ease;
        }
        .adv-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
        }
      `}</style>

      {/* Hero */}
      <div style={{ 
        height: '80vh', 
        position: 'relative',
        background: `linear-gradient(to bottom, rgba(9,9,11,0.2), rgba(9,9,11,1)), url(${trip.cover_image || trip.destination?.hero_image_url}) center/cover fixed`,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ zIndex: 10, width: '100%', marginTop: 'auto', paddingBottom: '64px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <span style={{ background: '#ef4444', color: 'white', padding: '6px 16px', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              {trip.category_display || 'Extreme'}
            </span>
            {trip.is_soldout && (
              <span style={{ background: '#7f1d1d', color: 'white', padding: '6px 16px', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Sold Out
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '5rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', lineHeight: 1, letterSpacing: '-1px' }}>
            {trip.title}
          </h1>
          <div className="adv-text" style={{ display: 'flex', gap: '32px', fontSize: '1.2rem', color: '#a1a1aa', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={24} color="#ef4444" /> {trip.destination_name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={24} color="#ef4444" /> {trip.days}D / {trip.nights}N</span>
            {trip.review_count > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308' }}>
                <Star size={24} fill="currentColor" /> {trip.avg_rating}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 0 96px 0' }}>
        <div className="grid trip-detail-layout" style={{ gridTemplateColumns: '2fr 1fr', gap: '64px' }}>
          
          <div>
            {trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0 && (
              <section className="adv-hidden adv-card" style={{ marginBottom: '64px', padding: '40px', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '2rem', textTransform: 'uppercase', margin: '0 0 32px 0', borderBottom: '2px solid #ef4444', display: 'inline-block', paddingBottom: '8px' }}>Deployments</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                  {trip.dates.filter(d => d.available_seats > 0).map(date => {
                    const isSelected = selectedDateId === date.id;
                    const startDate = new Date(date.start_date);
                    const formattedDate = startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                    
                    return (
                      <div 
                        key={date.id} 
                        onClick={() => setSelectedDateId(date.id)}
                        className="adv-text"
                        style={{ 
                          border: isSelected ? '2px solid #ef4444' : '1px solid #3f3f46', 
                          backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.1)' : '#09090b',
                          padding: '20px', 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: isSelected ? '#ef4444' : 'white', marginBottom: '8px' }}>{formattedDate}</div>
                        <div style={{ fontSize: '1rem', color: '#a1a1aa' }}>₹{parseFloat(date.effective_price || trip.base_price).toLocaleString()}</div>
                        <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{date.available_seats} Slots</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="adv-hidden" style={{ marginBottom: '64px' }}>
              <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', marginBottom: '24px' }}>The Mission</h2>
              <div className="adv-text" style={{ fontSize: '1.2rem', color: '#d4d4d8', whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {trip.description}
              </div>
            </section>

            {trip.highlights && trip.highlights.length > 0 && (
              <section className="adv-hidden adv-card" style={{ marginBottom: '64px', padding: '40px', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '32px' }}>Intel / Highlights</h2>
                <div className="grid grid-cols-2 gap-6 adv-text">
                  {trip.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <Check size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.1rem', color: '#e4e4e7' }}>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trip.itinerary && trip.itinerary.length > 0 && (
              <section className="adv-hidden" style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', marginBottom: '32px' }}>Operations Protocol</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '24px', top: '24px', bottom: '24px', width: '2px', background: '#3f3f46', zIndex: 0 }}></div>
                  
                  {trip.itinerary.map((day, i) => (
                    <div key={i} className="adv-hidden" style={{ display: 'flex', gap: '32px', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: '50px', height: '50px', background: '#09090b', border: '2px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                        D{day.day}
                      </div>
                      <div className="adv-card adv-text" style={{ padding: '32px', flex: 1, borderRadius: '8px' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'white', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>{day.title}</h3>
                        {day.activities && day.activities.length > 0 ? (
                          <ul style={{ paddingLeft: '20px', color: '#a1a1aa', fontSize: '1.1rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                            {day.activities.map((act, j) => <li key={j}>{act}</li>)}
                          </ul>
                        ) : (
                          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>{day.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <div className="adv-hidden" style={{ position: 'sticky', top: '100px' }}>
              <div className="adv-card" style={{ padding: '40px', borderRadius: '12px' }}>
                <div style={{ fontSize: '1rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Operations Cost</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '40px' }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                    ₹{parseInt(trip.base_price).toLocaleString()}
                  </span>
                </div>

                {trip.is_soldout ? (
                  <div style={{ background: '#7f1d1d', color: 'white', padding: '20px', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px' }}>
                    Mission Full
                  </div>
                ) : (
                  <Link 
                    to={selectedDateId ? `/book/${trip.slug}?date_id=${selectedDateId}` : '#'} 
                    onClick={(e) => {
                      if (!selectedDateId && trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0) {
                        e.preventDefault();
                        alert('Acknowledge: Select deployment date first.');
                      }
                    }}
                    className="btn adv-btn" 
                    style={{ width: '100%', padding: '20px', fontSize: '1.2rem', marginBottom: '40px', display: 'block', textAlign: 'center' }}
                  >
                    Initiate Booking
                  </Link>
                )}

                <div className="adv-text" style={{ borderTop: '1px solid #3f3f46', paddingTop: '32px' }}>
                  <h4 style={{ marginBottom: '24px', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>Logistics Included</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', color: '#d4d4d8' }}>
                    <li style={{ display: 'flex', gap: '12px' }}><Check color="#ef4444" /> Rations: {typeof trip.food_included === 'string' ? trip.food_included : 'Standard'}</li>
                    <li style={{ display: 'flex', gap: '12px' }}><Check color="#ef4444" /> Basecamp: {typeof trip.stay_details === 'string' ? trip.stay_details : 'Standard'}</li>
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
