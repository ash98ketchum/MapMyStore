import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import GlassCard from '../ui/GlassCard';
import { mockProducts } from '../../data/mockData'; 

import {
  BarChart3,
  Layout,
  Package,
  Zap,
  Radio,
  ChevronRight,
  Bell,
  Search,
  MapPin,
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  
interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  shelfId: string;
  stock: number;
}

  const navItems = [
    { path: '/admin', icon: BarChart3, label: 'Overview', exact: true },
    { path: '/admin/floor-designer', icon: Layout, label: 'Floor Designer' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/discounts', icon: Zap, label: 'Discounts' },
    { path: '/admin/beacons', icon: Radio, label: 'Beacons' },
  ];

useEffect(() => {
  const filtered = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  setFilteredProducts(filtered);
}, [searchQuery]);

  const handleLogout = () => {
    navigate('/signin/customer');
  };

  const isActive = (path: string, exact = false) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  const filteredResults = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-primary">
      {/* Sidebar */}
      <motion.div
        className="relative bg-glass backdrop-blur-md border-r border-glass flex flex-col"
        initial={{ width: 60 }}
        animate={{ width: sidebarExpanded ? 240 : 60 }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="p-4">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Layout className="h-5 w-5 text-primary" />
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-accent text-primary shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-glass'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <motion.span
                  className="ml-3 font-medium whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: sidebarExpanded ? 1 : 0 }}
                  transition={{ delay: sidebarExpanded ? 0.1 : 0 }}
                >
                  {item.label}
                </motion.span>
                {active && (
                  <motion.div
                    className="ml-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: sidebarExpanded ? 1 : 0 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-glass backdrop-blur-md border-b border-glass flex items-center justify-between px-6">
          {/* Left: Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stores, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-glass rounded-xl border border-glass focus:border-accent focus:outline-none text-sm w-80"
              />
            </div>
          </div>

          {/* Right: Bell + Buttons */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-highlight rounded-full"></span>
            </button>

            <Link to="/admin/floor-designer">
              <Button variant="primary" icon={MapPin}>Open Floor Designer</Button>
            </Link>
            <Button variant="highlight" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        {/* Search Results */}
      {searchQuery && (
  <div className="p-6">
    <h2 className="text-lg font-semibold mb-3">
      Search Results ({filteredProducts.length})
    </h2>
    <div className="space-y-3">
      {filteredProducts.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
            <Link to={`/admin/products/${product.id}`}>
            <GlassCard className="p-4 flex items-center space-x-4 hover:bg-white hover:bg-opacity-10 transition-all">
              <div className="w-12 h-12 bg-glass rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-400">{product.category}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-accent">Stock: {product.stock}</span>
                  <span className="text-xs text-gray-400">Shelf {product.shelfId}</span>
                </div>
              </div>
              {/* <Map className="h-5 w-5 text-gray-400" /> */}
            </GlassCard>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
)}


        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;