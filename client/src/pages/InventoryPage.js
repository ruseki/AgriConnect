import React, { useState, useEffect } from 'react';
import './css/InventoryPage.css';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { useAuth } from '../components/AuthProvider';
import axios from 'axios';

const categories = {
  'Cereal Crops': ['Barley', 'Black Rice', 'Brown Rice', 'Corn', 'Millet', 'Oats', 'Sorghum', 'Wheat', 'White Rice'],
  'Vegetables': ['Asparagus', 'Beets', 'Bell Peppers', 'Broccoli', 'Brussels Sprouts', 'Cabbage', 'Carrots', 'Cauliflower', 'Celery', 'Chard', 'Cucumber', 'Eggplant', 'Garlic', 'Green Beans', 'Kale', 'Leeks', 'Lettuce', 'Mushrooms', 'Okra', 'Onions', 'Parsnips', 'Peas', 'Potatoes', 'Pumpkin', 'Radishes', 'Spinach', 'Squash', 'Sweet Corn', 'Sweet Potatoes', 'Tomatoes', 'Turnips', 'Zucchini'],
  'Fruits': ['Apples', 'Avocado', 'Bananas', 'Blueberries', 'Cherries', 'Dragon Fruit', 'Grapes', 'Kiwi', 'Lemon', 'Lychee', 'Mangoes', 'Melon', 'Oranges', 'Papaya', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Raspberry', 'Strawberries', 'Watermelon'],
  'Legumes': ['Beans', 'Lentils', 'Peas', 'Soybeans'],
};

const InventoryPage = () => {
  const { token } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showOtherDetails, setShowOtherDetails] = useState(false);
  const [breakEvenPrices, setBreakEvenPrices] = useState([]);

  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    price: '',
    unit: 'kilograms',
    quantity: '',
    expirationDate: '',
    plantingDate: '',
    harvestingDate: '',
    supplySchedule: 'weekly',
    stockThreshold: 10,
    supplyCapacityDaily: '',
    supplyCapacityWeekly: '',
    stockAvailability: '',
  });

  const [additionalDetails, setAdditionalDetails] = useState({
    storageTemp: '',
    humidity: '',
    packagingType: '',
    certificationType: '',
    processingMethod: '',
    packagingSize: '',
    preferredSoil: '',
    bestClimate: '',
    batchNumber: '',
    qrCodeUrl: '',
    supplierInfo: '',
    deliveryOptions: '',
  });

  const fetchInventory = async () => {
    try {
      const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

      const response = await axios.get(`${API_BASE_URL}/api/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log('Fetched inventory response:', response.data); 
      setInventoryItems(response.data.inventoryItems || []);
    } catch (error) {
      console.error('❌ Error fetching inventory:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (additionalDetails.hasOwnProperty(name)) {
      setAdditionalDetails(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedProduct('');
    setFormData(prev => ({ ...prev, category }));
  };

  const handleProductChange = (e) => {
    const product = e.target.value;
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, productName: product }));
  };

  const handleAddBreakEvenPrice = () => {
    if (
      breakEvenPrices.length === 0 ||
      (breakEvenPrices.at(-1).price && breakEvenPrices.at(-1).startDate && breakEvenPrices.at(-1).endDate)
    ) {
      setBreakEvenPrices([...breakEvenPrices, { price: '', startDate: '', endDate: '' }]);
    } else {
      alert('Please fill in the previous Break-Even Price before adding another.');
    }
  };

  const handleBreakEvenPriceChange = (index, field, value) => {
    const updated = [...breakEvenPrices];
    updated[index][field] = value;
    setBreakEvenPrices(updated);
  };

  const toggleOtherDetails = () => setShowOtherDetails(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

  if (!formData.productName || !formData.category) {
    alert('❌ Product Name and Category are required.');
    return;
  }

  if (isNaN(formData.price) || formData.price <= 0) {
    alert('❌ Price must be a positive number.');
    return;
  }

  if (isNaN(formData.quantity) || formData.quantity <= 0) {
    alert('❌ Quantity must be a positive number.');
    return;
  }

  if (isNaN(formData.stockThreshold) || formData.stockThreshold < 0) {
    alert('❌ Stock Threshold must be a non-negative number.');
    return;
  }

  if (isNaN(formData.supplyCapacityDaily) || formData.supplyCapacityDaily < 0) {
    alert('❌ Supply Capacity Daily must be a non-negative number.');
    return;
  }

  if (isNaN(formData.supplyCapacityWeekly) || formData.supplyCapacityWeekly < 0) {
    alert('❌ Supply Capacity Weekly must be a non-negative number.');
    return;
  }

  for (const [index, entry] of breakEvenPrices.entries()) {
    if (!entry.price || isNaN(entry.price) || entry.price <= 0) {
      alert(`❌ Break-Even Price at row ${index + 1} must be a positive number.`);
      return;
    }
    if (!entry.startDate || !entry.endDate) {
      alert(`❌ Start Date and End Date are required for Break-Even Price at row ${index + 1}.`);
      return;
    }
    if (new Date(entry.startDate) > new Date(entry.endDate)) {
      alert(`❌ Start Date cannot be later than End Date for Break-Even Price at row ${index + 1}.`);
      return;
    }
  }
    try {
      const payload = {
        ...formData,
        breakEvenPrices,
        additionalDetails,
        userId: localStorage.getItem('userId'),
      };
  
      payload.quantity = Number(payload.quantity);
  
      await axios.post('http://localhost:5000/api/inventory', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      alert('✅ Product added successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchInventory(); 
    } catch (err) {
      console.error('❌ Submission error:', err);
      alert('Failed to add product.');
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      category: '',
      price: '',
      unit: 'kilograms',
      quantity: '',
      expirationDate: '',
      plantingDate: '',
      harvestingDate: '',
      supplySchedule: 'weekly',
      stockThreshold: 10,
      supplyCapacityDaily: '',
      supplyCapacityWeekly: '',
      stockAvailability: '',
    });
    setAdditionalDetails({
      storageTemp: '',
      humidity: '',
      packagingType: '',
      certificationType: '',
      processingMethod: '',
      packagingSize: '',
      preferredSoil: '',
      bestClimate: '',
      batchNumber: '',
      qrCodeUrl: '',
      supplierInfo: '',
      deliveryOptions: '',
    });
    setBreakEvenPrices([]);
    setSelectedCategory('');
    setSelectedProduct('');
    setShowOtherDetails(false);
  };
  

  return (
    <>
      <TopNavbar />
      <SideBar />
      <div className="inventory-container">
        <h1 className="inventory-title">Inventory Management</h1>
        <button className="inventory-add-product-btn" onClick={() => setIsModalOpen(true)}>Add Product</button>
  
        {}
        <div className="inventory-table-container" style={{ overflowX: 'auto' }}>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Stock Threshold</th>
                <th>Supply Capacity Daily</th>
                <th>Supply Capacity Weekly</th>
                <th>Stock Availability</th>
                <th>Packaging Type</th>
                <th>Certification Type</th>
                <th>Packaging Size</th>
                <th>Supplier Info</th>
                <th>Delivery Options</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.productName}</td>
                    <td>{item.category}</td>
                    <td>{item.price}</td>
                    <td>{item.unit}</td>
                    <td>{item.quantity}</td>
                    <td>{item.stockThreshold}</td>
                    <td>{item.supplyCapacityDaily}</td>
                    <td>{item.supplyCapacityWeekly}</td>
                    <td>{item.stockAvailability}</td>
                    <td>{item.additionalDetails?.packagingType}</td>
                    <td>{item.additionalDetails?.certificationType}</td>
                    <td>{item.additionalDetails?.processingMethod}</td>
                    <td>{item.additionalDetails?.packagingSize}</td>
                    <td>{item.additionalDetails?.batchNumber}</td>
                    <td>{item.additionalDetails?.supplierInfo}</td>
                    <td>{item.additionalDetails?.deliveryOptions}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="26">No inventory items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
  
        {isModalOpen && (
          <div className="inventory-modal">
            <div className="inventory-modal-overlay" onClick={() => setIsModalOpen(false)}></div>
            <div className="inventory-modal-content" style={{ overflowY: 'auto', maxHeight: '80vh' }}>
              <h2>Add New Product</h2>
              <form onSubmit={handleSubmit}>
                <label>Category:</label>
                <select name="category" value={selectedCategory} onChange={handleCategoryChange} required>
                  <option value="">Select Category</option>
                  {Object.keys(categories).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
  
                {selectedCategory && (
                  <>
                    <label>Product:</label>
                    <select name="productName" value={selectedProduct} onChange={handleProductChange} required>
                      <option value="">Select Product</option>
                      {categories[selectedCategory].map((prod) => (
                        <option key={prod} value={prod}>{prod}</option>
                      ))}
                    </select>
                  </>
                )}
  
                {Object.keys(formData).map((field) =>
                  field !== 'category' && field !== 'productName' && (
                    <div key={field}>
                      <label>{field.replace(/([A-Z])/g, ' $1')}</label>
                      <input
                        type={
                          ['expirationDate', 'plantingDate', 'harvestingDate'].includes(field)
                            ? 'date'
                            : typeof formData[field] === 'number'
                            ? 'number'
                            : 'text'
                        }
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                      />
                    </div>
                  )
                )}
  
                <button type="button" onClick={handleAddBreakEvenPrice} className="custom-btn green">Add Break-Even Price</button>
  
                {breakEvenPrices.map((entry, index) => (
                  <div key={index} className="break-even-field">
                    <input type="number" placeholder="Price" value={entry.price} onChange={(e) => handleBreakEvenPriceChange(index, 'price', e.target.value)} />
                    <input type="date" placeholder="Start Date" value={entry.startDate} onChange={(e) => handleBreakEvenPriceChange(index, 'startDate', e.target.value)} />
                    <input type="date" placeholder="End Date" value={entry.endDate} onChange={(e) => handleBreakEvenPriceChange(index, 'endDate', e.target.value)} />
                  </div>
                ))}
  
                <button type="button" onClick={toggleOtherDetails} className="custom-btn blue">Add Additional Details</button>
  
                {showOtherDetails && Object.keys(additionalDetails).map((field) => (
                  <div key={field}>
                    <label>{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input type="text" name={field} value={additionalDetails[field]} onChange={handleInputChange} />
                  </div>
                ))}
  
                <button type="submit" className="inventory-submit-btn">Submit</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  ); };
  
  export default InventoryPage;