import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const indiaData = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"]
};

export default function Signup() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    city: '', 
    state: '',
    phone: '',
    location: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);

  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error('Failed to fetch location data');
          const data = await response.json();
          
          const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
          const state = data.address.state || '';
          const country = data.address.country || '';

          setFormData(prev => ({
            ...prev,
            city,
            state,
            location: {
              latitude,
              longitude,
              city,
              state,
              country
            }
          }));
        } catch {
          setLocationError("Failed to detect location details. Please try again or enter manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission was denied. Please allow location access or enter your location manually.");
        } else {
          setLocationError("Failed to detect location. Please try again or enter manually.");
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (!formData.city || !formData.state) {
      return setError('Location is required. Please use current location or enter manually.');
    }

    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      delete dataToSubmit.confirmPassword;
      const result = await signup(dataToSubmit);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Failed to create account');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: '2rem 0' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
        <h2 className="h2" style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Create Account</h2>
        {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Location *</label>
            
            {!showManualLocation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 500,
                    cursor: isLocating ? 'not-allowed' : 'pointer',
                    opacity: isLocating ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isLocating ? '📍 Detecting your location...' : '📍 Use My Current Location'}
                </button>
                
                {formData.location ? (
                  <div style={{ backgroundColor: '#DEF7EC', color: '#03543F', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>✓ Current Location Detected</div>
                    <div>📍 {formData.location.city}, {formData.location.state}, {formData.location.country}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>Location detected automatically</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', textAlign: 'center' }}>
                    Allow location access to automatically detect your city and state.
                  </div>
                )}

                {locationError && (
                  <div style={{ color: '#B91C1C', fontSize: '0.875rem', textAlign: 'center', marginTop: '0.5rem' }}>
                    {locationError}
                  </div>
                )}
                
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowManualLocation(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Enter location manually
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>State *</label>
                    <select name="state" value={formData.state} onChange={(e) => { handleChange(e); setFormData(prev => ({ ...prev, state: e.target.value, city: '' })); }} required={showManualLocation} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                      <option value="">Select State</option>
                      {Object.keys(indiaData).sort().map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>City *</label>
                    <select name="city" value={formData.city} onChange={handleChange} required={showManualLocation} disabled={!formData.state} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: formData.state ? 'white' : '#f3f4f6' }}>
                      <option value="">Select City</option>
                      {formData.state && indiaData[formData.state]?.sort().map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowManualLocation(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Use automatic location detection instead
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number (Optional)</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password *</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
