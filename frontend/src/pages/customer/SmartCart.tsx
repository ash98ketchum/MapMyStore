import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { useCart, CartItem } from '../../pages/customer/CartContext';

const SmartCart: React.FC = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();

  const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-glass backdrop-blur-md border-b border-glass p-4 flex items-center">
        <Link to="/customer/home"><ArrowLeft className="h-6 w-6" /></Link>
        <h1 className="ml-4 font-bold">Smart Cart</h1>
        <span className="ml-auto text-xs text-gray-400">{cartItems.length} items</span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="font-bold mb-2">Your cart is empty</h2>
            <Link to="/customer/home"><Button variant="primary">Start Shopping</Button></Link>
          </div>
        ) : cartItems.map((item: CartItem, idx: number) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
            <GlassCard className="p-4">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-gray-400" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.category}</p>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center space-x-2">
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
                      <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center border-t border-glass pt-2">
                    <Link to="/customer/map" className="flex items-center text-accent text-sm">
                      <MapPin className="h-4 w-4" /><span>{item.shelfId}</span>
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

      {/* Footer */}
      {cartItems.length > 0 && (
        <motion.div className="bg-glass border-t border-glass p-4 space-y-4" initial={{ y: 100 }} animate={{ y: 0 }}>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax:</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-glass"><span>Total:</span><span>${total.toFixed(2)}</span></div>
          </div>
          <Button variant="primary" size="lg" icon={CreditCard} className="w-full">Checkout</Button>
        </motion.div>
      )}
    </div>
  );
};

export default SmartCart;
