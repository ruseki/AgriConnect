import React from 'react';
import { Link } from 'react-router-dom';

const Settings = () => {
  return (
    <div className="settings-page flex flex-col h-screen bg-gray-900 text-white">
      <nav className="flex justify-between items-center p-4 bg-gray-800">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold mr-4">AgriConnect</Link>
          <div className="flex items-center bg-gray-700 p-2 rounded">
            <input 
              type="text" 
              placeholder="Search in AgriConnect..." 
              className="bg-transparent text-white outline-none px-2" 
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-white">Home</Link>
          <Link to="/buying" className="text-white">Buying</Link>
          <Link to="/selling" className="text-white">Selling</Link>
          <Link to="/chats" className="text-white">Chats</Link>
          <button className="text-white"><i className="fas fa-shopping-cart"></i></button>
          <button className="text-white"><i className="fas fa-bell"></i></button>
          <button className="text-white"><i className="fas fa-bars"></i></button>
        </div>
      </nav>
      <div className="flex flex-grow">
        <aside className="w-1/4 p-4 bg-gray-800">
          <h2 className="text-lg font-bold mb-4">Settings</h2>
          <ul className="space-y-2">
            <li><Link to="#personal-details" className="text-white">Personal Details</Link></li>
            <li><Link to="#password-security" className="text-white">Password and Security</Link></li>
            <li>
              <button className="text-white">Verify Email</button>
            </li>
            <li><Link to="#accessibility" className="text-white">Accessibility</Link></li>
            <li>
              <label className="flex items-center text-white">
                Dark Theme
                <input type="checkbox" className="ml-2" />
              </label>
            </li>
            <li><Link to="#change-language" className="text-white">Change Language</Link></li>
            <li><Link to="#privacy" className="text-white">Privacy</Link></li>
            <li>
              <label className="flex items-center text-white">
                Show Seller Government Documents
                <input type="checkbox" className="ml-2" />
              </label>
            </li>
            <li><Link to="#activity-log" className="text-white">Activity Log</Link></li>
          </ul>
        </aside>
        <main className="flex-grow p-4 bg-gray-700 flex flex-col items-center">
          <div className="flex items-center bg-gray-800 p-2 rounded mb-4 w-full">
            <i className="fas fa-search mr-2"></i>
            <input 
              type="text" 
              placeholder="Search the settings" 
              className="bg-transparent text-white outline-none w-full" 
            />
          </div>
          <h3 className="text-lg font-bold mb-4">Most Used Settings</h3>
          <div className="flex flex-col gap-4 w-full">
            <button className="bg-gray-900 p-4 rounded flex items-center justify-center text-white">
              <i className="fas fa-key mr-2"></i>
              Change Password
            </button>
            <button className="bg-gray-900 p-4 rounded flex items-center justify-center text-white">
              <i className="fas fa-moon mr-2"></i>
              Dark Mode
            </button>
            <button className="bg-gray-900 p-4 rounded flex items-center justify-center text-white">
              <i className="fas fa-info-circle mr-2"></i>
              About
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
