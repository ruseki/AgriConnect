import React from 'react';
import './css/InventoryPage.css'; // Import the updated stylesheet
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';

const InventoryPage = () => {
  return (
    <>
      <TopNavbar />
      <SideBar />
      <div className="inventory-container">
        <h1 className="inventory-title">Inventory Management</h1>
        <div className="inventory-list">
          <div className="inventory-item">
            <span className="item-name">Product 1</span>
            <span className="item-quantity">10</span>
            <span className="item-price">$20.00</span>
          </div>
          <div className="inventory-item">
            <span className="item-name">Product 2</span>
            <span className="item-quantity">5</span>
            <span className="item-price">$15.00</span>
          </div>
        </div>
        <button className="add-product-btn">Add Product</button>
      </div>
    </>
  );
};

export default InventoryPage;
