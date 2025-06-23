import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Save, RotateCcw, Trash2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import { mockShelves, mockZones } from '../../data/mockData';
import { Shelf } from '../../types';

const FloorPlanDesigner = () => {
  const [shelves, setShelves] = useState<Shelf[]>(mockShelves);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [showShelfPalette, setShowShelfPalette] = useState(true);

  const shelfTypes = [
    { type: 'aisle', name: 'Aisle Shelf', color: '#00D3FF', width: 120, height: 40 },
    { type: 'endcap', name: 'End Cap', color: '#FFB547', width: 80, height: 60 },
    { type: 'island', name: 'Promo Island', color: '#8B5CF6', width: 100, height: 80 },
    { type: 'checkout', name: 'Checkout', color: '#EF4444', width: 60, height: 40 },
  ];

  const addShelf = (type: Shelf['type']) => {
    const newShelf: Shelf = {
      id: `shelf-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: shelfTypes.find(t => t.type === type)?.width || 120,
      height: shelfTypes.find(t => t.type === type)?.height || 40,
      zone: 'unassigned',
      capacity: 50,
      products: []
    };
    setShelves([...shelves, newShelf]);
  };

  const deleteShelf = (shelfId: string) => {
    setShelves(shelves.filter(s => s.id !== shelfId));
    if (selectedShelf?.id === shelfId) {
      setSelectedShelf(null);
    }
  };

  const updateShelf = (updatedShelf: Shelf) => {
    setShelves(shelves.map(s => s.id === updatedShelf.id ? updatedShelf : s));
    setSelectedShelf(updatedShelf);
  };

  return (
    <div className="h-full flex">
      {/* Shelf Palette */}
      <motion.div
        className="w-80 bg-glass backdrop-blur-md border-r border-glass p-4 space-y-4"
        initial={{ x: -320 }}
        animate={{ x: showShelfPalette ? 0 : -320 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shelf Palette</h2>
          <Button size="sm" onClick={() => setShowShelfPalette(!showShelfPalette)}>
            {showShelfPalette ? '←' : '→'}
          </Button>
        </div>

        <div className="space-y-3">
          {shelfTypes.map((shelfType) => (
            <motion.div
              key={shelfType.type}
              className="p-4 bg-glass rounded-xl cursor-pointer hover:bg-white hover:bg-opacity-10 transition-all"
              whileHover={{ scale: 1.02 }}
              onClick={() => addShelf(shelfType.type as Shelf['type'])}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-6 rounded"
                  style={{ backgroundColor: shelfType.color }}
                />
                <div>
                  <p className="font-medium">{shelfType.name}</p>
                  <p className="text-sm text-gray-400">{shelfType.width}×{shelfType.height}px</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t border-glass">
          <h3 className="font-medium mb-3">Actions</h3>
          <div className="space-y-2">
            <Button variant="secondary" size="sm" icon={Save} className="w-full">
              Save Layout
            </Button>
            <Button variant="secondary" size="sm" icon={Download} className="w-full">
              Export QR Pack
            </Button>
            <Button variant="secondary" size="sm" icon={RotateCcw} className="w-full">
              Reset Layout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-glass backdrop-blur-md border-b border-glass flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Floor Plan Designer</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">{shelves.length} shelves</span>
            <Button variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden bg-gray-900">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Zones */}
          {mockZones.map((zone) => (
            <div
              key={zone.id}
              className="absolute border border-dashed border-opacity-50 rounded-lg"
              style={{
                left: zone.bounds.x,
                top: zone.bounds.y,
                width: zone.bounds.width,
                height: zone.bounds.height,
                borderColor: zone.color,
                backgroundColor: zone.color + '20'
              }}
            >
              <div 
                className="absolute -top-6 left-2 text-xs font-medium px-2 py-1 rounded"
                style={{ backgroundColor: zone.color, color: '#101014' }}
              >
                {zone.name}
              </div>
            </div>
          ))}

          {/* Shelves */}
          {shelves.map((shelf) => {
            const shelfType = shelfTypes.find(t => t.type === shelf.type);
            return (
              <motion.div
                key={shelf.id}
                className={`absolute cursor-pointer rounded shadow-lg ${
                  selectedShelf?.id === shelf.id ? 'ring-2 ring-accent' : ''
                }`}
                style={{
                  left: shelf.x,
                  top: shelf.y,
                  width: shelf.width,
                  height: shelf.height,
                  backgroundColor: shelfType?.color,
                }}
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  updateShelf({
                    ...shelf,
                    x: Math.max(0, shelf.x + info.offset.x),
                    y: Math.max(0, shelf.y + info.offset.y)
                  });
                }}
                onClick={() => setSelectedShelf(shelf)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-full h-full flex items-center justify-center text-primary text-xs font-medium">
                  {shelf.id.split('-')[1]}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedShelf && (
        <motion.div
          className="w-80 bg-glass backdrop-blur-md border-l border-glass p-4 space-y-4"
          initial={{ x: 320 }}
          animate={{ x: 0 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Properties</h2>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() => deleteShelf(selectedShelf.id)}
            >
              Delete
            </Button>
          </div>

          <GlassCard className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shelf ID</label>
                <input
                  type="text"
                  value={selectedShelf.id}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={selectedShelf.type}
                  onChange={(e) => updateShelf({ ...selectedShelf, type: e.target.value as Shelf['type'] })}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                >
                  {shelfTypes.map((type) => (
                    <option key={type.type} value={type.type}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Zone</label>
                <select
                  value={selectedShelf.zone}
                  onChange={(e) => updateShelf({ ...selectedShelf, zone: e.target.value })}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                >
                  <option value="unassigned">Unassigned</option>
                  {mockZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Capacity</label>
                <input
                  type="number"
                  value={selectedShelf.capacity}
                  onChange={(e) => updateShelf({ ...selectedShelf, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Width</label>
                  <input
                    type="number"
                    value={selectedShelf.width}
                    onChange={(e) => updateShelf({ ...selectedShelf, width: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height</label>
                  <input
                    type="number"
                    value={selectedShelf.height}
                    onChange={(e) => updateShelf({ ...selectedShelf, height: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-2">
            <h3 className="font-medium">Quick Actions</h3>
            <Button variant="secondary" size="sm" className="w-full">
              Assign Products
            </Button>
            <Button variant="secondary" size="sm" className="w-full">
              View Analytics
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FloorPlanDesigner;