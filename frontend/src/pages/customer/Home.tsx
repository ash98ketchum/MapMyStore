import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Map, ShoppingCart, User, Zap, LogOut, Package, Smartphone, Heart } from 'lucide-react';
import { Link, useNavigate} from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { mockProducts } from '../../data/mockData';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState(0);

  const categories = [
    { id: 'electronics', name: 'Electronics', icon: Smartphone, color: '#8B5CF6' },
    { id: 'groceries', name: 'Groceries', icon: Package, color: '#10B981' },
    { id: 'snacks', name: 'Snacks', icon: Zap, color: '#FFB547' },
    { id: 'health', name: 'Health', icon: Heart, color: '#EF4444' },
  ];

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
const navigate = useNavigate();

const handleLogout = () => {
  navigate('/signin/customer');
};
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
            <Link to="/customer/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-400" />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-accent rounded-full flex items-center justify-center text-xs text-primary">
                  {cartItems}
                </span>
              )}
            </Link>
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
        {!searchQuery ? (
          <>
            {/* Categories */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Shop by Category</h2>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {categories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      className="flex-shrink-0 w-20 text-center"
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

            {/* Featured Products */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Popular Items</h2>
              <div className="grid grid-cols-2 gap-3">
                {mockProducts.slice(0, 4).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Link to={`/customer/product/${product.id}`}>
                      <GlassCard className="p-4 hover:bg-white hover:bg-opacity-10 transition-all">
                        <div className="aspect-square bg-glass rounded-lg mb-3 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
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
          </>
        ) : (
          /* Search Results */
          <div>
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
                  <Link to={`/customer/product/${product.id}`}>
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
                      <Map className="h-5 w-5 text-gray-400" />
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;