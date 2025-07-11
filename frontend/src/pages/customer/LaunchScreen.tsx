import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    icon: MapPin,
    title: 'MapMyStore',
    subtitle: 'Initializing Navigation System',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    icon: Navigation,
    title: 'Scanning Store Layout',
    subtitle: 'Detecting beacons and pathways',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Loading Smart Features',
    subtitle: 'Activating discount alerts',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    icon: CheckCircle,
    title: 'Ready to Navigate!',
    subtitle: 'Your smart shopping companion is ready',
    color: 'from-green-400 to-emerald-500',
  },
];

const LaunchScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        setIsComplete(true);
        setTimeout(() => navigate('/customer/welcome'), 1000);
        return prev;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [navigate]);

  const Icon = steps[currentStep].icon;

  return (
    <div className="w-full h-[844px] relative bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden flex flex-col items-center justify-center text-center p-6">

      {/* Floating Bubbles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
            initial={{
              x: Math.random() * 390,
              y: Math.random() * 844,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * 390,
              y: Math.random() * 844,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -50 }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="flex flex-col items-center"
          >
            {/* Glowing Icon */}
            <div className="relative mb-8">
              <motion.div
                className={`w-32 h-32 bg-gradient-to-r ${steps[currentStep].color} rounded-full flex items-center justify-center shadow-2xl`}
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(6, 182, 212, 0.4)',
                    '0 0 0 20px rgba(6, 182, 212, 0)',
                    '0 0 0 0 rgba(6, 182, 212, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Icon size={48} className="text-white" />
              </motion.div>

              {/* Rotating Ring */}
              <motion.div
                className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-cyan-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>

            {/* Titles */}
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {steps[currentStep].title}
            </motion.h1>
            <motion.p
              className="text-base text-white/70 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {steps[currentStep].subtitle}
            </motion.p>

            {/* Progress Bar */}
            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${steps[currentStep].color} rounded-full`}
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex gap-3 mt-6">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-cyan-400' : 'bg-white/20'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>

            {/* Loading Dots */}
            {!isComplete && (
              <motion.div
                className="flex justify-center gap-2 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LaunchScreen;
