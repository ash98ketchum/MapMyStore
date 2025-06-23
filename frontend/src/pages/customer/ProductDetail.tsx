import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, ShoppingCart, Star, Package } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { mockProducts, mockShelves } from '../../data/mockData';

const ProductDetail = () => {
  const { id } = useParams();
  const product = mockProducts.find(p => p.id === id);
  const shelf = mockShelves.find(s => s.id === product?.shelfId);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Product not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-glass backdrop-blur-md border-b border-glass p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/customer/home">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="font-bold">Product Details</h1>
            <p className="text-xs text-gray-400">{product.category}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="p-8">
            <div className="aspect-square bg-glass rounded-xl flex items-center justify-center mb-4">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-400 mb-4">SKU: {product.sku}</p>
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-gray-400 ml-2">(4.8)</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Location Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-accent mr-2" />
              Location Details
            </h3>
            {shelf && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Shelf:</span>
                  <span className="font-medium">{shelf.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zone:</span>
                  <span className="font-medium capitalize">{shelf.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="font-medium capitalize">{shelf.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stock:</span>
                  <span className={`font-medium ${product.stock > 10 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {product.stock} units
                  </span>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/customer/map">
            <Button variant="primary" size="lg" icon={MapPin} className="w-full">
              Navigate to Product
            </Button>
          </Link>
          
          <Button variant="secondary" size="lg" icon={ShoppingCart} className="w-full">
            Add to Smart Cart
          </Button>
          
          <Button variant="highlight" size="lg" className="w-full">
            Mark as Found
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Product Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span>{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Availability:</span>
                <span className="text-green-400">In Stock</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Updated:</span>
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