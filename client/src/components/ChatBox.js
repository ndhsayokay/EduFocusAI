import React, { useState, useEffect, useRef } from 'react';

const ChatBox = ({ messages, onSendMessage, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', height: '400px', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ padding: '0.5rem 1rem', margin: 0, borderBottom: '1px solid #ccc' }}>Trò chuyện</h4>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.map((msg, index) => {
          const isMyMessage = msg.user?.id === currentUserId;
          const isSystemMessage = msg.user?.id === 'system';

          if (isSystemMessage) {
            return (
              <div key={index} style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', marginBottom: '0.5rem' }}>
                {msg.text}
              </div>
            );
          }

          return (
            <div 
              key={index} 
              style={{ 
                marginBottom: '0.5rem', 
                textAlign: isMyMessage ? 'right' : 'left'
              }}
            >
              <div 
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '15px',
                  backgroundColor: isMyMessage ? '#007bff' : '#f1f0f0',
                  color: isMyMessage ? 'white' : 'black',
                }}
              >
                {/* Hiển thị "Bạn" hoặc email của người khác */}
                <strong>{isMyMessage ? 'Bạn' : msg.user?.email}: </strong>
                {msg.text}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '1rem', borderTop: '1px solid #ccc' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          style={{ flexGrow: 1, padding: '0.5rem', marginRight: '0.5rem' }}
        />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
};

export default ChatBox;