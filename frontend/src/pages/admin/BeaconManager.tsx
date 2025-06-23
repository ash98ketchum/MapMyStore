import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Radio, QrCode, Battery, AlertTriangle, Play, Pause } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import { mockBeacons } from '../../data/mockData';
import { Beacon } from '../../types';

const BeaconManager = () => {
  const [beacons, setBeacons] = useState<Beacon[]>(mockBeacons);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [selectedBeacon, setSelectedBeacon] = useState<Beacon | null>(null);

  const getStatusColor = (status: Beacon['status']) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500';
      case 'offline': return 'text-red-400 bg-red-500';
      case 'mock': return 'text-yellow-400 bg-yellow-500';
      default: return 'text-gray-400 bg-gray-500';
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const toggleBeaconStatus = (beaconId: string) => {
    setBeacons(beacons.map(beacon => {
      if (beacon.id === beaconId) {
        const newStatus = beacon.status === 'online' ? 'offline' : 'online';
        return { ...beacon, status: newStatus };
      }
      return beacon;
    }));
  };

  const simulateBeacon = (beacon: Beacon) => {
    setBeacons(beacons.map(b => 
      b.id === beacon.id ? { ...b, status: 'mock' as const } : b
    ));
    setShowSimulateModal(false);
    setSelectedBeacon(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">QR / BLE Beacon Manager</h1>
          <p className="text-gray-400">Monitor and manage positioning beacons</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" icon={Plus}>
            Add Beacon
          </Button>
          <Button variant="primary" icon={Play} onClick={() => setShowSimulateModal(true)}>
            Simulate Beacon
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-accent">{beacons.length}</p>
          <p className="text-sm text-gray-400">Total Beacons</p>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {beacons.filter(b => b.status === 'online').length}
          </p>
          <p className="text-sm text-gray-400">Online</p>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {beacons.filter(b => b.status === 'offline').length}
          </p>
          <p className="text-sm text-gray-400">Offline</p>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {beacons.filter(b => b.status === 'mock').length}
          </p>
          <p className="text-sm text-gray-400">Simulated</p>
        </GlassCard>
      </div>

      {/* Beacons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beacons.map((beacon, index) => {
          const Icon = beacon.type === 'qr' ? QrCode : Radio;
          const statusColor = getStatusColor(beacon.status);
          
          return (
            <motion.div
              key={beacon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6  hover:bg-white hover:bg-opacity-5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-glass rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{beacon.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{beacon.type} Beacon</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${statusColor} bg-opacity-20`}>
                      <div className={`w-full h-full rounded-full ${statusColor.split(' ')[1]} animate-pulse`}></div>
                    </div>
                    <span className={`text-xs font-medium ${statusColor.split(' ')[0]} capitalize`}>
                      {beacon.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Zone:</span>
                    <span className="capitalize">{beacon.zoneId}</span>
                  </div>
                  
                  {beacon.batteryLevel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Battery:</span>
                      <div className="flex items-center space-x-2">
                        <Battery className={`h-4 w-4 ${getBatteryColor(beacon.batteryLevel)}`} />
                        <span className={getBatteryColor(beacon.batteryLevel)}>
                          {beacon.batteryLevel}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {beacon.lastSeen && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Seen:</span>
                      <span>2 min ago</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 mt-4 pt-4 border-t border-glass">
                  <Button
                    variant={beacon.status === 'online' ? 'secondary' : 'primary'}
                    size="sm"
                    icon={beacon.status === 'online' ? Pause : Play}
                    onClick={() => toggleBeaconStatus(beacon.id)}
                    className="flex-1"
                  >
                    {beacon.status === 'online' ? 'Disable' : 'Enable'}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedBeacon(beacon);
                      setShowSimulateModal(true);
                    }}
                    className="flex-1"
                  >
                    Simulate
                  </Button>
                </div>

                {beacon.batteryLevel && beacon.batteryLevel < 20 && (
                  <div className="flex items-center space-x-2 mt-3 p-2 bg-red-500 bg-opacity-10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-xs text-red-400">Low battery warning</span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Simulate Beacon Modal */}
      {showSimulateModal && (
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
            <h2 className="text-xl font-bold mb-4">Simulate Beacon</h2>
            
            {selectedBeacon ? (
              <div className="space-y-4">
                <div className="p-4 bg-glass rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    {selectedBeacon.type === 'qr' ? (
                      <QrCode className="h-6 w-6 text-accent" />
                    ) : (
                      <Radio className="h-6 w-6 text-accent" />
                    )}
                    <div>
                      <h3 className="font-semibold">{selectedBeacon.name}</h3>
                      <p className="text-sm text-gray-400">Zone: {selectedBeacon.zoneId}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mock Proximity Radius (meters)</label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Simulation Duration</label>
                  <select className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none">
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <Button
                    variant="primary"
                    onClick={() => simulateBeacon(selectedBeacon)}
                    className="flex-1"
                  >
                    Start Simulation
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowSimulateModal(false);
                      setSelectedBeacon(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 mb-4">Select a beacon to simulate:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {beacons.map((beacon) => (
                    <div
                      key={beacon.id}
                      className="p-3 bg-glass rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-10 transition-colors"
                      onClick={() => setSelectedBeacon(beacon)}
                    >
                      <div className="flex items-center space-x-3">
                        {beacon.type === 'qr' ? (
                          <QrCode className="h-5 w-5 text-accent" />
                        ) : (
                          <Radio className="h-5 w-5 text-accent" />
                        )}
                        <div>
                          <p className="font-medium">{beacon.name}</p>
                          <p className="text-sm text-gray-400">Zone: {beacon.zoneId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowSimulateModal(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BeaconManager;