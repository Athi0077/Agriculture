import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SUGGESTED_PROMPTS = [
  { icon: '🌦️', text: 'Weather Advice' },
  { icon: '🌱', text: 'Crop Advice' },
  { icon: '🦠', text: 'Disease Help' },
  { icon: '💧', text: 'Irrigation Advice' },
];

export default function ChatWindow({ messages, loading, onSendMessage }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    onSendMessage(input, selectedImage);
    setInput('');
    removeImage();
  };

  const handleQuickPrompt = (prompt) => {
    onSendMessage(prompt.text, null);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Messages Area */}
      <div className="ai-chat-area">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
            <Bot size={48} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
            <p style={{ margin: 0 }}>{t('Start a conversation below!')}</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            <div style={{
              backgroundColor: msg.role === 'user' ? '#e2e8f0' : 'rgba(76, 175, 80, 0.1)',
              color: msg.role === 'user' ? '#475569' : 'var(--primary-color)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: '32px',
              height: '32px'
            }}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Display text content if present */}
              {msg.content && msg.content !== 'Analysis complete.' && (
                <div className="ai-bubble">
                  {msg.content}
                </div>
              )}
              
              {/* Display uploaded image if present (backend should resolve path if needed) */}
              {msg.imageUrl && (
                <img 
                  src={msg.imageUrl.startsWith('blob:') || msg.imageUrl.startsWith('data:') ? msg.imageUrl : `/${msg.imageUrl}`} 
                  alt="Uploaded" 
                  className="ai-message-img" 
                />
              )}

              {/* Display Structured AI Image Analysis if present */}
              {msg.messageType === 'image-analysis' && msg.analysisResult && (
                <div className="ai-analysis-card">
                  <div className="ai-analysis-header">
                    🔬 {t('Crop Analysis')}
                  </div>
                  <div className="ai-analysis-body">
                    <div className="ai-analysis-item">
                      <div className="ai-analysis-label">{t('Possible Issue')}</div>
                      <div className="ai-analysis-value" style={{ fontWeight: 600 }}>{msg.analysisResult.diagnosis}</div>
                    </div>
                    <div className="ai-analysis-item">
                      <div className="ai-analysis-label">{t('Confidence')}</div>
                      <div className="ai-analysis-value">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${msg.analysisResult.confidence}%`, height: '100%', background: 'var(--primary-color)' }}></div>
                          </div>
                          <span>{msg.analysisResult.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    {msg.analysisResult.symptoms && msg.analysisResult.symptoms.length > 0 && (
                      <div className="ai-analysis-item">
                        <div className="ai-analysis-label">{t('Symptoms')}</div>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.9rem', color: '#334155' }}>
                          {msg.analysisResult.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {msg.analysisResult.recommendations && msg.analysisResult.recommendations.length > 0 && (
                      <div className="ai-analysis-item">
                        <div className="ai-analysis-label">{t('Recommended Actions')}</div>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.9rem', color: '#334155' }}>
                          {msg.analysisResult.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-message assistant">
            <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: 'var(--primary-color)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '32px', height: '32px' }}>
              <Bot size={16} />
            </div>
            <div style={{ padding: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="spin" /> {t('AgriVision AI is thinking...')}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length === 1 && !loading && (
        <div style={{ padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px', backgroundColor: '#f8fafc' }}>
          {SUGGESTED_PROMPTS.map((p, idx) => (
            <button 
              key={idx}
              onClick={() => handleQuickPrompt(p)}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
            >
              <span>{p.icon}</span> {t(p.text)}
            </button>
          ))}
        </div>
      )}

      {/* Image Preview */}
      {imagePreviewUrl && (
        <div className="ai-image-preview">
          <img src={imagePreviewUrl} alt="Preview" />
          <button type="button" className="ai-remove-image" onClick={removeImage}>
            <X size={12} />
          </button>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedImage.name}</span>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="ai-input-area">
        <input 
          type="file" 
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageSelect}
          disabled={loading}
        />
        <button 
          type="button" 
          className="ai-upload-btn" 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title={t('Upload crop image')}
        >
          <ImageIcon size={20} />
        </button>
        
        <div className="ai-input-wrapper">
          <input 
            type="text" 
            className="ai-input"
            placeholder={t('Ask anything...')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="ai-send-btn"
          disabled={loading || (!input.trim() && !selectedImage)}
        >
          <Send size={18} style={{ marginLeft: '2px' }} />
        </button>
      </form>
    </div>
  );
}
