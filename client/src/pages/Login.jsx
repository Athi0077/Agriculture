import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
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
    setLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Failed to login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 className="h2" style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Welcome Back</h2>
        {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
