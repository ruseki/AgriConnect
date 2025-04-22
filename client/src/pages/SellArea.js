// SellArea.js

import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { Tag, Package, Edit2, Truck } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import './css/SellArea.css';
import { useNavigate } from 'react-router-dom';

const SellArea = () => {
  const { isAuthenticated, token, userId } = useAuth();
  const navigate = useNavigate();
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
  const [sellerBalance, setSellerBalance] = useState(0);

  const locations = [
    'San Antonio Norte, Lupao City, Pangasinan',
    'San Antonio Este, Lupao City, Pangasinan',
    'San Antonio Weste, Lupao City, Pangasinan',
    'San Antonio South, Lupao City, Pangasinan',
    'Poblacion, Urdaneta City, Pangasinan',
  ];

  const categories = {
    'Cereal Crops': ['Barley', 'Black Rice', 'Brown Rice', 'Corn', 'Millet', 'Oats', 'Sorghum', 'Wheat', 'White Rice'],
    'Vegetables': ['Asparagus', 'Beets', 'Bell Peppers', 'Broccoli', 'Brussels Sprouts', 'Cabbage', 'Carrots', 'Cauliflower', 'Celery', 'Chard', 'Cucumber', 'Eggplant', 'Garlic', 'Green Beans', 'Kale', 'Leeks', 'Lettuce', 'Mushrooms', 'Okra', 'Onions', 'Parsnips', 'Peas', 'Potatoes', 'Pumpkin', 'Radishes', 'Spinach', 'Squash', 'Sweet Corn', 'Sweet Potatoes', 'Tomatoes', 'Turnips', 'Zucchini'],
    'Fruits': ['Apples', 'Avocado', 'Bananas', 'Blueberries', 'Cherries', 'Dragon Fruit', 'Grapes', 'Kiwi', 'Lemon', 'Lychee', 'Mangoes', 'Melon', 'Oranges', 'Papaya', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Raspberry', 'Strawberries', 'Watermelon'],
    'Legumes': ['Beans', 'Lentils', 'Peas', 'Soybeans'],
    'Root Crops': ['Beets', 'Carrots', 'Cassava', 'Ginger', 'Parsnips', 'Potatoes', 'Radishes', 'Sweet Potatoes', 'Turnips', 'Yams'],
    'Tuber Crops': ['Arrowroot', 'Cassava', 'Potatoes', 'Sweet Potatoes', 'Taro', 'Turnips', 'Yams'],
    'Oilseeds': ['Canola', 'Castor', 'Coconut', 'Cottonseed', 'Flaxseed', 'Groundnut', 'Linseed', 'Mustard', 'Palm Kernel', 'Peanut', 'Rapeseed', 'Sesame', 'Soybean', 'Sunflower'],
    'Fiber Crops': ['Cotton', 'Flax', 'Hemp'],
    'Spices': ['Black Pepper', 'Chili', 'Ginger', 'Turmeric'],
    'Forage Crops': ['Alfalfa', 'Clover', 'Ryegrass'],
    'Medicinal Crops': ['Aloe Vera', 'Ginseng', 'Lavender'],
    'Timber/Forestry Crops': ['Bamboo', 'Eucalyptus', 'Oak', 'Pine'],
    'Cover Crops': ['Clover', 'Rye', 'Vetch'],
    'Cash Crops': ['Coffee', 'Sugarcane', 'Tea', 'Tobacco'],
    'Horticultural Crops': ['Flowers', 'Fruits', 'Vegetables'],
    'Seed Crops': ['Canola Seeds', 'Sunflower Seeds', 'Vegetable Seeds'],
  };

  
  const payload = {
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
  };

  console.log('Payload Sent to Backend:', payload);

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

  useEffect(() => {
    const fetchSellerBalance = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (response.ok) {
          setSellerBalance(result.sellerBalance || 0);
        } else {
          console.error('Failed to fetch seller balance:', result.message);
        }
      } catch (error) {
        console.error('Error fetching seller balance:', error.message);
      }
    };

    if (token) fetchSellerBalance();
  }, [token]);

  const handleOpenSellModal = () => setOpenSellModal(true);
  const handleCloseSellModal = () => setOpenSellModal(false);

  const handleCheckOrders = () => {
    navigate('/seller-orders');
  };

  const handleWithdraw = () => {
    navigate('/withdraw');
  };

  const handlePublish = async () => {
    if (!token || !userId) {
      alert('Token or User ID is missing. Please log in again.');
      return;
    }
  
    if (!productName || !location) {
      alert('Product Name and Location are required.');
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
  
  const handleUnlist = async (listingIdentifier) => {
    try {
      console.log(`Attempting to unlist: /api/listings/${listingIdentifier}/unlist`);
  
      const response = await fetch(`http://localhost:5000/api/listings/${listingIdentifier}/unlist`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      console.log("Identifier Passed to Unlist:", listingIdentifier);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unlist the product");
      }
  
      const data = await response.json();
      console.log("Unlist Response Data:", data);
  
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.identifier === listingIdentifier ? { ...listing, status: false } : listing
        )
      );
    } catch (error) {
      console.error("Error unlisting the product:", error.message);
    }
  };
  
  const handleRelist = async (listingIdentifier) => {
    try {
      console.log(`Attempting to relist: /api/listings/${listingIdentifier}/relist`);
  
      const response = await fetch(`http://localhost:5000/api/listings/${listingIdentifier}/relist`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      console.log("Identifier Passed to Relist:", listingIdentifier);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to relist the product");
      }
  
      const data = await response.json();
      console.log("Relist Response Data:", data);
  
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.identifier === listingIdentifier ? { ...listing, status: true } : listing
        )
      );
    } catch (error) {
      console.error("Error relisting the product:", error.message);
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

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = (id) => {
    setShowConfirmation(true); 
  };
  
  const handleCancelDelete = () => {
    setShowConfirmation(false); 
  };
  
  const handleConfirmDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/listings/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
  
      const result = await response.json();
      if (!response.ok) {
        console.error('Failed to delete listing:', result.message);
        alert(result.message);
        return;
      }
  
      alert('Listing successfully deleted!');
      fetchListings(); 
      setShowConfirmation(false); 
    } catch (error) {
      console.error('Error deleting listing:', error.message); 
      alert('Failed to delete the listing.');
    }
  };

  return (
    <>
      <TopNavbar />
      <main className="sellarea-main">
        <SideBar />
        <div className="sellarea-main-content">
          <div className="sellarea-balance-section">
            <p>
              <strong>Seller Balance:</strong>{' '}
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(sellerBalance)}
            </p>
            <button className="sellarea-withdraw-btn" onClick={handleWithdraw}>
              Withdraw
            </button>
          </div>

          <button className="sellarea-start-selling-btn" onClick={handleOpenSellModal}>
            Start Selling!
          </button>
          <button className="sellarea-check-orders-btn" onClick={handleCheckOrders}>
            Check Orders
          </button>

          <div className="sellarea-item-container">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <div
                  key={listing.identifier}
                  className="sellarea-item-cards"
                  style={{
                    backgroundColor: listing.color,
                  }}
                >
                  <h3>Product: {listing.productName}</h3>
                  <p>Category: {listing.category}</p>
                  <p>Price: ₱{listing.price}</p>
                  <p>Details: {listing.details}</p>
                  <p>Stocks Availability: {listing.quantity} {listing.unit}</p>
                  <p>This listing is {listing.status ? "active" : "inactive"}.</p>

                  <button
                    onClick={() =>
                      listing.status
                        ? handleUnlist(listing.identifier)
                        : handleRelist(listing.identifier)
                    }
                    className={listing.status ? "sellarea-unlist-btn" : "sellarea-list-btn"}
                  >
                    {listing.status ? "Unlist" : "List Again"}
                  </button>

                  <button onClick={() => handleEdit(listing)} className="sellarea-edit-btn">
                    <Edit2 className="sellarea-icon" />
                  </button>
                </div>
              ))
            ) : (
              <p>You have no listings yet.</p>
            )}
          </div>

          {openSellModal && (
            <div className="sellarea-modal">
              <div className="sellarea-modal-overlay" onClick={handleCloseSellModal}></div>
              <div className="sellarea-modal-contents">
                <h2 className="sellarea-modal-title">
                  {editingListing ? "Edit Listing" : "Create a New Listing"}
                </h2>
                <div className="input-group">
                  <Tag className="icon" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="" disabled>
                      Select a Category
                    </option>
                    {Object.keys(categories).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <Package className="icon" />
                  <select
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="input-field"
                    disabled={!category}
                  >
                    <option value="" disabled>
                      Select a Product
                    </option>
                    {categories[category]?.map((product) => (
                      <option key={product} value={product}>
                        {product}
                      </option>
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
                    <option value="" disabled>
                      Select a Location
                    </option>
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
                  {editingListing ? "Publish Edit" : "Publish"}
                </button>

                {editingListing && !showConfirmation && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(editingListing._id)}
                  >
                    Delete
                  </button>
                )}

                {editingListing && showConfirmation && (
                  <div className="confirmation-buttons">
                    <button
                      className="confirm-delete-btn"
                      onClick={() => handleConfirmDelete(editingListing._id)}
                    >
                      Yes
                    </button>
                    <button className="cancel-delete-btn" onClick={handleCancelDelete}>
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SellArea;