// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SignInAdmin from './components/auth/SignInAdmin';
import SignInCustomer from './components/auth/SignInCustomer';
import SignUpAdmin from './components/auth/SignUpAdmin';
import SignUpCustomer from './components/auth/SignUpCustomer';

import AdminLayout from './components/layouts/AdminLayout';
import CustomerLayout from './components/layouts/CustomerLayout';

import Overview from './pages/admin/Overview';
import FloorPlanDesigner from './pages/admin/FloorPlanDesigner';
import ProductLocationManager from './pages/admin/ProductLocationManager';
import DiscountCreator from './pages/admin/DiscountCreator';
import BeaconManager from './pages/admin/BeaconManager';

import Welcome from './pages/customer/Welcome';
import Home from './pages/customer/Home';
import MapNavigation from './pages/customer/MapNavigation';
import ProductDetail from './pages/customer/ProductDetail';
import SmartCart from './pages/customer/SmartCart';
import { CartProvider } from './pages/customer/CartContext';

function App() {
  return (
    <div className="min-h-screen bg-primary text-white">
      <CartProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Sign In */}
          <Route path="/signin/admin" element={<SignInAdmin />} />
          <Route path="/signin/customer" element={<SignInCustomer />} />

          {/* Sign Up */}
          <Route path="/signup/admin" element={<SignUpAdmin />} />
          <Route path="/signup/customer" element={<SignUpCustomer />} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="floor-designer" element={<FloorPlanDesigner />} />
            <Route path="products" element={<ProductLocationManager />} />
            <Route path="discounts" element={<DiscountCreator />} />
            <Route path="beacons" element={<BeaconManager />} />
          </Route>

          {/* Customer Dashboard */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Welcome />} />
            <Route path="home" element={<Home />} />
            <Route path="map" element={<MapNavigation />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<SmartCart />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </div>
  );
}

export default App;
