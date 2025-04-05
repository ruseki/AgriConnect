import React, { useState, useEffect } from 'react';
import './css/InventoryPage.css'; // Import the updated stylesheet
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { useAuth } from '../components/AuthProvider';
import axios from 'axios';

const InventoryPage = () => {
  const { token } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for the modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    quantity: 0,
    unit: 'kilograms', // Default value
    price: 0,
    expirationDate: '',
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setInventoryItems(response.data.inventoryItems || []);
        } else {
          console.error('Failed to fetch inventory:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInventory();
    }
  }, [token]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setInventoryItems((prev) => prev.filter((item) => item._id !== id));
        alert('Inventory item deleted successfully!');
      } else {
        console.error('Failed to delete inventory item:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error.message);
      alert('Failed to delete inventory item.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddProduct = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/inventory',
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setInventoryItems((prev) => [...prev, response.data.inventory]);
        alert('Inventory item added successfully!');
        setIsModalOpen(false); // Close the modal after success
        setFormData({
          productName: '',
          category: '',
          quantity: 0,
          unit: 'kilograms',
          price: 0,
          expirationDate: '',
        });
      } else {
        console.error('Failed to add inventory item:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding inventory item:', error.message);
      alert('Failed to add inventory item.');
    }
  };

  const renderInventoryItems = () => {
    if (isLoading) {
      return <p>Loading inventory...</p>;
    }

    if (!inventoryItems.length) {
      return <p className="inventory-empty">No inventory items available.</p>;
    }

    return inventoryItems.map((item) => (
      <div key={item._id} className="inventory-item">
        <span className="inventory-item-name">{item.productName}</span>
        <span className="inventory-item-quantity">{item.quantity} {item.unit}</span>
        <span className="inventory-item-price">₱{item.price}</span>
        <button className="inventory-delete-btn" onClick={() => handleDelete(item._id)}>Delete</button>
      </div>
    ));
  };

  return (
    <>
      <TopNavbar />
      <SideBar />
      <div className="inventory-container">
        <h1 className="inventory-title">Inventory Management</h1>
        <div className="inventory-list">
          {renderInventoryItems()}
        </div>
        <button className="inventory-add-product-btn" onClick={() => setIsModalOpen(true)}>Add Product</button>

        {isModalOpen && (
          <div className="inventory-modal">
            <div className="inventory-modal-overlay" onClick={() => setIsModalOpen(false)}></div>
            <div className="inventory-modal-content">
              <h2>Add New Product</h2>
              <form>
                <label>
                  Product Name:
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Category:
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Quantity:
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Unit:
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Price:
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Expiration Date:
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                  />
                </label>
                <button type="button" className="inventory-submit-btn" onClick={handleAddProduct}>Submit</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InventoryPage;