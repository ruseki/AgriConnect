import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCircle, X, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './css/Chatbox.css';

const socket = io('http://localhost:5000');

const Chatbox = ({ senderId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [activeRecipientId, setActiveRecipientId] = useState(null);
  const [activeRecipientName, setActiveRecipientName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const toggleChatbox = () => {
    setIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5000/api/messages/${senderId}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setRecipients(response.data);
        } else {
          console.error('Failed to fetch conversations:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error.message);
      }
    };

    fetchConversations();
  }, [senderId, isOpen]);

  useEffect(() => {
    if (!activeRecipientId || !senderId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5000/api/messages/${senderId}/${activeRecipientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setMessages(response.data);
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.error('Failed to fetch messages:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching messages:', error.message);
      }
    };

    fetchMessages();
    socket.emit('joinRoom', { senderId, recipientId: activeRecipientId });

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      socket.off('receiveMessage');
      if (!isOpen) socket.disconnect();
    };
  }, [senderId, activeRecipientId, isOpen]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5000/api/users/search/${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setSearchResults(response.data);
      } else {
        console.error('Failed to search users:', response.data.message);
      }
    } catch (error) {
      console.error('Error searching users:', error.message);
    }
  };

  const handleSelectUser = (userId, userName) => {
    setActiveRecipientId(userId);
    setActiveRecipientName(userName);
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-icon" onClick={toggleChatbox}>
        <MessageCircle size={24} color="white" />
      </div>

      <div className={`chatbox ${isOpen ? 'open' : ''}`}>
        <div className="chatbox-sidebar">
          <div className="chatbox-search">
            <Search size={18} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
          </div>
          <ul>
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <li key={user._id} onClick={() => handleSelectUser(user._id, `${user.first_name} ${user.last_name}`)}>
                  <UserCircle size={20} />
                  {`${user.first_name} ${user.last_name}`}
                </li>
              ))
            ) : (
              recipients.map((recipient) => (
                <li key={recipient.participantId} onClick={() => setActiveRecipientId(recipient.participantId)}>
                  <UserCircle size={20} />
                  {recipient.latestMessage.senderName || 'User'}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="chatbox-main">
          {activeRecipientId ? (
            <>
              <div className="chatbox-header">
                <UserCircle size={24} />
                <h4>Chat with {activeRecipientName}</h4>
                <X onClick={toggleChatbox} />
              </div>
              <div className="chatbox-body">
                {messages.map((msg, index) => (
                  <div key={index} className={msg.senderId === senderId ? 'outgoing' : 'incoming'}>
                    {msg.content}
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>
            </>
          ) : (
            <p>Select a conversation or search for a user</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbox;