import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Map,
  ShoppingCart,
  LogOut,
  Package,
  Zap,
  Smartphone,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { mockProducts } from '../../data/mockData';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-glass backdrop-blur-md border-b border-glass p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">SmartNav</h1>
            <p className="text-sm text-gray-400">Find anything, anywhere</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-400" />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-accent rounded-full flex items-center justify-center text-xs text-primary">
                  {cartItems}
                </span>
              )}
            </div>
            <button onClick={() => navigate('/signin/customer')} className="p-1 hover:text-white transition-colors">
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
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-glass rounded-xl border border-glass focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {!searchQuery ? (
          <>
            {/* Categories */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Shop by Category</h2>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {[
                  { id: 'electronics', name: 'Electronics', icon: Smartphone, color: '#8B5CF6' },
                  { id: 'groceries',   name: 'Groceries',   icon: Package,    color: '#10B981' },
                  { id: 'snacks',      name: 'Snacks',      icon: Zap,        color: '#FFB547' },
                  { id: 'health',      name: 'Health',      icon: Heart,      color: '#EF4444' },
                ].map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div
                      key={cat.id}
                      className="flex-shrink-0 w-20 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto"
                        style={{ backgroundColor: cat.color + '20' }}
                      >
                        <Icon className="h-8 w-8" style={{ color: cat.color }} />
                      </div>
                      <p className="text-xs font-medium">{cat.name}</p>
                    </motion.div>
                  );
                })}
              </div>
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
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full animate-glow"
                  onClick={() => navigate('/customer/map')}
                >
                  Open Interactive Map
                </Button>
              </motion.div>
            </GlassCard>

            {/* Featured Products */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Popular Items</h2>
              <div className="grid grid-cols-2 gap-3">
                {mockProducts.slice(0, 4).map((prod, idx) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                  >
                    <GlassCard className="p-4 hover:bg-white hover:bg-opacity-10 transition-all">
                      <div className="aspect-square bg-glass rounded-lg mb-3 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{prod.name}</h3>
                      <p className="text-xs text-gray-400 mb-2">{prod.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-accent">In stock: {prod.stock}</span>
                        <span className="text-xs text-gray-400">
                          Aisle {prod.shelfId.split('-')[1]}
                        </span>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* your existing search-results markup… */
          <></>
        )}
      </div>
    </div>
  );
};

export default Home;
