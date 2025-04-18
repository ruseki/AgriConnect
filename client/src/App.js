// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SellArea from './pages/SellArea';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoutes';
import BuyArea from './pages/BuyArea';
import CartArea from './pages/CartArea';
import Profile from './pages/Profile';
import ViewProfile from './pages/ViewProfile';
import InventoryPage from './pages/InventoryPage';
import './App.css';
import { AuthProvider } from './components/AuthProvider';
import AdminRoutes from './routes/adminRoutes';
import AdminDashboard from './admin/adminDashboard';
import ManageUsers from './admin/manageUsers';
import ManageCheckouts from './admin/manageCheckouts';
import OrderStatus from './pages/OrderStatus'; // Import OrderStatus for all status-related pages
import SellerOrders from './pages/SellerOrdersArea';
import WithdrawalPage from './pages/WithdrawalPage'; // Import WithdrawPage

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/sell-area"
            element={
              <ProtectedRoute>
                <SellArea />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/buy-area"
            element={
              <ProtectedRoute>
                <BuyArea />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartArea />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-profile/:userId"
            element={
              <ProtectedRoute>
                <ViewProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoutes>
                <AdminDashboard />
              </AdminRoutes>
            }
          />
          <Route
            path="/manage-users-checkouts"
            element={
              <AdminRoutes>
                <ManageCheckouts />
              </AdminRoutes>
            }
          />
          {/* Use OrderStatus for Pending, Orders, and Successful */}
          <Route
            path="/pending"
            element={
              <ProtectedRoute>
                <OrderStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/successful"
            element={
              <ProtectedRoute>
                <OrderStatus />
              </ProtectedRoute>
            }
          />
          <Route path="/seller-orders" element={<SellerOrders />} /> 
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <WithdrawalPage /> {}
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;