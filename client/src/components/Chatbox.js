import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import './css/Chatbox.css';
import axios from 'axios';

const socket = io('http://localhost:5000');

const Chatbox = ({ senderId, recipientId, recipientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!recipientId || !senderId) return;

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `http://localhost:5000/api/messages/${senderId}/${recipientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          setMessages(response.data);
        } else {
          console.error('Failed to fetch messages:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching messages:', error.message);
      }
    };

    if (isOpen) {
      fetchMessages();
      socket.emit('joinRoom', { senderId, recipientId });
    }

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
      if (isOpen) {
        socket.disconnect();
      }
    };
  }, [senderId, recipientId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
  
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not authorized. Please log in again.');
      window.location.href = '/';
      return;
    }
  
    const messageData = {
      senderId,
      recipientId,
      content: newMessage,
      timestamp: new Date(),
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/messages', messageData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 201) {
        socket.emit('sendMessage', messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage('');
      } else {
        console.error('Failed to send message:', response.data.message);
        alert('Failed to send message.');
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
      alert('Failed to send message. Please try again.');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbox-container">
      {isOpen ? (
        <div className="chatbox">
          <div className="chatbox-header">
            <h4>Chat with {recipientName || 'User'}</h4>
            <X size={20} className="chatbox-icon-close" onClick={toggleChat} />
          </div>
          <div className="chatbox-body">
            <div className="chatbox-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chatbox-message-bubble ${
                    message.senderId === senderId ? 'outgoing' : 'incoming'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
          </div>
          <div className="chatbox-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="chatbox-message-input"
            />
            <button
              className="chatbox-send-button"
              onClick={handleSendMessage}
              disabled={newMessage.trim() === ''}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="chatbox-icon" onClick={toggleChat}>
          <MessageCircle size={24} color="white" />
        </div>
      )}
    </div>
  );
};

export default Chatbox;