import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Zap, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { mockEvents } from '../../data/mockData';

const mockSalesByDay = [
  { day: 'Mon', sales: 120 },
  { day: 'Tue', sales: 160 },
  { day: 'Wed', sales: 200 },
  { day: 'Thu', sales: 240 },
  { day: 'Fri', sales: 310 },
  { day: 'Sat', sales: 450 },
  { day: 'Sun', sales: 380 }
];

const Overview = () => {
  const navigate = useNavigate();
  const [customerCount, setCustomerCount] = useState(0);
  const [topSearches, setTopSearches] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/customers/count')
      .then(res => res.json())
      .then(data => setCustomerCount(data.total || 0))
      .catch(() => setCustomerCount(0));
  }, []);

  useEffect(() => {
    const fetchTopSearches = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/search/top?" + Date.now());
        const data = await res.json();
        setTopSearches(data.topSearches || []);
      } catch (err) {
        console.error("Failed to load top searches:", err);
      }
    };
    fetchTopSearches();
  }, []);

  return (
    <div
      className="relative overflow-visible p-8 space-y-10 min-h-screen text-gray-900 text-xl bg-transparent"
      style={{ overflowX: 'visible', overflowY: 'visible', background: 'transparent' }}
    >
      {/* 🍥 Floating Glass Shapes */}
      <div
        className="absolute top-0 left-0 w-80 h-80 bg-blue-200/60 rounded-full blur-lg"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 bg-blue-100/60 rounded-2xl blur-lg"
        style={{ zIndex: 0 }}
      />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-1">Smart Floor Manager</h1>
          <p className="text-gray-500 text-lg">Real-time analytics and store management</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-lg mb-1">Active Users</p>
              <p className="text-4xl font-semibold text-blue-500">{customerCount}</p>
            </div>
            <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-7 w-7 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-lg mb-1">Top Search</p>
              <p className="text-3xl font-semibold">{topSearches[0] || 'N/A'}</p>
            </div>
            <div className="h-14 w-14 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Zap className="h-7 w-7 text-yellow-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-lg mb-1">Heat Map</p>
              <p className="text-3xl font-semibold">5 Zones</p>
              <p className="text-base text-gray-400 mt-2">Real-time tracking</p>
            </div>
            <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <MapPin className="h-7 w-7 text-purple-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Sales & Events */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-4">Weekly Sales Overview</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mockSalesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 14 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 14 }} />
              <Tooltip contentStyle={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db' }} />
              <Bar dataKey="sales" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="text-2xl font-semibold mb-4">Live Event Feed</h2>
          <div className="space-y-4">
            {mockEvents.map((event, idx) => (
              <motion.div
                key={`${event.id}-${idx}`}
                className="p-4 bg-white/40 rounded-xl flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <span
                  className={`h-3 w-3 rounded-full ${
                    event.type === 'success'
                      ? 'bg-green-500'
                      : event.type === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                />
                <p className="text-lg flex-1 ml-4">{event.message}</p>
                <span className="text-sm text-gray-500">{event.time}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="relative z-10">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link to="/admin/floor-designer">
            <GlassCard className="hover:scale-105 transition p-6 text-center">
              <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold mb-1">Floor Designer</p>
              <p className="text-gray-500 text-sm">Edit store layout</p>
            </GlassCard>
          </Link>

          <Link to="/admin/products">
            <GlassCard className="hover:scale-105 transition p-6 text-center">
              <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="font-semibold mb-1">Products</p>
              <p className="text-gray-500 text-sm">Manage inventory</p>
            </GlassCard>
          </Link>

          <Link to="/admin/discounts">
            <GlassCard className="hover:scale-105 transition p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="font-semibold mb-1">Discounts</p>
              <p className="text-gray-500 text-sm">Create offers</p>
            </GlassCard>
          </Link>

          <Link to="/admin/beacons">
            <GlassCard className="hover:scale-105 transition p-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-semibold mb-1">Beacons</p>
              <p className="text-gray-500 text-sm">Monitor devices</p>
            </GlassCard>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Overview;
