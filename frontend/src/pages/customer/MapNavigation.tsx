import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, Target, ArrowLeft, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import { mockShelves, mockZones } from '../../data/mockData';
import { Position } from '../../types';

const MapNavigation = () => {
  const [userPosition, setUserPosition] = useState<Position>({ x: 60, y: 60 });
  const [destination, setDestination] = useState<Position | null>(null);
  const [showOffer, setShowOffer] = useState(false);
  const [navigationInstructions, setNavigationInstructions] = useState<string>('');
  const [currentZone, setCurrentZone] = useState<string>('entrance');

  // Mock auto-movement
  useEffect(() => {
    const interval = setInterval(() => {
      setUserPosition(prev => ({
        x: prev.x + (Math.random() - 0.5) * 2,
        y: prev.y + (Math.random() - 0.5) * 2
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Check for zone entry and offers
  useEffect(() => {
    const zone = mockZones.find(z => 
      userPosition.x >= z.bounds.x && 
      userPosition.x <= z.bounds.x + z.bounds.width &&
      userPosition.y >= z.bounds.y && 
      userPosition.y <= z.bounds.y + z.bounds.height
    );

    if (zone && zone.id !== currentZone) {
      setCurrentZone(zone.id);
      
      // Trigger zone-based offers
      if (zone.id === 'snacks') {
        setShowOffer(true);
        setTimeout(() => setShowOffer(false), 5000);
      }
    }
  }, [userPosition, currentZone]);

  const navigateToShelf = (shelfId: string) => {
    const shelf = mockShelves.find(s => s.id === shelfId);
    if (shelf) {
      setDestination({ x: shelf.x + shelf.width / 2, y: shelf.y + shelf.height / 2 });
      setNavigationInstructions(`Navigate to ${shelf.type} shelf in ${shelf.zone} zone`);
    }
  };

  const calculateDistance = (pos1: Position, pos2: Position) => {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  };

  const isNearDestination = destination ? calculateDistance(userPosition, destination) < 20 : false;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-glass backdrop-blur-md border-b border-glass p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/customer/home">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="font-bold">Store Map</h1>
            <p className="text-xs text-gray-400">Interactive navigation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        {/* Store Layout */}
        <div className="absolute inset-0 p-4">
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
                backgroundColor: zone.color + '15'
              }}
            >
              <div 
                className="absolute -top-5 left-1 text-xs font-medium px-2 py-1 rounded"
                style={{ backgroundColor: zone.color + '30', color: zone.color }}
              >
                {zone.name}
              </div>
            </div>
          ))}

          {/* Shelves */}
          {mockShelves.map((shelf) => (
            <motion.div
              key={shelf.id}
              className="absolute bg-gray-600 rounded cursor-pointer hover:bg-gray-500 transition-colors"
              style={{
                left: shelf.x,
                top: shelf.y,
                width: shelf.width,
                height: shelf.height,
              }}
              onClick={() => navigateToShelf(shelf.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                {shelf.id.split('-')[1]}
              </div>
            </motion.div>
          ))}

          {/* User Position */}
          <motion.div
            className="absolute w-4 h-4 bg-accent rounded-full shadow-glow z-10"
            style={{
              left: userPosition.x - 8,
              top: userPosition.y - 8,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-75"></div>
          </motion.div>

          {/* Destination */}
          {destination && (
            <motion.div
              className="absolute w-6 h-6 z-10"
              style={{
                left: destination.x - 12,
                top: destination.y - 12,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <MapPin className="h-6 w-6 text-highlight" />
            </motion.div>
          )}

          {/* Navigation Path */}
          {destination && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
              <motion.line
                x1={userPosition.x}
                y1={userPosition.y}
                x2={destination.x}
                y2={destination.y}
                stroke="#00D3FF"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  strokeDashoffset: [0, -10]
                }}
                transition={{
                  pathLength: { duration: 1 },
                  strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              />
            </svg>
          )}
        </div>
      </div>

      {/* Navigation Instructions */}
      {navigationInstructions && (
        <motion.div
          className="mx-4 mb-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent bg-opacity-20 rounded-full flex items-center justify-center">
                <Navigation className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{navigationInstructions}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isNearDestination ? '🎉 You have arrived!' : 'Follow the blue path'}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Zone Offer Popup */}
      {showOffer && (
        <motion.div
          className="absolute bottom-20 left-4 right-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <GlassCard className="p-4 bg-highlight bg-opacity-10 border-highlight">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-highlight bg-opacity-20 rounded-full flex items-center justify-center">
                <Gift className="h-6 w-6 text-highlight" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-highlight">Special Offer!</h3>
                <p className="text-sm">15% off all snacks in this zone</p>
                <Button variant="highlight" size="sm" className="mt-2">
                  Add to Cart
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="p-4 bg-glass backdrop-blur-md border-t border-glass">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Current Zone: <span className="text-white capitalize">{currentZone}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" icon={Target}>
              Find Product
            </Button>
            <Link to="/customer/cart">
              <Button variant="primary" size="sm">
                Cart (0)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapNavigation;