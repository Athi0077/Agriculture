import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { askWeatherAssistant } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const SUGGESTED_QUESTIONS = [
  "Is today good for spraying?",
  "Should I irrigate today?",
  "Will rain affect my crops?",
  "Is the temperature safe for crops?",
  "What farming activities are suitable today?"
];

export default function WeatherAssistant({ weatherData }) {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t("Hi! I can help you understand the current weather and how it may affect your farm.") }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim() || loading || !weatherData) return;

    const userMsg = text.trim();
    setInput('');
    setError('');
    
    // Add user message to UI
    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      // Pass only the previous messages to history (exclude the one we just added)
      const apiHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      const response = await askWeatherAssistant(userMsg, weatherData, apiHistory);
      
      if (response.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      } else {
        setError(t('Failed to get a response from the assistant.'));
      }
    } catch (err) {
      console.error(err);
      setError(t('Error connecting to the AI assistant.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      { role: 'assistant', content: t("Hi! I can help you understand the current weather and how it may affect your farm.") }
    ]);
    setError('');
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px', padding: 0, overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{t('AI Weather Assistant')}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('Ask anything about today\'s weather and your farming activities.')}</p>
          </div>
        </div>
        <button onClick={handleClear} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          {t('Clear chat')}
        </button>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#ffffff' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{ 
              backgroundColor: msg.role === 'user' ? '#e2e8f0' : 'rgba(76, 175, 80, 0.1)', 
              color: msg.role === 'user' ? '#475569' : 'var(--primary-color)',
              padding: '8px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div style={{ 
              backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : '#f1f5f9', 
              color: msg.role === 'user' ? 'white' : '#334155',
              padding: '12px 16px', 
              borderRadius: '12px',
              borderTopRightRadius: msg.role === 'user' ? '0' : '12px',
              borderTopLeftRadius: msg.role === 'assistant' ? '0' : '12px',
              maxWidth: '80%',
              lineHeight: '1.5',
              fontSize: '0.95rem',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: 'var(--primary-color)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} />
            </div>
            <div style={{ padding: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="spin" /> {t('Thinking...')}
            </div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.875rem', marginTop: '8px', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips */}
      {messages.length === 1 && !loading && (
        <div style={{ padding: '0 20px 10px', display: 'flex', flexWrap: 'wrap', gap: '8px', backgroundColor: '#ffffff' }}>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button 
              key={idx} 
              onClick={() => handleSend(q)}
              style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '16px', 
                padding: '6px 12px', 
                fontSize: '0.8rem',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.color = 'var(--primary-color)'; }}
              onMouseOut={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#475569'; }}
            >
              {t(q)}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
          style={{ display: 'flex', gap: '10px' }}
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('Ask a weather-related question...')}
            disabled={loading}
            style={{ 
              flex: 1, 
              padding: '12px 16px', 
              borderRadius: '24px', 
              border: '1px solid #cbd5e1', 
              outline: 'none',
              fontSize: '0.95rem'
            }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            style={{ 
              backgroundColor: input.trim() && !loading ? 'var(--primary-color)' : '#cbd5e1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '50%', 
              width: '46px', 
              height: '46px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              transition: 'background-color 0.2s'
            }}
          >
            <Send size={20} style={{ marginLeft: '2px' }} />
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
          {t('AI-generated advice based on current weather conditions.')}
        </div>
      </div>
      
    </div>
  );
}
