import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Zap, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import { mockAnalytics, mockEvents } from '../../data/mockData';

const Overview = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.setItem("role", "customer");
    localStorage.removeItem("loggedIn");
    navigate("/signin/customer");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Smart Floor Manager</h1>
          <p className="text-gray-400">Real-time analytics and store management</p>
        </div>
        <div className="flex gap-4">
         
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Users</p>
              <p className="text-3xl font-bold text-accent">{mockAnalytics.activeUsers}</p>
              <div className="flex items-center text-sm text-green-400 mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{mockAnalytics.dailyGrowth}% today
              </div>
            </div>
            <div className="h-12 w-12 bg-accent bg-opacity-20 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-accent" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Top Search</p>
              <p className="text-2xl font-bold">{mockAnalytics.topSearches[0]}</p>
              <p className="text-sm text-gray-400 mt-2">
                {mockAnalytics.topSearches.slice(1, 3).join(', ')}
              </p>
            </div>
            <div className="h-12 w-12 bg-highlight bg-opacity-20 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-highlight" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Heat Map</p>
              <p className="text-2xl font-bold">4 Zones</p>
              <p className="text-sm text-gray-400 mt-2">Real-time tracking</p>
            </div>
            <div className="h-12 w-12 bg-purple-500 bg-opacity-20 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heat Map */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Store Heat Map</h2>
          <div className="space-y-4">
            {mockAnalytics.heatmapData.map((zone, index) => (
              <motion.div
                key={zone.zone}
                className="flex items-center justify-between p-3 bg-glass rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-3 w-3 rounded-full ${
                    zone.visits > 60 ? 'bg-red-500' :
                    zone.visits > 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium capitalize">{zone.zone}</p>
                    <p className="text-sm text-gray-400">{zone.avgTime}min avg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{zone.visits}</p>
                  <p className="text-sm text-gray-400">visits</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Live Events */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Live Event Feed</h2>
          <div className="space-y-3">
            {mockEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="flex items-start space-x-3 p-3 bg-glass rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{event.message}</p>
                    <p className="text-xs text-gray-400">{event.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin/floor-designer" className="group">
            <div className="p-4 bg-glass rounded-xl hover:bg-white hover:bg-opacity-10 transition-all cursor-pointer">
              <MapPin className="h-8 w-8 text-accent mb-2" />
              <p className="font-medium mb-1">Floor Designer</p>
              <p className="text-sm text-gray-400">Edit store layout</p>
              <ArrowRight className="h-4 w-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link to="/admin/products" className="group">
            <div className="p-4 bg-glass rounded-xl hover:bg-white hover:bg-opacity-10 transition-all cursor-pointer">
              <Zap className="h-8 w-8 text-highlight mb-2" />
              <p className="font-medium mb-1">Products</p>
              <p className="text-sm text-gray-400">Manage inventory</p>
              <ArrowRight className="h-4 w-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link to="/admin/discounts" className="group">
            <div className="p-4 bg-glass rounded-xl hover:bg-white hover:bg-opacity-10 transition-all cursor-pointer">
              <TrendingUp className="h-8 w-8 text-purple-400 mb-2" />
              <p className="font-medium mb-1">Discounts</p>
              <p className="text-sm text-gray-400">Create offers</p>
              <ArrowRight className="h-4 w-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link to="/admin/beacons" className="group">
            <div className="p-4 bg-glass rounded-xl hover:bg-white hover:bg-opacity-10 transition-all cursor-pointer">
              <Users className="h-8 w-8 text-green-400 mb-2" />
              <p className="font-medium mb-1">Beacons</p>
              <p className="text-sm text-gray-400">Monitor devices</p>
              <ArrowRight className="h-4 w-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Overview;
