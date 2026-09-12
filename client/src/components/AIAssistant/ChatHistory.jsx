import React from 'react';
import { Clock, Plus, X, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ChatHistory({ chats, onSelectChat, onNewChat, onClose, isOpen }) {
  const { t } = useTranslation();

  return (
    <div className={`ai-history-panel ${isOpen ? 'open' : ''}`}>
      <div className="ai-header" style={{ background: '#f8fafc', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> {t('Chat History')}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onNewChat} className="ai-header-btn" style={{ color: 'var(--primary-color)' }} title={t('New Chat')}>
            <Plus size={20} />
          </button>
          <button onClick={onClose} className="ai-header-btn" style={{ color: '#64748b' }} title={t('Close')}>
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="ai-history-list">
        {chats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <p>{t('No previous conversations found.')}</p>
          </div>
        ) : (
          chats.map(chat => (
            <div key={chat._id} className="ai-history-item" onClick={() => onSelectChat(chat._id)}>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {chat.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {new Date(chat.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
