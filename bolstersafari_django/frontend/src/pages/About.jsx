import React, { useState, useEffect } from 'react';
import { Users, Globe2, Heart, Compass, Shield, Smile, Map } from 'lucide-react';
import landingbg from '../assets/landingbg.png';

const greetings = [
  { text: 'வரவேற்கிறோம்', lang: 'Tamil' },
  { text: 'स्वागत है', lang: 'Hindi' },
  { text: 'స్వాగతం', lang: 'Telugu' },
  { text: 'സ്വാഗതം', lang: 'Malayalam' },
  { text: 'ಸ್ವಾಗತ', lang: 'Kannada' },
  { text: 'Welcome', lang: 'English' },
  { text: 'Bienvenido', lang: 'Spanish' },
  { text: 'Bienvenue', lang: 'French' },
  { text: 'Willkommen', lang: 'German' },
  { text: 'Benvenuto', lang: 'Italian' }
];

const About = () => {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // SEO Optimization
  useEffect(() => {
    document.title = "About Us | Bolster Safari - Travel Together";
    
    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Discover Bolster Safari's mission to turn strangers into friends through shared travel experiences. We connect the world through group adventures and the universal language of English.";

    // Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = "Bolster Safari, travel together, group travel, strangers to friends, international tours, English speaking tours, adventure, community travel";
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
        setFade(true);
      }, 500); 
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: `url(${landingbg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      padding: '4rem 1rem' 
    }}>
      {/* Dark overlay for readability (Reverted to the dark theme you liked!) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        zIndex: 0
      }}></div>

      <style>
        {`
          .fade-transition {
            transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
          }
          .fade-in {
            opacity: 1;
            transform: translateY(0);
          }
          .fade-out {
            opacity: 0;
            transform: translateY(-10px);
          }
          
          /* Animated Light Colorful Gradient Hero */
          .about-hero {
            text-align: center;
            margin-bottom: 4rem;
            padding: 4rem 2rem;
            background: linear-gradient(-45deg, #ffc8b8, #ffb3d1, #bce0f5, #bcf0e1);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            color: #1e293b;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.5);
          }
          
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Glassmorphism Cards (Dark Theme) */
          .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2.5rem;
            color: #f8fafc;
            transition: transform 0.3s ease, background 0.3s ease;
            height: 100%;
          }
          
          .glass-card:hover {
            transform: translateY(-8px);
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .grid-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto 4rem auto;
          }
          
          @media (min-width: 768px) {
            .grid-container {
              grid-template-columns: 1fr 1fr;
            }
          }

          .grid-3 {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          @media (min-width: 1024px) {
            .grid-3 {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}
      </style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Animated Light Welcome Section */}
        <div className="about-hero">
          <h1 
            className={`fade-transition ${fade ? 'fade-in' : 'fade-out'}`} 
            style={{ fontSize: '4.5rem', fontWeight: '800', margin: '0 0 1rem 0' }}
          >
            {greetings[greetingIndex].text}
          </h1>
          <p 
            className={`fade-transition ${fade ? 'fade-in' : 'fade-out'}`}
            style={{ fontSize: '1.5rem', opacity: 0.7, margin: 0, fontWeight: '500' }}
          >
            ({greetings[greetingIndex].lang})
          </p>
          <div style={{ marginTop: '2.5rem', fontSize: '1.75rem', fontWeight: '600', letterSpacing: '2px', color: '#3b82f6' }}>
            To Bolster Safari
          </div>
        </div>

        {/* Intro Text */}
        <div style={{ textAlign: 'center', marginBottom: '5rem', maxWidth: '800px', margin: '0 auto 5rem auto' }}>
          <h2 style={{ fontSize: '3rem', color: '#ffffff', marginBottom: '1.5rem', fontWeight: '700' }}>Strangers to Friends</h2>
          <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.8 }}>
            At Bolster Safari, we believe that the best part of traveling isn't just the destinations you see, but the people you meet. Our trips are specially curated to bring people together, turning strangers into lifelong friends through shared adventures, group exploration, and connecting through the universal language of English.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid-container">
          
          {/* Mission */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: '#60a5fa' }}>
              <Compass size={36} style={{ marginRight: '1rem' }} />
              <h2 style={{ fontSize: '2.2rem', margin: 0, color: '#ffffff' }}>Our Mission</h2>
            </div>
            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '2rem' }}>
              To create unforgettable travel experiences where people from different backgrounds can explore the world together. We aim to break down barriers by fostering an environment where English serves as a bridge, allowing travelers to communicate, share stories, and build meaningful connections globally.
            </p>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: '#e2e8f0', fontSize: '1.1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Users size={24} color="#60a5fa" style={{ marginRight: '1rem' }} />
                <span>Travel safely in small, curated friendly groups</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Map size={24} color="#60a5fa" style={{ marginRight: '1rem' }} />
                <span>Explore breathtaking and exotic destinations</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <Heart size={24} color="#60a5fa" style={{ marginRight: '1rem' }} />
                <span>Turn shared moments into lifelong friendships</span>
              </li>
            </ul>
          </div>

          {/* Vision */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: '#34d399' }}>
              <Globe2 size={36} style={{ marginRight: '1rem' }} />
              <h2 style={{ fontSize: '2.2rem', margin: 0, color: '#ffffff' }}>Our Vision</h2>
            </div>
            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              We envision a world made smaller and friendlier through travel. A world where solo travelers never feel alone, where diverse cultures intermingle safely and joyfully, and where every journey ends with a new group of friends you can't wait to travel with again.
            </p>
            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.7 }}>
              By emphasizing English as our common medium of communication, we ensure that everyone feels included in the conversation, whether we're laughing over a campfire or marveling at a beautiful sunset. We don't just organize trips; we cultivate vibrant communities.
            </p>
          </div>
        </div>

        {/* Core Values Section */}
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#ffffff', marginBottom: '3rem', marginTop: '2rem' }}>Why Travel With Us?</h2>
        <div className="grid-3">
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: 'rgba(96, 165, 250, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Shield size={40} color="#60a5fa" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Safe & Secure</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>We prioritize your safety above all else, ensuring vetted guides and secure accommodations everywhere we go.</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: 'rgba(52, 211, 153, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Smile size={40} color="#34d399" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Authentic Connections</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Our itineraries are designed to foster interaction, teamwork, and laughter among all travelers.</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: 'rgba(244, 114, 182, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Globe2 size={40} color="#f472b6" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Global Community</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Join a growing network of global explorers who use English to bridge cultural divides and share the world.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;

