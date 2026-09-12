import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

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

export default function Settings() {
  const { currentUser, updateUserSettings } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [formData, setFormData] = useState({
    state: '',
    city: '',
    language: 'English'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        state: currentUser.state || '',
        city: currentUser.city || '',
        language: currentUser.language || 'English'
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateUserSettings(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        i18n.changeLanguage(formData.language);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update settings.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Server error, please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar title={t('Settings')} subtitle={t('Manage your account preferences and app settings')} />
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="h3 mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          {t('Profile Settings')}
        </h2>
        
        {message.text && (
          <div style={{ 
            backgroundColor: message.type === 'success' ? '#E8F5E9' : '#FEE2E2', 
            color: message.type === 'success' ? '#2E7D32' : '#B91C1C', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem' 
          }}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>State</label>
            <select 
              name="state" 
              value={formData.state} 
              onChange={(e) => { handleChange(e); setFormData(prev => ({ ...prev, state: e.target.value, city: '' })); }} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }}
            >
              <option value="">Select State</option>
              {Object.keys(indiaData).sort().map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>City</label>
            <select 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              required 
              disabled={!formData.state} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: formData.state ? 'var(--card-bg)' : '#f3f4f6', color: 'var(--text-dark)' }}
            >
              <option value="">Select City</option>
              {formData.state && indiaData[formData.state]?.sort().map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Used for fetching local weather and localized disease alerts.</p>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('Language Preference')}</label>
            <select 
              name="language" 
              value={formData.language} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }}
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Hindi">Hindi</option>
            </select>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Select the language for AI diagnosis and UI.</p>
          </div>
          
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : t('Save Changes')}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
