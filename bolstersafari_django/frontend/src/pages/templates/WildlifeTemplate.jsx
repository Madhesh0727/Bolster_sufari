import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Check, Leaf } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WildlifeTemplate({ trip }) {
  const [selectedDateId, setSelectedDateId] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-wildlife');
        }
      });
    }, { threshold: 0.1 });
    
    const hiddenElements = document.querySelectorAll('.wild-hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, [trip]);

  return (
    <div style={{ backgroundColor: '#f4f1ea', color: '#2c3e2e', minHeight: '100vh', fontFamily: "'Lora', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@300;400;600&display=swap');
        .wild-hidden {
          opacity: 0;
          transform: translateY(50px);
          transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wild-hidden.show-wildlife {
          opacity: 1;
          transform: translateY(0);
        }
        .wild-text {
          font-family: 'Nunito', sans-serif;
        }
        .wild-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          transition: all 0.4s ease;
        }
        .wild-card:hover {
          box-shadow: 0 20px 40px rgba(44, 62, 46, 0.08);
          transform: translateY(-5px);
        }
        .wild-btn {
          background: #2c3e2e;
          color: #f4f1ea;
          border-radius: 50px;
          border: none;
          transition: all 0.3s ease;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
        }
        .wild-btn:hover {
          background: #1a251b;
          transform: scale(1.02);
        }
      `}</style>

      {/* Hero */}
      <div style={{ 
        height: '75vh', 
        position: 'relative',
        background: `linear-gradient(to top, rgba(244, 241, 234, 1), rgba(44, 62, 46, 0.3)), url(${trip.cover_image || trip.destination?.hero_image_url}) center/cover fixed`,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ zIndex: 10, width: '100%', marginTop: 'auto', paddingBottom: '64px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.9)', padding: '8px 24px', borderRadius: '50px' }}>
            <Leaf size={16} color="#2c3e2e" />
            <span className="wild-text" style={{ color: '#2c3e2e', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {trip.category_display || 'Wildlife Safari'}
            </span>
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 600, color: '#2c3e2e', marginBottom: '24px', lineHeight: 1.1 }}>
            {trip.title}
          </h1>
          <div className="wild-text" style={{ display: 'flex', gap: '32px', fontSize: '1.2rem', color: '#4a5d4c', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} /> {trip.destination_name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} /> {trip.days} Days / {trip.nights} Nights</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 0 96px 0' }}>
        <div className="grid trip-detail-layout" style={{ gridTemplateColumns: '1fr 380px', gap: '64px' }}>
          
          <div>
            <section className="wild-hidden" style={{ marginBottom: '64px' }}>
              <div className="wild-text" style={{ fontSize: '1.25rem', color: '#4a5d4c', whiteSpace: 'pre-line', lineHeight: 1.9 }}>
                <span style={{ fontSize: '4rem', float: 'left', lineHeight: '0.8', marginRight: '12px', color: '#2c3e2e', fontFamily: 'Lora' }}>
                  {trip.description.charAt(0)}
                </span>
                {trip.description.substring(1)}
              </div>
            </section>

            {trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0 && (
              <section className="wild-hidden wild-card" style={{ marginBottom: '64px', padding: '40px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '32px', color: '#2c3e2e', textAlign: 'center' }}>Upcoming Expeditions</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {trip.dates.filter(d => d.available_seats > 0).map(date => {
                    const isSelected = selectedDateId === date.id;
                    const startDate = new Date(date.start_date);
                    
                    return (
                      <div 
                        key={date.id} 
                        onClick={() => setSelectedDateId(date.id)}
                        className="wild-text"
                        style={{ 
                          border: isSelected ? '2px solid #5a7d5f' : '1px solid #e2e8f0', 
                          backgroundColor: isSelected ? '#f8fdf9' : 'white',
                          borderRadius: '16px',
                          padding: '24px', 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#2c3e2e' }}>
                          {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', margin: '8px 0' }}>{startDate.getFullYear()}</div>
                        <div style={{ fontSize: '1.1rem', color: '#5a7d5f', fontWeight: 600 }}>₹{parseFloat(date.effective_price || trip.base_price).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {trip.highlights && trip.highlights.length > 0 && (
              <section className="wild-hidden" style={{ marginBottom: '64px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '32px', color: '#2c3e2e' }}>Journey Highlights</h2>
                <div className="grid grid-cols-2 gap-8 wild-text">
                  {trip.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <Leaf size={24} color="#5a7d5f" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '1.1rem', color: '#4a5d4c', lineHeight: 1.6 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trip.itinerary && trip.itinerary.length > 0 && (
              <section className="wild-hidden" style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '40px', color: '#2c3e2e' }}>The Trail</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                  {trip.itinerary.map((day, i) => (
                    <div key={i} className="wild-hidden" style={{ display: 'flex', gap: '32px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eef3ef', color: '#2c3e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                        {day.day}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '16px', color: '#2c3e2e' }}>{day.title}</h3>
                        {day.activities && day.activities.length > 0 ? (
                          <ul style={{ paddingLeft: '20px', color: '#4a5d4c', fontSize: '1.1rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                            {day.activities.map((act, j) => <li key={j}>{act}</li>)}
                          </ul>
                        ) : (
                          <p style={{ color: '#4a5d4c', fontSize: '1.1rem', lineHeight: 1.8, margin: 0 }}>{day.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <div className="wild-hidden" style={{ position: 'sticky', top: '100px' }}>
              <div className="wild-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div className="wild-text" style={{ fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Experience from</div>
                  <div style={{ fontSize: '3.5rem', color: '#2c3e2e', lineHeight: 1 }}>
                    ₹{parseInt(trip.base_price).toLocaleString()}
                  </div>
                  <div className="wild-text" style={{ color: '#64748b', marginTop: '8px' }}>per explorer</div>
                </div>

                {trip.is_soldout ? (
                  <div style={{ background: '#fef2f2', color: '#991b1b', padding: '20px', borderRadius: '50px', textAlign: 'center', fontWeight: 600, marginBottom: '32px' }}>
                    Fully Booked
                  </div>
                ) : (
                  <Link 
                    to={selectedDateId ? `/book/${trip.slug}?date_id=${selectedDateId}` : '#'} 
                    onClick={(e) => {
                      if (!selectedDateId && trip.dates && trip.dates.filter(d => d.available_seats > 0).length > 0) {
                        e.preventDefault();
                        alert('Please select a departure date for your expedition.');
                      }
                    }}
                    className="wild-btn" 
                    style={{ width: '100%', padding: '20px', fontSize: '1.1rem', marginBottom: '40px', display: 'block', textAlign: 'center', textDecoration: 'none' }}
                  >
                    Reserve Your Spot
                  </Link>
                )}

                <div className="wild-text" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                  <h4 style={{ marginBottom: '24px', color: '#2c3e2e', fontSize: '1.1rem', fontWeight: 600 }}>Expedition Includes</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', color: '#4a5d4c' }}>
                    <li style={{ display: 'flex', gap: '12px' }}><Check color="#5a7d5f" size={20} /> Cuisine: {typeof trip.food_included === 'string' ? trip.food_included : 'All Meals'}</li>
                    <li style={{ display: 'flex', gap: '12px' }}><Check color="#5a7d5f" size={20} /> Lodge: {typeof trip.stay_details === 'string' ? trip.stay_details : 'Eco-Resorts'}</li>
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
