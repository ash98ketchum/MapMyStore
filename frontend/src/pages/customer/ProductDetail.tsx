import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, ShoppingCart, Star, Package,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { mockProducts, mockShelves } from '../../data/mockData';
import { useCart, CartItem } from '../../pages/customer/CartContext';

const ProductDetail = () => {
  const { addToCart, cartItems } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const { id } = useParams();
  const product = mockProducts.find((p) => p.id === id);
  const shelf   = mockShelves.find((s) => s.id === product?.shelfId);

  /* ─────────────────────────────────────────── */
  /* Detect whether product already in cart      */
  /* ─────────────────────────────────────────── */
  useEffect(() => {
    if (!product) return;
    const inCart = cartItems.some((item: CartItem) => item.id === product.id);
    setIsAdded(inCart);
  }, [cartItems, product]);

  /* ─────────────────────────────────────────── */
  /* Fallback if product not found               */
  /* ─────────────────────────────────────────── */
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-full !bg-primary text-white">
        <p className="text-white/60">Product not found</p>
      </div>
    );
  }

  /* ─────────────────────────────────────────── */
  /* Main Render                                 */
  /* ─────────────────────────────────────────── */
  return (
    <div className="flex flex-col min-h-full !bg-primary text-white">
      {/* ── Header ────────────────────────────── */}
      <div className="!bg-primary/80 backdrop-blur-xs border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/customer/home" className="text-white/80 hover:text-accent">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="font-bold text-white">Product Details</h1>
            <p className="text-xs text-white/60">{product.category}</p>
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ────────────────── */}
      <div className="flex-1 overflow-auto px-4 py-6 space-y-6 scrollbar-hide">
        {/* ── Hero Image & Title Card ─────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="p-8 !bg-glass !border !border-white/10 rounded-2xl">
            <div className="aspect-square bg-glass rounded-xl overflow-hidden mb-4">
              <img
                src={product.imageUrl || '/fallback-image.png'}
                alt={product.name}
                className="!block !w-full !h-full !object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/fallback-image.png';
                }}
              />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">{product.name}</h2>
              <p className="text-white/60 mb-4">SKU: {product.sku}</p>

              <div className="flex items-center justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 text-yellow-400 fill-current"
                  />
                ))}
                <span className="text-sm text-white/60 ml-2">(4.8)</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Location Details ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard className="p-6 !bg-glass !border !border-white/10 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-accent mr-2" />
              Location Details
            </h3>

            {shelf && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Shelf:</span>
                  <span className="font-medium">{shelf.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Zone:</span>
                  <span className="font-medium capitalize">{shelf.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Type:</span>
                  <span className="font-medium capitalize">{shelf.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Stock:</span>
                  <span
                    className={`font-medium ${
                      product.stock > 10 ? 'text-green-400' : 'text-yellow-400'
                    }`}
                  >
                    {product.stock} units
                  </span>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* ── Action Buttons ──────────────────── */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/customer/map">
            <Button
              variant="primary"
              size="lg"
              icon={MapPin}
              className="w-full"
            >
              Navigate to Product
            </Button>
          </Link>

          <Button
            variant="highlight"
            size="lg"
            icon={ShoppingCart}
            className={`w-full ${
              isAdded
                ? '!bg-green-500 !text-white hover:!bg-green-600'
                : ''
            }`}
            disabled={isAdded}
            onClick={() => {
              addToCart({
                id:       product.id,
                name:     product.name,
                category: product.category,
                quantity: 1,
                price:    product.price ?? 4.99,
                shelfId:  product.shelfId,
              });
              setIsAdded(true);
            }}
          >
            {isAdded ? '✔ Added' : 'Add to Smart Cart'}
          </Button>

          {/* Example of an extra button you might enable later */}
          {/* <Button variant="highlight" size="lg" className="w-full">
            Mark as Found
          </Button> */}
        </motion.div>

        {/* ── Additional Info ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <GlassCard className="p-6 !bg-glass !border !border-white/10 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Product Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Category:</span>
                <span>{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Availability:</span>
                <span className="text-green-400">In Stock</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Last Updated:</span>
                <span>2 hours ago</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
