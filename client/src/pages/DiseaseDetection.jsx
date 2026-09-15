import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { UploadCloud, CheckCircle2, AlertTriangle, RefreshCw, Users, X } from 'lucide-react';
import { analyzeIntelligence, createPost } from '../services/api';
import AnalysisLoader from '../components/intelligence/AnalysisLoader';
import RiskScore from '../components/intelligence/RiskScore';
import RiskFactorBreakdown from '../components/intelligence/RiskFactorBreakdown';
import RiskDrivers from '../components/intelligence/RiskDrivers';
import { useTranslation } from 'react-i18next';
import RecommendationList from '../components/intelligence/RecommendationList';
import DoubtChat from '../components/intelligence/DoubtChat';

export default function DiseaseDetection() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    cropType: 'Tomato',
    cropStage: 'Vegetative',
    cropVariety: 'Hybrid',
    soilCondition: 'Normal'
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    setStep(4); // Loader step
    setLoading(true);
    setError(null);

    // Grab geolocation
    let lat = null;
    let lng = null;
    try {
      if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    } catch (err) {
      console.warn("Could not get location:", err.message);
    }
    
    const data = new FormData();
    data.append('image', imageFile);
    data.append('cropType', formData.cropType);
    data.append('cropStage', formData.cropStage);
    data.append('cropVariety', formData.cropVariety);
    data.append('soilCondition', formData.soilCondition);
    if (lat && lng) {
      data.append('lat', lat);
      data.append('lng', lng);
    }

    if (!navigator.onLine) {
      try {
        const { savePendingScan } = await import('../services/offlineSync');
        await savePendingScan(data);
        setResult({ isOffline: true });
        setStep(5);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed to save scan offline:', err);
        setError('You are offline and we failed to save the scan locally.');
        setStep(3);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await analyzeIntelligence(data);
      
      if (response.success) {
        setResult(response);
      } else {
        throw new Error(response.message || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred during analysis');
      setStep(3); // Go back to form
      setLoading(false);
    }
  };

  const handleLoaderComplete = () => {
    setLoading(false);
    if (result) {
      setStep(5);
    }
  };

  const resetForm = () => {
    setStep(1);
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };
  
  const handleShareSubmit = async () => {
    if (!shareText.trim()) return;
    setIsSharing(true);
    try {
      await createPost({
        content: shareText,
        scanId: result.scanId
      });
      setShowShareModal(false);
      setShareText('');
      // Could show a success toast here
      alert('Shared successfully to the community!');
    } catch (err) {
      console.error(err);
      alert('Failed to share to community.');
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <div>
      <Navbar 
        title={t('Disease Detection')} 
        subtitle={t('Scan your crops using AI to detect diseases early')} 
      />
      
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              color: step >= s ? 'var(--primary-color)' : 'var(--text-muted)'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: step >= s ? 'var(--primary-color)' : '#E5E7EB',
                color: step >= s ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', marginBottom: '0.5rem'
              }}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, textAlign: 'center' }}>
                {s === 1 ? t('Scan') : s === 2 ? t('Details') : s === 3 ? t('Field Data') : s === 4 ? t('Analysis') : t('Results')}
              </span>
            </div>
          ))}
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {step === 1 && (
          <div style={{ padding: '2rem' }}>
            <h2 className="h3" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('New Scan')}</h2>
            
            <div 
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-color)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '1.5rem'
              }}
              onClick={() => fileInputRef.current.click()}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result);
                    setStep(2);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              <UploadCloud size={48} color="var(--primary-color)" style={{ margin: '0 auto 1rem' }} />
              <h3 className="h4" style={{ marginBottom: '0.5rem' }}>{t('Upload Crop Image')}</h3>
              <p className="text-muted">{t('Drag and drop an image of your crop here, or click to select a file')}</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
              />
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={imagePreview} alt="Crop preview" style={{ width: '100%', display: 'block' }} />
                </div>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => setStep(1)}
                >
                  <RefreshCw size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  {t('Change Image')}
                </button>
              </div>
              
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h2 className="h3 mb-4">{t('Crop Details')}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('Select Crop Type')}</label>
                    <select 
                      name="cropType"
                      className="form-control"
                      value={formData.cropType}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: '#FFFFFF', color: 'var(--text-dark)' }}
                    >
                      <option value="">{t('Select Crop Type')}</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Potato">Potato</option>
                      <option value="Rice">Rice</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Corn">Corn</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('Select Growth Stage')} (Optional)</label>
                    <select 
                      name="cropStage"
                      className="form-control"
                      value={formData.cropStage}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: '#FFFFFF', color: 'var(--text-dark)' }}
                    >
                      <option value="">{t('Select Growth Stage')}</option>
                      <option value="Seedling">Seedling</option>
                      <option value="Vegetative">Vegetative</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Fruiting">Fruiting</option>
                      <option value="Maturity">Maturity</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('Select Soil Condition')} (Optional)</label>
                    <select 
                      name="soilCondition"
                      className="form-control"
                      value={formData.soilCondition}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: '#FFFFFF', color: 'var(--text-dark)' }}
                    >
                      <option value="">{t('Select Soil Condition')}</option>
                      <option value="Normal">Normal</option>
                      <option value="Dry">Dry</option>
                      <option value="Moist">Moist</option>
                      <option value="Waterlogged">Waterlogged</option>
                    </select>
                  </div>
                  
                  <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                      disabled={!formData.cropType}
                      onClick={handleAnalyze}
                    >
                      {t('Start Analysis')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <AnalysisLoader isComplete={!!result && !error} onComplete={handleLoaderComplete} />
        )}

        {step === 5 && result && (
          <div>
            {result.isOffline ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ color: '#F59E0B', marginBottom: '1rem' }}>
                  <AlertTriangle size={64} style={{ margin: '0 auto' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>{t('Saved for Later!')}</h3>
                <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                  {t('You are currently offline. Your crop scan has been saved securely on your device. It will automatically upload and analyze as soon as your internet connection is restored.')}
                </p>
                <button className="btn btn-primary" onClick={resetForm}>{t('Scan Another Crop')}</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                  {/* Left Column: Image & Health Summary */}
                  <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <img src={imagePreview} alt="Crop Scan" style={{ width: '100%', display: 'block' }} />
                    </div>
                    
                    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                      <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', color: '#1f2937' }}>{t('AI Diagnosis')}</h3>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>{result.diagnosis?.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '15px' }}>{t('Confidence')}: {result.diagnosis?.confidence}%</div>
                      
                      {result.symptoms && result.symptoms.length > 0 && (
                        <>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', marginBottom: '5px' }}>{t('Symptoms')}:</div>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', fontSize: '0.9rem' }}>
                            {result.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  
                  {/* Ask a Doubt Chat */}
                  <DoubtChat
                  scanId={result.scanId}
                  context={{ 
                    crop: result.crop?.type, 
                    diagnosis: result.diagnosis?.name, 
                    symptoms: result.symptoms,
                    recommendations: result.recommendations
                  }} 
                />
              </div>
              
              {/* Right Column: Intelligence Breakdown */}
              <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <RiskScore score={result.risk?.score} level={result.risk?.level} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <RiskFactorBreakdown breakdown={result.factorBreakdown} />
                  </div>
                </div>
                
                <RiskDrivers explanation={result.explanation} />
                
                {/* Recommendations moved to right side */}
                <RecommendationList recommendations={result.recommendations} />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-primary" onClick={resetForm}>{t('Analyze Another Crop')}</button>
              {!result.isOffline && (
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowShareModal(true)}>
                  <Users size={18} /> {t('Share to Community')}
                </button>
              )}
            </div>
            </>
            )}
          </div>
        )}

        {showShareModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
              <button onClick={() => setShowShareModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={24} />
              </button>
              <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={24} color="var(--primary-color)" />
                Ask the Community
              </h3>
              <p style={{ color: '#4b5563', marginBottom: '20px' }}>
                Share this AI diagnosis with the community to get human verification, treatment advice, or hear similar experiences.
              </p>
              
              <div style={{ display: 'flex', gap: '15px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
                <img src={imagePreview} alt="Scan" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: '#1f2937' }}>{result.crop?.type}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{result.diagnosis?.name}</span>
                </div>
              </div>

              <textarea 
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="E.g., The AI detected early blight on my tomatoes. What fungicides are working best in this region right now?"
                style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '20px', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setShowShareModal(false)} disabled={isSharing}>Cancel</button>
                <button className="btn btn-primary" onClick={handleShareSubmit} disabled={!shareText.trim() || isSharing}>
                  {isSharing ? 'Sharing...' : 'Post to Forum'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
