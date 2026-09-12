import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, CheckCircle2 } from 'lucide-react';
import { analyzeIntelligence } from '../services/api';

export default function CropScanner() {
  const [fileUrl, setFileUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [cropType, setCropType] = useState('');
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    try {
      const data = new FormData();
      data.append('image', imageFile);
      data.append('cropType', cropType || 'Unknown');
      data.append('cropStage', 'Vegetative');
      data.append('cropVariety', 'Unknown');
      data.append('soilCondition', 'Normal');

      const response = await analyzeIntelligence(data);
      if (response.success) {
        setResult({
          disease: response.diagnosis?.name || 'Unknown',
          confidence: response.diagnosis?.confidence || 0,
          risk: response.risk?.level || 'Unknown',
          factors: response.symptoms && response.symptoms.length > 0 ? response.symptoms : ['No specific visual symptoms extracted']
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error(error);
      setResult({
        disease: 'Analysis Failed',
        confidence: 0,
        risk: 'Unknown',
        factors: ['Could not process the image. Please try again.']
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="card">
      <h2 className="h3 mb-4">AI Crop Health Scanner</h2>
      
      {!fileUrl ? (
        <div 
          className="scanner-upload-area" 
          onDragOver={(e) => e.preventDefault()} 
          onDrop={handleDrop}
        >
          <div className="scanner-icon-wrap">
            <UploadCloud size={32} />
          </div>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>Upload a clear image of the affected leaf or crop.</p>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Supported formats: JPG, PNG</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <UploadCloud size={20} style={{ marginRight: '8px' }} />
              Upload Image
              <input type="file" hidden accept="image/jpeg, image/png, image/webp" ref={fileInputRef} onChange={handleFileSelect} />
            </label>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <img src={fileUrl} alt="Crop preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
          
          {!result ? (
            <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem', boxSizing: 'border-box' }}>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Which leaf / crop is this? *</label>
                <input 
                  type="text" 
                  value={cropType} 
                  onChange={(e) => setCropType(e.target.value)} 
                  placeholder="e.g. Tomato Leaf, Corn" 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', color: 'var(--text-dark)', boxSizing: 'border-box' }} 
                />
              </div>
              <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing || !cropType.trim()} style={{ width: '100%', boxSizing: 'border-box' }}>
                {analyzing ? 'Analyzing crop image...' : 'Analyze with AI'}
              </button>
            </div>
          ) : (
            <div style={{ width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#F8FBF8', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-color)' }}>
                <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                  <h3 className="h3 text-primary" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal', margin: 0 }}>{result.disease}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${result.risk.toLowerCase()}`}>{result.risk} Risk</span>
                    <span className="badge badge-low">{result.confidence}% Confidence</span>
                  </div>
                </div>
                <div className="circular-progress" style={{ flexShrink: 0 }}>
                  <span className="circular-progress-value">{result.confidence}%</span>
                </div>
              </div>
              
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Why this was detected:</h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {result.factors.map((factor, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={16} className="text-primary" />
                    {factor}
                  </li>
                ))}
              </ul>
              <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={() => { setFileUrl(null); setImageFile(null); setResult(null); setCropType(''); }}>Scan Another</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
