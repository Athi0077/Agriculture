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
    phone: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSubmit } = formData;
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>State *</label>
              <select name="state" value={formData.state} onChange={(e) => { handleChange(e); setFormData(prev => ({ ...prev, state: e.target.value, city: '' })); }} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                <option value="">Select State</option>
                {Object.keys(indiaData).sort().map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>City *</label>
              <select name="city" value={formData.city} onChange={handleChange} required disabled={!formData.state} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: formData.state ? 'white' : '#f3f4f6' }}>
                <option value="">Select City</option>
                {formData.state && indiaData[formData.state]?.sort().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
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
