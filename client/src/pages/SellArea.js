import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { Tag, Package, MapPin, Info, Edit2, Truck } from 'lucide-react';
import { useAuth } from '../components/AuthProvider'; 
import './css/SellArea.css';

const SellArea = () => {
  const { isAuthenticated, token } = useAuth(); 
  const [openSellModal, setOpenSellModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('sack');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('');
  const [listerEmail, setListerEmail] = useState(''); 

  useEffect(() => {
    const fetchListerEmail = async () => {
      if (isAuthenticated) {
        const email = 'user@example.com'; 
        setListerEmail(email);
      }
    };

    fetchListerEmail();
  }, [isAuthenticated]);

  const handleOpenSellModal = () => setOpenSellModal(true);
  const handleCloseSellModal = () => setOpenSellModal(false);

  const handlePublish = async () => {
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          productName, 
          quantity, 
          unit, 
          category, 
          condition, 
          details, 
          location, 
          listerEmail 
        }), 
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const result = await response.json();
      alert('Listing published!');
      handleCloseSellModal();
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing');
    }
  };

  return (
    <>
      <TopNavbar />
      <main className="main flex">
        <SideBar />
        <div className="main-content flex-grow flex justify-center items-center">
          <button className="start-selling-btn" onClick={handleOpenSellModal}>
            Start Selling!
          </button>
          {openSellModal && (
            <div className="modal">
              <div className="modal-overlay" onClick={handleCloseSellModal}></div>
              <div className="modal-content">
                <h2 className="modal-title">Create a New Listing</h2>
                <div className="input-group">
                  <Tag className="icon" />
                  <input 
                    type="text" 
                    placeholder="Product Name" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <Package className="icon" />
                  <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input-field"
                  />
                  <select 
                    value={unit} 
                    onChange={(e) => setUnit(e.target.value)}
                    className="unit-select"
                  >
                    <option value="sack">Sack</option>
                    <option value="kilograms">Kilograms</option>
                    <option value="cavan">Cavan</option>
                  </select>
                </div>
                <div className="input-group">
                  <Edit2 className="icon" />
                  <input 
                    type="text" 
                    placeholder="Category" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <Info className="icon" />
                  <input 
                    type="text" 
                    placeholder="Condition" 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <Edit2 className="icon" />
                  <textarea 
                    placeholder="Details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="input-field textarea"
                  />
                </div>
                <div className="input-group">
                  <MapPin className="icon" />
                  <select 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                  >
                    <option value="" disabled>Select Location</option>
                    <option value="Location 1">Location 1</option>
                    <option value="Location 2">Location 2</option>
                    <option value="Location 3">Location 3</option>
                  </select>
                </div>
                <button 
                  className="publish-btn" 
                  onClick={handlePublish}
                >
                  <Truck className="icon mr-2" />
                  Publish
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
