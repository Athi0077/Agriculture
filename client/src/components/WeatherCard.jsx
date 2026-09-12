import React from 'react';
import { Thermometer, Droplets, CloudRain, Wind, Sprout, MapPin } from 'lucide-react';

export default function WeatherCard({ weatherData, lastUpdated }) {
  if (!weatherData) return null;

  // AI Logic block for disease risk
  const isHighRisk = weatherData.temperature > 25 && weatherData.humidity > 70;
  const riskColor = isHighRisk ? '#ef4444' : '#10b981';
  const riskBg = isHighRisk ? '#fef2f2' : '#ecfdf5';

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="h3">Current Weather</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            <MapPin size={14} /> 
            <span>{weatherData.location}</span>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Updated {lastUpdated}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary-color)' }}>
          {weatherData.temperature}°C
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{weatherData.description}</div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Feels like {weatherData.feelsLike}°C</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--primary-color)' }}><Droplets size={20} /></div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Humidity</div>
            <div style={{ fontWeight: 600 }}>{weatherData.humidity}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--primary-color)' }}><Wind size={20} /></div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Wind Speed</div>
            <div style={{ fontWeight: 600 }}>{weatherData.windSpeed} km/h</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--primary-color)' }}><CloudRain size={20} /></div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Rain Prob.</div>
            <div style={{ fontWeight: 600 }}>{weatherData.rainProbability}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--primary-color)' }}><Thermometer size={20} /></div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>UV Index</div>
            <div style={{ fontWeight: 600 }}>{weatherData.uvIndex}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: riskBg, borderRadius: 'var(--radius-md)', border: `1px solid ${riskColor}40` }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: riskColor, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sprout size={16} /> Crop Disease Risk
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-color)', margin: 0 }}>
          {isHighRisk 
            ? "High Risk: Current temperature and humidity levels significantly increase the risk of fungal disease development. Consider preventative measures."
            : "Low Risk: Current weather conditions are favorable and present a low risk for fungal disease outbreaks."}
        </p>
      </div>
    </div>
  );
}
