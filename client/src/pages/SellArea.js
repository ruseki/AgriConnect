// SellArea.js

import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { Tag, Package, MapPin, Info, Edit2, Truck } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import './css/SellArea.css';

const SellArea = () => {
  const { isAuthenticated, token, userId } = useAuth();
  const [openSellModal, setOpenSellModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('sack');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [color, setColor] = useState('white');
  const [minimumOrder, setMinimumOrder] = useState('');
  const [productsSold, setProductsSold] = useState(0);
  const [listings, setListings] = useState([]);
  const [editingListing, setEditingListing] = useState(null);

  const locations = [
    'San Antonio Norte, Lupao City, Pangasinan',
    'San Antonio Este, Lupao City, Pangasinan',
    'San Antonio Weste, Lupao City, Pangasinan',
    'San Antonio South, Lupao City, Pangasinan',
    'Poblacion, Urdaneta City, Pangasinan',
  ];

  const categories = {
    'Cereal Crops': ['Wheat', 'Rice', 'Corn', 'Barley', 'Oats', 'Millet'],
    'Vegetables': ['Tomatoes', 'Carrots', 'Lettuce', 'Spinach', 'Broccoli', 'Potatoes'],
    'Fruits': ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Mangoes', 'Strawberries'],
    'Legumes': ['Beans', 'Peas', 'Lentils', 'Soybeans'],
    'Root Crops': ['Potatoes', 'Carrots', 'Beets', 'Sweet Potatoes'],
    'Tuber Crops': ['Potatoes', 'Yams'],
    'Oilseeds': ['Sunflower', 'Soybean', 'Canola', 'Peanut'],
    'Fiber Crops': ['Cotton', 'Hemp', 'Flax'],
    'Spices': ['Black Pepper', 'Ginger', 'Turmeric', 'Chili'],
    'Forage Crops': ['Alfalfa', 'Clover', 'Ryegrass'],
    'Medicinal Crops': ['Aloe Vera', 'Ginseng', 'Lavender'],
    'Timber/Forestry Crops': ['Pine', 'Oak', 'Eucalyptus', 'Bamboo'],
    'Cover Crops': ['Clover', 'Rye', 'Vetch'],
    'Cash Crops': ['Coffee', 'Tea', 'Sugarcane', 'Tobacco'],
    'Horticultural Crops': ['Fruits', 'Vegetables', 'Flowers'],
    'Seed Crops': ['Sunflower Seeds', 'Canola Seeds', 'Vegetable Seeds'],
  };

  const fetchListings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/listings/user-listings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setListings(result.listings); 
      } else {
        console.error('Failed to fetch listings:', result);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchListings();
    }
  }, [token]);

  const handleOpenSellModal = () => setOpenSellModal(true);
  const handleCloseSellModal = () => setOpenSellModal(false);

  const handlePublish = async () => {
    if (!token || !userId) {
      alert('Token or User ID is missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName,
          quantity,
          unit,
          category,
          condition,
          details,
          location,
          price,
          color,
          minimumOrder,
          productsSold,
          userId,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('Failed Response:', result);
        throw new Error(result.message || 'Failed to create listing');
      }

      alert('Listing published!');
      handleCloseSellModal();
      fetchListings(); 
    } catch (error) {
      console.error('Error creating listing:', error);
      alert(`Failed to create listing: ${error.message}`);
    }
  };

  const handleMarkAsSold = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/listings/mark-as-sold/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        alert('Product sold out');
        fetchListings();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error marking listing as sold:', error);
      alert('Failed to mark listing as sold');
    }
  };

  const handleEditSubmit = async () => {
    if (!token || !userId || !editingListing) {
      alert('Token or User ID is missing, or no listing selected for editing.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/listings/${editingListing._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName,
          quantity,
          unit,
          category,
          condition,
          details,
          location,
          price,
          color,
          minimumOrder,
          productsSold,
          userId,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('Failed Response:', result);
        throw new Error(result.message || 'Failed to update listing');
      }

      alert('Listing updated successfully!');
      handleCloseSellModal();
      fetchListings(); 
    } catch (error) {
      console.error('Error updating listing:', error);
      alert(`Failed to update listing: ${error.message}`);
    }
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setProductName(listing.productName);
    setQuantity(listing.quantity);
    setUnit(listing.unit);
    setCategory(listing.category);
    setCondition(listing.condition);
    setDetails(listing.details);
    setLocation(listing.location);
    setPrice(listing.price);
    setColor(listing.color);
    setMinimumOrder(listing.minimumOrder);
    setProductsSold(listing.productsSold);
    setOpenSellModal(true);
  };

  return (
    <>
      <TopNavbar />
      <main className="main">
        <SideBar />
        <div className="main-content">
          <button className="start-selling-btn" onClick={handleOpenSellModal}>
            Start Selling!
          </button>

          <div className="listings-container">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <div
                  key={listing._id}
                  className="listing-card"
                  style={{
                    backgroundColor: listing.color,
                  }}
                >
                  <h3>Product ID: {listing._id}</h3>
                  <h3>Product: {listing.productName}</h3>
                  <p>Category: {listing.category}</p>
                  <p>Price: ₱{listing.price}</p>
                  <p>Details: {listing.details}</p>
                  <p>Status: {listing.status}</p>
                  <p>Stocks Availability: {listing.quantity} {listing.unit}</p>
                  {listing.status === 'available' && (
                    <button onClick={() => handleMarkAsSold(listing._id)} className="mark-as-sold-btn">
                      Mark as Sold
                    </button>
                  )}
                  <button onClick={() => handleEdit(listing)} className="edit-btn">
                    <Edit2 className="icon" />
                  </button>
                </div>
              ))
            ) : (
              <p>You have no listings yet.</p>
            )}
          </div>

          {openSellModal && (
            <div className="modal">
              <div className="modal-overlay" onClick={handleCloseSellModal}></div>
              <div className="modal-content">
                <h2 className="modal-title">
                  {editingListing ? 'Edit Listing' : 'Create a New Listing'}
                </h2>
                <div className="input-group">
                  <Tag className="icon" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="Cereal Crops">Cereal Crops</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Legumes">Legumes</option>
                    <option value="Root Crops">Root Crops</option>
                    <option value="Tuber Crops">Tuber Crops</option>
                    <option value="Oilseeds">Oilseeds</option>
                    <option value="Fiber Crops">Fiber Crops</option>
                    <option value="Spices">Spices</option>
                    <option value="Forage Crops">Forage Crops</option>
                    <option value="Medicinal Crops">Medicinal Crops</option>
                    <option value="Timber/Forestry Crops">Timber/Forestry Crops</option>
                    <option value="Cover Crops">Cover Crops</option>
                    <option value="Cash Crops">Cash Crops</option>
                    <option value="Horticultural Crops">Horticultural Crops</option>
                    <option value="Seed Crops">Seed Crops</option>
                  </select>
                </div>
                <div className="input-group">
                  <Package className="icon" />
                  <select
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="input-field"
                  >
                    {categories[category] && categories[category].map((product) => (
                      <option key={product} value={product}>{product}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Stocks"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input-field"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="input-select"
                  >
                    <option value="sack">Sack</option>
                    <option value="kilograms">Kilograms</option>
                    <option value="cavan">Cavan</option>
                  </select>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Minimum Order"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <textarea
                    placeholder="Details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="input-field h-24"
                  />
                </div>
                <div className="input-group">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                  >
                    {locations.map((locationOption, index) => (
                      <option key={index} value={locationOption}>
                        {locationOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="input-select"
                  >
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="yellow">Yellow</option>
                    <option value="orange">Orange</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                  </select>
                </div>
                <button
                  className="publish-btn"
                  onClick={editingListing ? handleEditSubmit : handlePublish}
                >
                  <Truck className="mr-2" />
                  {editingListing ? 'Publish Edit' : 'Publish'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SellArea;
