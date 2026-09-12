import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getCommunityScans } from '../../services/api';

export default function RiskMap() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Default center (India roughly)
  const defaultCenter = [20.5937, 78.9629]; 

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await getCommunityScans();
        if (response.success && response.scans) {
          setScans(response.scans);
        }
      } catch (error) {
        console.error('Error fetching community scans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return '#ef4444'; // red
      case 'high': return '#f97316'; // orange
      case 'moderate': return '#eab308'; // yellow
      case 'low': return '#22c55e'; // green
      default: return '#3b82f6'; // blue
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px' }}>Loading Community Risk Map...</div>;
  }

  // Filter out scans without coordinates
  const validScans = scans.filter(s => s.coordinates && s.coordinates.lat && s.coordinates.lng);
  
  const mapCenter = validScans.length > 0 
    ? [validScans[0].coordinates.lat, validScans[0].coordinates.lng] 
    : defaultCenter;

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '450px', width: '100%', position: 'relative', zIndex: 0 }}>
      <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validScans.map((scan) => (
          <CircleMarker
            key={scan._id}
            center={[scan.coordinates.lat, scan.coordinates.lng]}
            pathOptions={{ 
              color: getRiskColor(scan.riskLevel),
              fillColor: getRiskColor(scan.riskLevel),
              fillOpacity: 0.6,
              weight: 2
            }}
            radius={scan.riskLevel === 'Critical' ? 12 : scan.riskLevel === 'High' ? 10 : 8}
          >
            <Popup>
              <div style={{ padding: '5px' }}>
                <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '5px' }}>{scan.cropType}</strong>
                <span style={{ display: 'block', color: getRiskColor(scan.riskLevel), fontWeight: 'bold' }}>
                  {scan.riskLevel} Risk
                </span>
                <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '2px', display: 'block' }}>
                  {scan.diseaseType || 'Unknown Issue'}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
