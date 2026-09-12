import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import WeatherCard from '../components/WeatherCard';
import WeatherAssistant from '../components/WeatherAssistant';
import { getWeather } from '../services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function WeatherField() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getWeather();
      if (data.success) {
        setWeatherData(data.weatherData);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setError(data.message || 'Failed to fetch weather data.');
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('city, state')) {
        setError('Please update your location to view local weather.');
      } else {
        setError(err.response?.data?.message || 'Error connecting to weather service.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div>
      <Navbar title="Weather & Field" subtitle="Current environmental conditions." />
      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {loading ? (
          <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div className="text-muted">Loading weather data...</div>
          </div>
        ) : error ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '1rem', textAlign: 'center' }}>
            <div style={{ color: '#ef4444' }}><AlertCircle size={32} /></div>
            <p className="text-muted">{error}</p>
            <button onClick={fetchWeather} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : weatherData ? (
          <>
            <WeatherCard weatherData={weatherData} lastUpdated={lastUpdated} />
            <WeatherAssistant weatherData={weatherData} />
          </>
        ) : null}
        
      </div>
    </div>
  );
}
