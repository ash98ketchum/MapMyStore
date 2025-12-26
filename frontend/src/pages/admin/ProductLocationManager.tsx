// src/pages/ProductLocationManager.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, MapPin, Package, Filter } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import { mockProducts } from '../../data/mockData';
import { Product } from '../../types';
import { api } from '../../config.ts';
interface LocationRecord {
  productId: string;
  quantity: number;
  shelfId: string;
  shelfType: string;
  shelfLabel: string;
  zone: string;
}

export default function ProductLocationManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shelves, setShelves] = useState<LocationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const locs: LocationRecord[] = await fetch(api('/api/product-locations')).then(r => r.json());
        setShelves(locs);
        console.log("MOCK PRODUCTS:", mockProducts);

        const prods: Product[] = locs.map(loc => {
        const meta = mockProducts.find(p => p.id === loc.productId);
        console.log("Meta for", loc.productId, "→", meta);
        return {
          id: loc.productId,
          name: meta?.name || 'Unknown',
          sku: meta?.sku || '—',
          category: meta?.category || '—',
          imageUrl: meta?.imageUrl || '', 
          shelfId: loc.shelfId,
          stock: loc.quantity,
        };
      });

        setProducts(prods);
        console.log("Product Images Check:", prods.map(p => [p.name, p.imageUrl]));

      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
      (selectedCategory === 'all' || p.category === selectedCategory)
    );
  });

  const updateProduct = async (prod: Product) => {
    await fetch(api('/api/product-locations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: prod.id,
        shelfId: prod.shelfId,
        qty: prod.stock,
      }),
    });
    const locs: LocationRecord[] = await fetch(api('/api/product-locations')).then(r => r.json());
    setShelves(locs);
    setProducts(
      locs.map(loc => {
        const meta = mockProducts.find(p => p.id === loc.productId);
        return {
          id: loc.productId,
          name: meta?.name || 'Unknown',
          sku: meta?.sku || '—',
          category: meta?.category || '—',
          imageUrl: meta?.imageUrl || '',
          shelfId: loc.shelfId,
          stock: loc.quantity,
        };
      })
    );
    setEditingProduct(null);
  };

  const getShelf = (id: string) => shelves.find(s => s.shelfId === id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-black">Product Location Manager</h1>
          <p className="text-gray-500">Manage inventory & shelf assignments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-6 bg-blue-200/30 backdrop-blur-xl border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/60" />
            <input
              type="text"
              placeholder="Search products, SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/40 backdrop-blur-md text-black rounded-xl border border-white/20 focus:border-accent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-black/50" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white/40 backdrop-blur-md text-black rounded-xl border border-white/20"
            >
              {categories.map(c => (
                <option key={c} value={c} className="text-black">
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, i) => {
          const shelf = getShelf(product.shelfId);
          console.log("Rendering Product:", product.name, "→", product.imageUrl);

          return (
            <motion.div
              key={product.id}
              className="rounded-2xl p-6 bg-white backdrop-blur-lg border border-white/20 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center mb-4 space-x-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/30 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.log('Image failed for', product.name);
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                    }}
                  />
                ) : (
                  <Package className="h-7 w-7 text-black/80" />
                  )}
                </div>

                <div>
                  <p className="text-xl font-semibold text-black">{product.name}</p>
                  <p className="text-base text-black/60 font-mono">{product.sku}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-base text-black/80">
                  <span className="font-semibold">Category:</span>{' '}
                  <span className="bg-white/30 px-2 py-1 rounded-full text-sm">{product.category}</span>
                </p>
              </div>

              <div className="mb-3">
                {shelf ? (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-base font-semibold text-black">{shelf.shelfLabel}</p>
                      <p className="text-sm text-black/70 capitalize">
                        {shelf.zone} – {shelf.shelfType}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="italic text-base text-black/60">Unassigned</p>
                )}
              </div>

              <div className="mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-sm font-semibold ${
                    product.stock > 20
                      ? 'bg-green-500/20 text-green-700'
                      : product.stock > 5
                      ? 'bg-yellow-400/30 text-yellow-800'
                      : 'bg-red-500/20 text-red-700'
                  }`}
                >
                  {product.stock} units
                </span>
              </div>

              <div className="text-right">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit}
                  onClick={() => setEditingProduct(product)}
                  className="!text-base !font-medium !bg-white/20 !text-black !border !border-white/30 !backdrop-blur-md hover:!bg-accent/40"
                >
                  Edit
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>


      {/* Edit Modal (unchanged) */}
      {editingProduct && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold mb-4 text-black">Edit Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Name</label>
                <input
                  className="w-full px-3 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-black"
                  value={editingProduct.name}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Category</label>
                <select
                  className="w-full px-3 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-black"
                  value={editingProduct.category}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                >
                  {categories.slice(1).map(c => (
                    <option key={c} value={c} className="text-black">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Shelf</label>
                <select
                  className="w-full px-3 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-black"
                  value={editingProduct.shelfId}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, shelfId: e.target.value })
                  }
                >
                  <option value="" className="text-black">
                    Unassigned
                  </option>
                  {shelves.map(s => (
                    <option key={s.shelfId} value={s.shelfId} className="text-black">
                      {s.shelfLabel} – {s.zone} ({s.shelfType})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Stock</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-black"
                  value={editingProduct.stock}
                  onChange={e =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="primary"
                onClick={() => updateProduct(editingProduct)}
                className="flex-1 !bg-white/20 !text-black !border !border-white/30 !backdrop-blur-md hover:!bg-accent/30 py-2 text-base"
              >
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditingProduct(null)}
                className="flex-1 !bg-white/20 !text-black !border !border-white/30 !backdrop-blur-md hover:!bg-accent/30 py-2 text-base"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
