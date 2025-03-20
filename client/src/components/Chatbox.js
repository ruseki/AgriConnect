// components/Chatbox.js

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react'; 
import './css/Chatbox.css';

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [conversations, setConversations] = useState([
    { id: 1, name: 'Seller John', messages: ['Hello, how can I help you?'] },
    { id: 2, name: 'Buyer Mary', messages: ['I’m interested in your product.'] },
  ]); // example lamang

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(conversations.find((conv) => conv.id === userId));
  };

  return (
    <div className="chatbox-container">
      <div className="chat-icon" onClick={toggleChatbox}>
        <MessageCircle size={24} className="icon-message" />
      </div>

      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <h4>Chat</h4>
            <X size={20} className="icon-close" onClick={toggleChatbox} />
          </div>
          <div className="chatbox-body">
            <div className="chatbox-left">
              <h5 className="chatbox-left-header">Chats</h5>
              <ul className="user-list">
                {conversations.length === 0 ? (
                  <p className="empty-chat">You haven't messaged anyone yet.</p>
                ) : (
                  conversations.map((conv) => (
                    <li
                      key={conv.id}
                      onClick={() => handleUserSelect(conv.id)}
                      className={`user-item ${
                        selectedUser?.id === conv.id ? 'active' : ''
                      }`}
                    >
                      {conv.name}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="chatbox-right">
              {selectedUser ? (
                <>
                  <h5 className="chatbox-right-header">{selectedUser.name}</h5>
                  <div className="messages">
                    {selectedUser.messages.map((message, index) => (
                      <p key={index} className="message-bubble">
                        {message}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p className="select-user-placeholder">Select a chat to view messages.</p>
              )}
            </div>
          </div>
          <div className="chatbox-footer">
            <input
              type="text"
              placeholder="Type a message..."
              className="message-input"
              disabled={!selectedUser}
            />
            <button className="send-button" disabled={!selectedUser}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
