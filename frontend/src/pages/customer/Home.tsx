import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chatbot from '../../components/ui/Chatbot';
import {
  Search,
  Map,
  ShoppingCart,
  LogOut,
  Package,
  Smartphone,
  Heart,
  Zap,
  Bell,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { mockProducts, mockDiscountRules } from '../../data/mockData';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const discountRules = mockDiscountRules
      .filter(rule => rule.active)
      .sort((a, b) => {
        const getValue = (rule: typeof mockDiscountRules[0]) =>
          rule.action.type === 'percentage'
            ? rule.action.value
            : rule.action.type === 'fixed-amount'
            ? rule.action.value / 10
            : 0;
        return getValue(b) - getValue(a);
      })
      .slice(0, 2);

    const formatted = discountRules.map(rule => {
      const value = rule.action.value;
      if (rule.action.type === 'percentage') {
        return `🔥 ${rule.name}: ${value}% off on ${rule.condition.value}!`;
      } else {
        return `💸 ${rule.name}: ₹${value} off when you ${rule.trigger.type.replace('-', ' ')}`;
      }
    });

    setNotifications(formatted);
  }, []);

  const categories = [
    { id: 'electronics', name: 'Electronics', icon: Smartphone, color: '#8B5CF6' },
    { id: 'groceries', name: 'Groceries', icon: Package, color: '#10B981' },
    { id: 'snacks', name: 'Snacks', icon: Zap, color: '#FFB547' },
    { id: 'health', name: 'Beauty & Health', icon: Heart, color: '#EF4444' },
  ];

  const filteredProducts = mockProducts.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!selectedCategory || product.category === selectedCategory)
  );

  const handleLogout = () => {
    navigate('/signin/customer');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-glass backdrop-blur-md border-b border-glass p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">MapMyStore</h1>
            <p className="text-sm text-gray-400">Every product. One tap away.</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="relative p-1 hover:text-white transition-colors"
              >
                <Bell className="h-6 w-6 text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-accent rounded-full flex items-center justify-center text-xs text-primary">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-black backdrop-blur-md border border-glass rounded-xl shadow-xl p-4 z-[100]">
                  <h4 className="font-semibold text-sm text-white mb-2">Notifications</h4>
                  <ul className="space-y-2 max-h-40 overflow-auto">
                    {notifications.map((notif, idx) => (
                      <li key={idx} className="text-sm text-gray-200 bg-white/10 rounded-lg p-2">
                        {notif}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/customer/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-400" />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-accent rounded-full flex items-center justify-center text-xs text-primary">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* Logout */}
            <button onClick={handleLogout} className="p-1 hover:text-white transition-colors">
              <LogOut className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-glass rounded-xl border border-glass focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Shop by Category</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.name;
              return (
                <motion.div
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.name ? null : category.name
                    )
                  }
                  className={`flex-shrink-0 w-20 text-center cursor-pointer transition-transform ${
                    isActive ? 'scale-105 border border-accent rounded-xl' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <Icon className="h-8 w-8" style={{ color: category.color }} />
                  </div>
                  <p className="text-xs font-medium">{category.name}</p>
                </motion.div>
              );
            })}
          </div>
          {selectedCategory && (
            <div
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-accent mt-2 ml-2 cursor-pointer"
            >
              ✖ Clear filter: {selectedCategory}
            </div>
          )}
        </div>

        {/* Map CTA */}
        <GlassCard className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-16 h-16 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Navigate the Store</h3>
            <p className="text-gray-400 mb-4">Get real-time directions to any product</p>
            <Link to="/customer/map">
              <Button variant="primary" size="lg" className="w-full animate-glow">
                Open Interactive Map
              </Button>
            </Link>
          </motion.div>
        </GlassCard>

        {/* Products */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {searchQuery || selectedCategory ? 'Filtered Items' : 'Popular Items'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                                  <Link
                    to={`/customer/product/${product.id}`}
                    onClick={() => {
                      fetch('http://localhost:4000/api/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product: product.name })
                      });
                    }}
                  >

                  <GlassCard className="p-4 hover:bg-white hover:bg-opacity-10 transition-all">
                    <div className="aspect-square bg-glass rounded-lg mb-3 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-accent">In stock: {product.stock}</span>
                      <span className="text-xs text-gray-400">Aisle {product.shelfId.split('-')[1]}</span>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default Home;
