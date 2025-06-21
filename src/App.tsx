import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layouts/AdminLayout';
import CustomerLayout from './components/layouts/CustomerLayout';
import Overview from './pages/admin/Overview';
import FloorPlanDesigner from './pages/admin/FloorPlanDesigner';
import ProductLocationManager from './pages/admin/ProductLocationManager';
import DiscountCreator from './pages/admin/DiscountCreator';
import BeaconManager from './pages/admin/BeaconManager';
import Settings from './pages/admin/Settings';
import Welcome from './pages/customer/Welcome';
import Home from './pages/customer/Home';
import MapNavigation from './pages/customer/MapNavigation';
import ProductDetail from './pages/customer/ProductDetail';
import SmartCart from './pages/customer/SmartCart';

function App() {
  return (
    <div className="min-h-screen bg-primary text-white">
      <Routes>
        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="floor-designer" element={<FloorPlanDesigner />} />
          <Route path="products" element={<ProductLocationManager />} />
          <Route path="discounts" element={<DiscountCreator />} />
          <Route path="beacons" element={<BeaconManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Customer PWA Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Welcome />} />
          <Route path="home" element={<Home />} />
          <Route path="map" element={<MapNavigation />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<SmartCart />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}

export default App;