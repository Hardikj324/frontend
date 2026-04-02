import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiImage, FiMapPin, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useWeatherStore } from '../store/weatherStore';
import { getChatHistory, uploadChatMedia } from '../services/chatAPI';
import LocationAutocomplete from '../components/Search/LocationAutocomplete';

export default function ChatDashboard() {
  const { user, token } = useAuthStore();
  
  // Lock the room to the user's currently selected search location!
  const selectedLocation = useWeatherStore(s => s.selectedLocation);
  const weather = useWeatherStore(s => s.weather);
  
  // Calculate initial state intelligently in case of a hard page-reload
  const initialCity = selectedLocation?.name 
                   || (weather?.timezone?.split('/')[1]?.replace('_', ' ')) 
                   || 'Global Room';

  const [roomName, setRoomName] = useState(initialCity); 
  
  useEffect(() => {
    if (selectedLocation?.name) {
      setRoomName(selectedLocation.name);
      if (selectedLocation.timezone) setRoomTimezone(selectedLocation.timezone);
    } else if (weather?.timezone) {
      const parts = weather.timezone.split('/');
      if (parts.length > 1) {
        setRoomName(parts[1].replace('_', ' '));
      }
      setRoomTimezone(weather.timezone);
    } else {
      setRoomName('Global Room');
      setRoomTimezone(null);
    }
  }, [selectedLocation, weather]);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomTimezone, setRoomTimezone] = useState(
    selectedLocation?.timezone || weather?.timezone || null
  );

  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle WebSocket Connection & History
  useEffect(() => {
    if (!token || !roomName) return;

    let socket = null;
    let isMounted = true;
    
    const setupChat = async () => {
      try {
        const data = await getChatHistory(roomName);
        if (!isMounted) return;
        setMessages(data.messages || []);
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
        const wsUrl = `${protocol}//${host}/api/chat/ws/${encodeURIComponent(roomName)}?token=${token}`;
        
        socket = new WebSocket(wsUrl);
        
        socket.onopen = () => { if (isMounted) setIsConnected(true); };
        
        socket.onmessage = (event) => {
          if (!isMounted) return;
          const newMsg = JSON.parse(event.data);
          
          setMessages(prev => {
            // Strict Mode protection: check if this exact message ID is already in state
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        };
        
        socket.onclose = () => { if (isMounted) setIsConnected(false); };
        ws.current = socket;

      } catch (err) {
        console.error("Failed to load history", err);
        if (isMounted) toast.error("Failed to load chat history");
      }
    };

    setupChat();

    return () => {
      isMounted = false;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [roomName, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !isConnected) return;

    let mediaUrl = null;

    // Handle File Upload first (REST)
    if (selectedFile) {
      setIsUploading(true);
      try {
        mediaUrl = await uploadChatMedia(selectedFile);
        
        // Since we are running backend locally on 8000, 
        // we might need to prepend the backend host to the URL if not proxied
        if (window.location.hostname === 'localhost' && mediaUrl.startsWith('/uploads')) {
            mediaUrl = `http://localhost:8000${mediaUrl}`;
        }

      } catch (err) {
        toast.error(err.message || 'Failed to upload photo');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
      setSelectedFile(null);
    }

    // Send Message via WebSocket
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        content: inputText.trim() || null,
        media_url: mediaUrl
      }));
      setInputText('');
    }
  };

  return (
    <motion.div className="page-content page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)', paddingBottom: '0' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiMapPin color="var(--accent)" /> Ground Reality
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Live updates vanish after 24 hours. Showing chat for <strong style={{ color: 'var(--accent)' }}>{roomName}</strong>.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ width: '280px' }}>
              <LocationAutocomplete 
                placeholder="Jump to a different city..."
                defaultName={roomName}
                onSelect={(loc) => { 
                  if (loc?.name) {
                    setRoomName(loc.name);
                    if (loc.timezone) setRoomTimezone(loc.timezone);
                  } 
                }} 
              />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--border-card)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isConnected ? 'var(--green)' : 'var(--red)', boxShadow: isConnected ? '0 0 10px var(--green)' : 'none' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, border: '1px solid var(--border-card)', background: 'var(--bg-card)' }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px' }}>It's quiet in {roomName}...</p>
              <p>Be the first to share the ground reality!</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.user_id === user?.id;
            
            // Format time and date
            const dateObj = new Date(msg.created_at);
            let timeStr = "";

            if (roomName === 'Global Room') {
              // Local time with GMT offset: hh:mm + 5:30 GMT
              const basicTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
              const offsetMinutes = -dateObj.getTimezoneOffset();
              const sign = offsetMinutes >= 0 ? '+' : '-';
              const h = Math.floor(Math.abs(offsetMinutes) / 60);
              const m = Math.abs(offsetMinutes) % 60;
              timeStr = `${basicTime} ${sign} ${h}:${m.toString().padStart(2, '0')} GMT`;
            } else {
              // Room city time: Date + Time in city timezone
              timeStr = dateObj.toLocaleString([], { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: roomTimezone || undefined
              });
            }

            return (
              <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                {!isMe && <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginLeft: '4px', marginBottom: '4px' }}>{msg.user_name}</span>}
                
                <div style={{ 
                  background: isMe ? 'var(--accent)' : 'var(--bg-input)', 
                  color: isMe ? '#fff' : 'var(--text-primary)',
                  padding: '12px 16px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: 'var(--shadow-sm)',
                  border: isMe ? 'none' : '1px solid var(--border-input)'
                }}>
                  {msg.media_url && (
                    <div style={{ marginBottom: msg.content ? '10px' : '0', borderRadius: '12px', overflow: 'hidden' }}>
                      {msg.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                        <video src={msg.media_url} controls style={{ maxWidth: '100%', maxHeight: '250px', background: '#000' }} />
                      ) : (
                        <img src={msg.media_url} alt="Shared memory" style={{ maxWidth: '100%', maxHeight: '250px', display: 'block' }} />
                      )}
                    </div>
                  )}
                  {msg.content && <p style={{ fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
                </div>

                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', marginLight: '4px', marginRight: '4px' }}>
                   {timeStr}
                </span>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-card)', background: 'var(--bg-header)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Image preview before sending */}
          {selectedFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--r-md)', alignSelf: 'flex-start' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '600' }}>{selectedFile.name}</span>
              <button type="button" onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <FiX size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*,video/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost" 
              style={{ padding: '12px', borderRadius: '50%' }}
              title="Upload Photo or Video"
            >
              <FiImage size={20} />
            </button>

            <input 
              type="text" 
              placeholder="What's happening outside right now?" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!isConnected || isUploading}
              style={{ 
                flex: 1, 
                background: 'var(--bg-input)', 
                border: '1px solid var(--border-input)', 
                color: 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: '99px',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />

            <button 
              type="submit" 
              disabled={!isConnected || (inputText.trim() === '' && !selectedFile) || isUploading}
              className="btn btn-primary" 
              style={{ padding: '12px', borderRadius: '50%' }}
            >
              {isUploading ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <FiSend size={20} />}
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
}
