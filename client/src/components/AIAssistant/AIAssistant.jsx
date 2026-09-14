import React, { useState, useEffect } from 'react';
import { Bot, Minimize2, Plus, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './AIAssistant.css';
import ChatWindow from './ChatWindow';
import ChatHistory from './ChatHistory';
import { getChats, getChatById, sendChatMessage, getWeather, getScans } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AIAssistant() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState('new');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherContext, setWeatherContext] = useState(null);
  const [riskContext, setRiskContext] = useState(null);

  // Initialize welcome message
  const welcomeMessage = { 
    role: 'assistant', 
    content: t("Hi! 👋 I'm AgriVision AI.\nI can help you with crops, diseases, weather, farming practices, and image analysis.") 
  };

  useEffect(() => {
    if (activeChatId === 'new') {
      setMessages([welcomeMessage]);
    } else {
      fetchChatMessages(activeChatId);
    }
  }, [activeChatId, t]);

  useEffect(() => {
    if (isOpen) {
      fetchChatList();
      if (!weatherContext) {
        fetchBackgroundWeather();
      }
      if (!riskContext) {
        fetchBackgroundRisk();
      }
    }
  }, [isOpen]);

  async function fetchBackgroundRisk() {
    try {
      const response = await getScans();
      if (response.success && response.scans && response.scans.length > 0) {
        setRiskContext(response.scans[0]); // pass latest scan as risk context
      }
    } catch (e) {
      console.warn('Could not fetch risk context for AI assistant');
    }
  };

  async function fetchBackgroundWeather() {
    try {
      // It uses the backend's logic to fetch weather based on user profile city/state
      const data = await getWeather();
      if (data.success && data.weatherData) {
        setWeatherContext(data.weatherData);
      }
    } catch (e) {
      console.warn('Could not fetch weather context for AI assistant');
    }
  };

  async function fetchChatList() {
    try {
      const data = await getChats();
      if (data.success) {
        setChatList(data.chats);
      }
    } catch (error) {
      console.error('Failed to fetch chat list');
    }
  };

  const fetchChatMessages = async (id) => {
    setLoading(true);
    try {
      const data = await getChatById(id);
      if (data.success && data.chat) {
        setMessages(data.chat.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat messages');
      setMessages([{ role: 'assistant', content: t('Failed to load this conversation.') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text, imageFile) => {
    setLoading(true);

    // Optimistic UI update
    const userMsgObj = { 
      role: 'user', 
      content: text, 
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : null 
    };
    setMessages(prev => [...prev, userMsgObj]);

    try {
      const formData = new FormData();
      if (text) formData.append('message', text);
      if (imageFile) formData.append('image', imageFile);
      if (activeChatId !== 'new') formData.append('chatId', activeChatId);
      
      if (weatherContext) {
        formData.append('weatherContext', JSON.stringify(weatherContext));
      }
      if (riskContext) {
        formData.append('riskContext', JSON.stringify(riskContext));
      }

      const response = await sendChatMessage(formData);

      if (response.success && response.chat) {
        // Replace optimistic messages with actual DB messages
        setMessages(response.chat.messages);
        
        // If this was a new chat, update activeChatId and refresh history
        if (activeChatId === 'new') {
          setActiveChatId(response.chat._id);
          fetchChatList();
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('Network error. Please try again.') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId('new');
    setShowHistory(false);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setShowHistory(false);
  };

  if (!currentUser) return null;

  return (
    <div className="ai-assistant-container">
      {/* Floating Button */}
      <button 
        className={`ai-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(true)}
        title={t('Open AgriVision AI')}
      >
        <Bot size={28} />
      </button>

      {/* Main Chat Window */}
      <div className={`ai-window ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-info">
            <div className="ai-header-icon">
              <Bot size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>AgriVision AI</h3>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{t('Your Smart Farming Assistant')}</div>
            </div>
          </div>
          <div className="ai-header-actions">
            <button onClick={() => setShowHistory(!showHistory)} className="ai-header-btn" title={t('History')}>
              <Clock size={18} />
            </button>
            <button onClick={handleNewChat} className="ai-header-btn" title={t('New Chat')}>
              <Plus size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="ai-header-btn" title={t('Minimize')}>
              <Minimize2 size={18} />
            </button>
          </div>
        </div>

        {/* Content Area (Relative for absolute positioned history panel) */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <ChatWindow 
            messages={messages} 
            loading={loading} 
            onSendMessage={handleSendMessage} 
          />

          <ChatHistory 
            isOpen={showHistory} 
            chats={chatList}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onClose={() => setShowHistory(false)}
          />

        </div>
      </div>
    </div>
  );
}
