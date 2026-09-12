import React, { useState, useEffect } from 'react';
import { askDoubt } from '../../services/api';

const DoubtChat = ({ scanId, context, initialHistory = [] }) => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState(initialHistory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChatHistory(initialHistory);
  }, [initialHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await askDoubt({
        scanId,
        question: userMessage.content,
        scanContext: context
      });
      
      if (response.success) {
        setChatHistory(prev => [...prev, { role: 'ai', content: response.answer }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Server error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '5px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', color: '#1f2937' }}>Ask a Doubt</h3>
      <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: 0 }}>Have a question about this diagnosis or recommendation? Ask our AI!</p>
      
      <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
        {chatHistory.map((msg, idx) => (
          <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#4CAF50' : '#f3f4f6', color: msg.role === 'user' ? '#fff' : '#1f2937', padding: '10px 15px', borderRadius: '12px', maxWidth: '85%', fontSize: '0.9rem', border: msg.role === 'ai' ? '1px solid #e5e7eb' : 'none' }}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', background: '#f3f4f6', color: '#6b7280', padding: '10px 15px', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid #e5e7eb' }}>
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <input 
          type="text" 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)} 
          placeholder="e.g. Can I use neem oil?" 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#ffffff', color: '#1f2937' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !question.trim()} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#4CAF50', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          Ask
        </button>
      </form>
    </div>
  );
};

export default DoubtChat;
