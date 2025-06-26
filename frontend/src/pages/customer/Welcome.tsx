import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Bluetooth, ArrowRight, Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const Welcome = () => {
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const handleScan = () => {
    setScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      navigate('/customer/home');
    }, 2000);
  };

  const handleDemo = () => {
    navigate('/customer/home');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary via-primary to-gray-900">
      {/* Header */}
      <div className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Scan className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to MapMyStore</h1>
          <p className="text-gray-400">Your intelligent shopping companion</p>
        </motion.div>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="relative w-80 h-80 rounded-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Mock Camera Feed */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <QrCode className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">Point camera at entrance QR</p>
            </div>
          </div>

          {/* Scanning Animation */}
          {scanning && (
            <motion.div
              className="absolute inset-0 border-4 border-accent rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Scanning Overlay */}
          <div className="absolute inset-4 border-2 border-accent border-opacity-50 rounded-xl">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent rounded-br-lg"></div>
          </div>

          {/* Scan Line Animation */}
          {scanning && (
            <motion.div
              className="absolute left-4 right-4 h-0.5 bg-accent shadow-glow"
              initial={{ top: '1rem' }}
              animate={{ top: 'calc(100% - 1rem)' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Actions */}
      <div className="p-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="primary"
            size="lg"
            icon={QrCode}
            onClick={handleScan}
            disabled={scanning}
            className="w-full mb-4"
          >
            {scanning ? 'Scanning...' : 'Scan Entrance QR'}
          </Button>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 h-px bg-glass"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-glass"></div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            icon={Bluetooth}
            className="w-full mb-4"
          >
            Use BLE Auto-detect
          </Button>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={handleDemo}
            className="text-accent hover:text-accent-600 text-sm font-medium flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Skip - Demo Mode</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-glass bg-opacity-50"></div>
    </div>
  );
};

export default Welcome;