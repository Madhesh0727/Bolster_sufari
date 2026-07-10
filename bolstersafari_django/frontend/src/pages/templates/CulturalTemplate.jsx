import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Check, Sunrise } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CulturalTemplate({ trip }) {
  const [selectedDateId, setSelectedDateId] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-culture');
        }
      });
    }, { threshold: 0.1 });
    
    const hiddenElements = document.querySelectorAll('.culture-hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, [trip]);

  return (
    <div style={{ backgroundColor: '#faf9f6', color: '#33272a', minHeight: '100vh', fontFamily: "'Playfair Display', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        .culture-hidden {
          opacity: 0;
          transform: translateY(30px);
          filter: blur(5px);
          transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .culture-hidden.show-culture {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
        .culture-text {
          font-family: 'Lato', sans-serif;
        }
        .culture-card {
          background: #ffffff;
          border: 1px solid #f0ebe1;
          box-shadow: 0 10px 30px rgba(51, 39, 42, 0.05);
          transition: all 0.5s ease;
        }
        .culture-card:hover {
          box-shadow: 0 15px 40px rgba(51, 39, 42, 0.1);
        }
        .culture-btn {
          background: #8b2635;
          color: #faf9f6;
          border: none;
          transition: all 0.4s ease;
          font-family: 'Lato', sans-serif;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .culture-btn:hover {
          background: #6a1d28;
        }
      `}</style>

      {/* Hero */}
      <div style={{ 
        height: '85vh', 
        position: 'relative',
        background: `linear-gradient(to bottom, rgba(51,39,42,0.3), rgba(51,39,42,0.8)), url(${trip.cover_image || trip.destination?.hero_image_url}) center/cover fixed`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div className="container" style={{ zIndex: 10, width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '1px', background: '#d4af37' }}></div>
            <span className="culture-text" style={{ color: '#d4af37', fontSize: '1rem', letterSpacing: '4px', textTransform: 'uppercase' }}>
              {trip.category_display || 'Cultural Journey'}
            </span>
            <div style={{ width: '40px', height: '1px', background: '#d4af37' }}></div>
          </div>
          
          <h1 style={{ fontSize: '5.5rem', fontWeight: 400, color: '#faf9f6', marginBottom: '32px', fontStyle: 'italic', lineHeight: 1.1 }}>
            {trip.title}
          </h1>
          
          <div className="culture-text" style={{ display: 'flex', gap: '40px', fontSize: '1.1rem', color: '#e5e0d8', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', fontWeight: 300, letterSpacing: '1px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color="#d4af37" /> {trip.destination_name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} color="#d4af37" /> {trip.days} Days</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '96px 0' }}>
        <div className="grid trip-detail-layout" style={{ gridTemplateColumns: '2fr 1fr', gap: '80px' }}>
          
          <div>
            <section className="culture-hidden" style={{ marginBottom: '80px', textAlign: 'center' }}>
              <Sunrise size={40} color="#d4af37" style={{ margin: '0 auto 24px auto' }} />
              <div className="culture-text" style={{ fontSize: '1.3rem', color: '#5e4b50', whiteSpace: 'pre-line', lineHeight: 2, fontWeight: 300, padding: '0 40px' }}>
                {trip.description}
              </div>
            </section>

            {trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0 && (
              <section className="culture-hidden" style={{ marginBottom: '80px' }}>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '40px', color: '#33272a', textAlign: 'center', fontStyle: 'italic' }}>Select Your Dates</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                  {trip.dates.filter(d => d.available_seats > 0).map(date => {
                    const isSelected = selectedDateId === date.id;
                    const startDate = new Date(date.start_date);
                    
                    return (
                      <div 
                        key={date.id} 
                        onClick={() => setSelectedDateId(date.id)}
                        className="culture-text"
                        style={{ 
                          border: isSelected ? '1px solid #8b2635' : '1px solid #e5e0d8', 
                          backgroundColor: isSelected ? '#fffafa' : '#ffffff',
                          padding: '32px 24px', 
                          cursor: 'pointer',
                          transition: 'all 0.4s',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 300, fontSize: '1.2rem', color: '#33272a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                          {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '1.3rem', color: '#8b2635' }}>₹{parseFloat(date.effective_price || trip.base_price).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {trip.highlights && trip.highlights.length > 0 && (
              <section className="culture-hidden culture-card" style={{ marginBottom: '80px', padding: '64px 48px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '40px', color: '#33272a', textAlign: 'center', fontStyle: 'italic' }}>The Experience</h2>
                <div className="grid grid-cols-2 gap-10 culture-text">
                  {trip.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', background: '#d4af37', transform: 'rotate(45deg)', flexShrink: 0 }}></div>
                      <span style={{ fontSize: '1.1rem', color: '#5e4b50', fontWeight: 300, lineHeight: 1.6 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trip.itinerary && trip.itinerary.length > 0 && (
              <section className="culture-hidden" style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '48px', color: '#33272a', textAlign: 'center', fontStyle: 'italic' }}>Journey Itinerary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
                  {trip.itinerary.map((day, i) => (
                    <div key={i} className="culture-hidden" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                      <div style={{ width: '80px', borderTop: '1px solid #d4af37', paddingTop: '16px', color: '#d4af37', fontSize: '1.2rem', fontStyle: 'italic' }}>
                        Day {day.day}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '16px', color: '#33272a', fontWeight: 400 }}>{day.title}</h3>
                        {day.activities && day.activities.length > 0 ? (
                          <ul style={{ paddingLeft: '20px', color: '#6B7280', fontSize: '1.1rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                            {day.activities.map((act, j) => <li key={j}>{act}</li>)}
                          </ul>
                        ) : (
                          <p style={{ color: '#6B7280', fontSize: '1.1rem', lineHeight: 1.8, margin: 0 }}>{day.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <div className="culture-hidden" style={{ position: 'sticky', top: '100px' }}>
              <div className="culture-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div className="culture-text" style={{ fontSize: '0.9rem', color: '#8c7b80', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>Investment</div>
                <div style={{ fontSize: '3rem', color: '#33272a', fontStyle: 'italic', marginBottom: '40px' }}>
                  ₹{parseInt(trip.base_price).toLocaleString()}
                </div>

                {trip.is_soldout ? (
                  <div className="culture-text" style={{ color: '#8b2635', padding: '16px', border: '1px solid #8b2635', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '40px' }}>
                    Currently Unavailable
                  </div>
                ) : (
                  <Link 
                    to={selectedDateId ? `/book/${trip.slug}?date_id=${selectedDateId}` : '#'} 
                    onClick={(e) => {
                      if (!selectedDateId && trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0) {
                        e.preventDefault();
                        alert('Please select your preferred dates.');
                      }
                    }}
                    className="culture-btn" 
                    style={{ display: 'block', width: '100%', padding: '20px', fontSize: '1rem', marginBottom: '48px', textDecoration: 'none' }}
                  >
                    Request Reservation
                  </Link>
                )}

                <div className="culture-text" style={{ textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '24px', color: '#33272a', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Curated Inclusions</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px', color: '#5e4b50', fontWeight: 300 }}>
                    <li style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '4px', height: '4px', background: '#d4af37', borderRadius: '50%' }}></div>
                      Dining: {typeof trip.food_included === 'string' ? trip.food_included : 'Gastronomic Experiences'}
                    </li>
                    <li style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '4px', height: '4px', background: '#d4af37', borderRadius: '50%' }}></div>
                      Lodging: {typeof trip.stay_details === 'string' ? trip.stay_details : 'Heritage Stays'}
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
