import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { io } from 'socket.io-client';
import './css/Chatbox.css';
import axios from 'axios';

const socket = io('http://localhost:5000');

const Chatbox = ({ senderId, recipientId, recipientName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!recipientId || !senderId) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/${senderId}/${recipientId}`,
          {
            headers: { Authorization: `Bearer YOUR_TOKEN` },
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

    fetchMessages();
    socket.emit('joinRoom', { senderId, recipientId });

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => socket.disconnect();
  }, [senderId, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      senderId,
      recipientId,
      content: newMessage,
      timestamp: new Date(),
    };

    try {
      const response = await axios.post('http://localhost:5000/api/messages', messageData, {
        headers: { Authorization: `Bearer YOUR_TOKEN` },
      });

      if (response.status === 201) {
        socket.emit('sendMessage', messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage('');
      } else {
        console.error('Failed to send message:', response.data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox">
        <div className="chatbox-header">
          <h4>Chat with {recipientName || 'User'}</h4>
          <X size={20} className="chatbox-icon-close" onClick={onClose} />
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
    </div>
  );
};

export default Chatbox;