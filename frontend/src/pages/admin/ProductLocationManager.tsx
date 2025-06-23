import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, MapPin, Package, Filter } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import { mockProducts, mockShelves } from '../../data/mockData';
import { Product } from '../../types';

const ProductLocationManager = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getShelfInfo = (shelfId: string) => {
    return mockShelves.find(s => s.id === shelfId);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Location Manager</h1>
          <p className="text-gray-400">Manage product inventory and shelf assignments</p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-glass rounded-xl border border-glass focus:border-accent focus:outline-none"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-glass rounded-xl border border-glass focus:border-accent focus:outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Products Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-glass border-b border-glass">
              <tr>
                <th className="text-left p-4 font-semibold">Product</th>
                <th className="text-left p-4 font-semibold">SKU</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Shelf Location</th>
                <th className="text-left p-4 font-semibold">Stock</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                const shelf = getShelfInfo(product.shelfId);
                return (
                  <motion.tr
                    key={product.id}
                    className="border-b border-glass hover:bg-glass hover:bg-opacity-50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-glass rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 font-mono">{product.sku}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-glass rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {shelf ? (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-accent" />
                          <div>
                            <p className="font-medium">{shelf.id}</p>
                            <p className="text-xs text-gray-400 capitalize">{shelf.zone} - {shelf.type}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stock > 20 ? 'bg-green-500 bg-opacity-20 text-green-400' :
                        product.stock > 5 ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                        'bg-red-500 bg-opacity-20 text-red-400'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                          onClick={() => setEditingProduct(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={MapPin}
                        >
                          Assign
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Edit Modal */}
      {editingProduct && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-primary border border-glass rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                >
                  {categories.filter(c => c !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Shelf Assignment</label>
                <select
                  value={editingProduct.shelfId}
                  onChange={(e) => setEditingProduct({...editingProduct, shelfId: e.target.value})}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                >
                  {mockShelves.map(shelf => (
                    <option key={shelf.id} value={shelf.id}>
                      {shelf.id} - {shelf.zone} ({shelf.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Stock Level</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="primary"
                onClick={() => updateProduct(editingProduct)}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditingProduct(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-accent">{products.length}</p>
          <p className="text-sm text-gray-400">Total Products</p>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {products.filter(p => p.stock > 20).length}
          </p>
          <p className="text-sm text-gray-400">Well Stocked</p>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {products.filter(p => p.stock <= 20 && p.stock > 5).length}
          </p>
          <p className="text-sm text-gray-400">Low Stock</p>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {products.filter(p => p.stock <= 5).length}
          </p>
          <p className="text-sm text-gray-400">Critical Stock</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default ProductLocationManager;