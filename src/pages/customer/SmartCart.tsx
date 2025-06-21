import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';

interface CartItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  shelfId: string;
}

const SmartCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: '1', name: 'Organic Bananas', category: 'Groceries', quantity: 2, price: 3.99, shelfId: 'shelf-1' },
    { id: '4', name: 'Doritos Nacho', category: 'Snacks', quantity: 1, price: 4.49, shelfId: 'shelf-4' },
  ]);

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-glass backdrop-blur-md border-b border-glass p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/customer/home">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="font-bold">Smart Cart</h1>
            <p className="text-xs text-gray-400">{cartItems.length} items</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-glass rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Start shopping to add items</p>
            <Link to="/customer/home">
              <Button variant="primary">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-glass rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-gray-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{item.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 bg-glass rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 bg-glass rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-400">${item.price} each</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass">
                        <Link to="/customer/map" className="flex items-center space-x-2 text-accent text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>Shelf {item.shelfId}</span>
                        </Link>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Footer */}
      {cartItems.length > 0 && (
        <motion.div
          className="bg-glass backdrop-blur-md border-t border-glass p-4 space-y-4"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-glass">
              <span>Total:</span>
              <span className="text-accent">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <Button variant="primary" size="lg" icon={CreditCard} className="w-full">
            Proceed to Checkout
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default SmartCart;