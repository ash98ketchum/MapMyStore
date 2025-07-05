// src/pages/ProductLocationManager.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, MapPin, Package, Filter } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button    from '../../components/ui/Button';
import { mockProducts } from '../../data/mockData';
import { Product } from '../../types';

interface LocationRecord {
  productId:  string;
  quantity:   number;
  shelfId:    string;
  shelfType:  string;
  shelfLabel: string;
  zone:       string;
}

export default function ProductLocationManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shelves, setShelves]   = useState<LocationRecord[]>([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct]     = useState<Product|null>(null);

  // fetch product-locations once
  useEffect(() => {
    (async () => {
      try {
        const locs: LocationRecord[] = await fetch('/api/product-locations')
          .then(r=>r.json());
        setShelves(locs);

        // join with mockProducts metadata:
        const prods: Product[] = locs.map(loc => {
          const meta = mockProducts.find(p=>p.id===loc.productId) || {
            id:loc.productId, name:'Unknown', sku:'—', category:'—'
          };
          return {
            ...meta,
            shelfId: loc.shelfId,
            stock:   loc.quantity,
          };
        });
        setProducts(prods);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p=>p.category)))];

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchesCategory = selectedCategory==='all' || p.category===selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateProduct = async (prod: Product) => {
    // call server
    await fetch('/api/product-locations', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        productId: prod.id,
        shelfId:   prod.shelfId,
        qty:       prod.stock
      })
    });
    // refresh
    const locs: LocationRecord[] = await fetch('/api/product-locations').then(r=>r.json());
    setShelves(locs);
    setProducts(locs.map(loc => {
      const meta = mockProducts.find(p=>p.id===loc.productId) || {
        id:loc.productId, name:'Unknown', sku:'—', category:'—'
      };
      return { ...meta, shelfId:loc.shelfId, stock:loc.quantity };
    }));
    setEditingProduct(null);
  };

  const getShelf = (id:string) => {
    return shelves.find(s => s.shelfId===id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Location Manager</h1>
          <p className="text-gray-400">Manage inventory & shelf assignments</p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <input
              type="text"
              placeholder="Search products, SKU..."
              value={searchQuery}
              onChange={e=>setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-glass rounded-xl border border-glass focus:border-accent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-400"/>
            <select
              value={selectedCategory}
              onChange={e=>setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-glass rounded-xl border border-glass focus:border-accent"
            >
              {categories.map(c=>(
                <option key={c} value={c}>
                  {c==='all' ? 'All Categories' : c}
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
              {filteredProducts.map((product,i)=> {
                const shelf = getShelf(product.shelfId);
                return (
                <motion.tr
                  key={product.id}
                  className="border-b border-glass hover:bg-glass hover:bg-opacity-50"
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.03 }}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-glass rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400"/>
                      </div>
                      <p className="font-medium">{product.name}</p>
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
                        <MapPin className="h-4 w-4 text-accent"/>
                        <div>
                          <p className="font-medium">{shelf.shelfLabel}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            {shelf.zone} – {shelf.shelfType}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock > 20
                        ? 'bg-green-500 bg-opacity-20 text-green-400'
                        : product.stock > 5
                        ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        : 'bg-red-500 bg-opacity-20 text-red-400'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit}
                      onClick={()=>setEditingProduct(product)}
                    >
                      Edit
                    </Button>
                  </td>
                </motion.tr>
              )})}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Edit Modal */}
      {editingProduct && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
        >
          <motion.div
            className="bg-primary border border-glass rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ scale:0.9, opacity:0 }}
            animate={{ scale:1,   opacity:1 }}
          >
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass"
                  value={editingProduct.name}
                  onChange={e=>setEditingProduct({
                    ...editingProduct!,
                    name:e.target.value
                  })}
                />
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass"
                  value={editingProduct.category}
                  onChange={e=>setEditingProduct({
                    ...editingProduct!,
                    category:e.target.value
                  })}
                >
                  {categories.slice(1).map(c=>(
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {/* Shelf */}
              <div>
                <label className="block text-sm font-medium mb-1">Shelf</label>
                <select
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass"
                  value={editingProduct.shelfId}
                  onChange={e=>setEditingProduct({
                    ...editingProduct!,
                    shelfId:e.target.value
                  })}
                >
                  <option value="">Unassigned</option>
                  {shelves.map(s=>(
                    <option key={s.shelfId} value={s.shelfId}>
                      {s.shelfLabel} – {s.zone} ({s.shelfType})
                    </option>
                  ))}
                </select>
              </div>
              {/* Stock */}
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass"
                  value={editingProduct.stock}
                  onChange={e=>setEditingProduct({
                    ...editingProduct!,
                    stock: Number(e.target.value)
                  })}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="primary"
                className="flex-1"
                onClick={()=>updateProduct(editingProduct!)}
              >
                Save Changes
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={()=>setEditingProduct(null)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-accent">{products.length}</p>
          <p className="text-sm text-gray-400">Total Products</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {products.filter(p=>p.stock>20).length}
          </p>
          <p className="text-sm text-gray-400">Well Stocked</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {products.filter(p=>p.stock<=20 && p.stock>5).length}
          </p>
          <p className="text-sm text-gray-400">Low Stock</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {products.filter(p=>p.stock<=5).length}
          </p>
          <p className="text-sm text-gray-400">Critical Stock</p>
        </GlassCard>
      </div>
    </div>
  );
}
