import { useState } from 'react';
import apiClient from '../api/client';
import { Sparkles, MapPin, Calendar, Compass, ArrowRight } from 'lucide-react';

export default function AIPlanner() {
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    style: 'adventure'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [itineraryStr, setItineraryStr] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination) return;
    
    setIsLoading(true);
    setError('');
    setItineraryStr(null);
    
    try {
      const res = await apiClient.post('/ai/generate/', formData);
      // The API returns {'itinerary': response.text} where response.text is markdown or JSON.
      // Based on our prompt, it's structured JSON. We'll parse it if possible, otherwise show raw.
      setItineraryStr(res.data.itinerary);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to safely parse AI JSON response
  let parsedItinerary = null;
  if (itineraryStr) {
    try {
      // Find the JSON part if it's wrapped in markdown ```json ... ```
      const jsonMatch = itineraryStr.match(/```json\n([\s\S]*?)\n```/) || itineraryStr.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : itineraryStr;
      parsedItinerary = JSON.parse(jsonString);
    } catch (e) {
      console.warn("Could not parse itinerary as JSON, falling back to raw string", e);
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '64px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(243, 112, 33, 0.1)', color: 'var(--color-primary)', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 600, marginBottom: '16px' }}>
            <Sparkles size={18} /> AI-Powered Planner
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Craft Your Dream Safari</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            Tell our AI what you're looking for, and we'll generate a personalized, day-by-day itinerary just for you.
          </p>
        </div>

        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '48px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div className="input-group" style={{ flex: '1 1 250px', marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> Destination</label>
              <input 
                required 
                type="text" 
                className="input-field" 
                placeholder="e.g. Serengeti, Masai Mara"
                value={formData.destination} 
                onChange={e => setFormData({...formData, destination: e.target.value})} 
              />
            </div>
            
            <div className="input-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> Days</label>
              <input 
                required 
                type="number" 
                min="1" max="14"
                className="input-field" 
                value={formData.days} 
                onChange={e => setFormData({...formData, days: parseInt(e.target.value) || 3})} 
              />
            </div>

            <div className="input-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Compass size={16} /> Travel Style</label>
              <select 
                className="input-field" 
                value={formData.style} 
                onChange={e => setFormData({...formData, style: e.target.value})}
              >
                <option value="adventure">Adventure & Safari</option>
                <option value="luxury">Luxury & Comfort</option>
                <option value="photography">Wildlife Photography</option>
                <option value="family">Family Friendly</option>
                <option value="budget">Budget Backpacker</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: '1 1 150px', padding: '14px', height: '52px' }}>
              {isLoading ? 'Generating...' : 'Generate'} <Sparkles size={18} />
            </button>
          </form>
          
          {error && <div style={{ color: 'var(--color-danger)', marginTop: '16px', padding: '12px', background: '#FEE2E2', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
        </div>

        {/* Results Area */}
        {isLoading && (
          <div style={{ padding: '64px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Consulting our expert AI guides...</p>
          </div>
        )}

        {itineraryStr && !isLoading && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>Your Custom Itinerary</h2>
            
            {parsedItinerary && parsedItinerary.days ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {parsedItinerary.days.map((day, idx) => (
                  <div key={idx} className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--color-secondary)' }}>
                      Day {day.day}: {day.title}
                    </h3>
                    
                    <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                      <div>
                        <h4 style={{ color: 'var(--color-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>Activities</h4>
                        <ul style={{ paddingLeft: '20px', color: 'var(--color-text-main)' }}>
                          {Array.isArray(day.activities) 
                            ? day.activities.map((act, i) => <li key={i} style={{ marginBottom: '4px' }}>{act}</li>)
                            : <li>{day.activities}</li>}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 style={{ color: 'var(--color-accent)', marginBottom: '8px', fontSize: '1.1rem' }}>Food & Tips</h4>
                        {day.food && <p style={{ marginBottom: '8px' }}><strong>Food:</strong> {day.food}</p>}
                        {day.tips && <p><strong>Tip:</strong> {day.tips}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-line', fontSize: '1.1rem', lineHeight: '1.8' }}>
                {itineraryStr}
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>Ready to make this trip a reality?</p>
              <a href="/trips" className="btn btn-primary">Find Similar Trips <ArrowRight size={18} /></a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
