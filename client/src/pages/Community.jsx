import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getPosts, addComment } from '../services/api';
import { Users, MessageSquare, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentingId, setCommentingId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const data = await addComment(postId, { content: commentText });
      if (data.success) {
        setPosts(posts.map(p => p._id === postId ? data.post : p));
        setCommentText('');
        setCommentingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <Navbar title="Community Forum" subtitle="Connect with farmers and experts to discuss crop health." />
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div className="card"><p>Loading posts...</p></div>
        ) : posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Posts Yet</h3>
            <p className="text-muted">Share your crop scans from the Disease Detection page to start a discussion!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {posts.map((post) => (
              <div key={post._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {post.author.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {post.author.name}
                          {post.author.role === 'expert' && <BadgeCheck size={16} color="#3b82f6" title="Verified Expert" />}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(post.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-dark)' }}>{post.content}</p>
                  
                  {post.scanId && (
                    <div style={{ display: 'flex', gap: '15px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      {/* Check if imageUrl is absolute, if not prepend API URL */}
                      <img src={post.scanId.imageUrl.startsWith('http') ? post.scanId.imageUrl : `http://localhost:5000/${post.scanId.imageUrl}`} alt="Scan" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '1.1rem', color: '#1f2937' }}>{post.scanId.cropType}</strong>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>AI Diagnosis: </span>
                        <span style={{ fontWeight: 600, color: post.scanId.riskLevel === 'Critical' ? '#ef4444' : post.scanId.riskLevel === 'High' ? '#f97316' : '#22c55e' }}>
                          {post.scanId.diagnosis} ({post.scanId.riskLevel})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '15px 20px', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontWeight: 600, color: '#4b5563' }}>
                    <MessageSquare size={18} /> {post.comments.length} Comments
                  </div>
                  
                  {post.comments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
                      {post.comments.map((comment) => (
                        <div key={comment._id} style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e7eb', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0 }}>
                            {comment.user.name.charAt(0)}
                          </div>
                          <div style={{ backgroundColor: 'white', padding: '10px 15px', borderRadius: '0 12px 12px 12px', border: '1px solid #e5e7eb', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '0.9rem' }}>{comment.user.name}</strong>
                              {comment.user.role === 'expert' && <BadgeCheck size={14} color="#3b82f6" title="Verified Expert" />}
                              <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' }}>{formatDate(comment.createdAt)}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {commentingId === post._id ? (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <input 
                        type="text" 
                        value={commentText} 
                        onChange={(e) => setCommentText(e.target.value)} 
                        placeholder="Add a comment..."
                        className="form-control"
                        style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #d1d5db' }}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      />
                      <button className="btn btn-primary" style={{ borderRadius: '20px', padding: '0 20px' }} onClick={() => handleAddComment(post._id)}>Post</button>
                      <button className="btn btn-outline" style={{ borderRadius: '20px', padding: '0 15px', border: 'none' }} onClick={() => setCommentingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setCommentingId(post._id); setCommentText(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Write a comment...
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
