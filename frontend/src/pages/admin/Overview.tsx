import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Zap, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import { mockAnalytics, mockEvents } from '../../data/mockData';
 import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';


const Overview = () => {
  const navigate = useNavigate();
  const [customerCount, setCustomerCount] = useState(0);
  const [topSearches, setTopSearches] = useState<string[]>([]);

  const handleLogout = () => {
    localStorage.setItem("role", "customer");
    localStorage.removeItem("loggedIn");
    navigate("/signin/customer");
  };
 
const mockSalesByDay = [
  { day: 'Mon', sales: 120 },
  { day: 'Tue', sales: 160 },
  { day: 'Wed', sales: 200 },
  { day: 'Thu', sales: 240 },
  { day: 'Fri', sales: 310 },
  { day: 'Sat', sales: 450 },
  { day: 'Sun', sales: 380 }
];
// --------------------top search-------------------------------------------------
useEffect(() => {
  const fetchTopSearches = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/search/top?" + new Date().getTime()); // prevent caching
      const data = await res.json();
      console.log("[Top Search Data]", data);
      setTopSearches(data.topSearches || []);
    } catch (err) {
      console.error("Failed to load top searches:", err);
    }
  };

  fetchTopSearches();
}, []);


  // Fetch live active users from backend
useEffect(() => {
  fetch('http://localhost:4000/api/customers/count')
    .then(res => res.json())
    .then(data => setCustomerCount(data.total || 0))
    .catch(err => {
      console.error("Failed to fetch customer count:", err);
      setCustomerCount(0);
    });
}, []);


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Smart Floor Manager</h1>
          <p className="text-gray-400">Real-time analytics and store management</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
             <p className="text-gray-400 text-sm mb-1">Active Users</p>
             <p className="text-3xl font-bold text-accent">{customerCount}</p>

              {/* <div className="flex items-center text-sm text-green-400 mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{mockAnalytics.dailyGrowth}% today
              </div> */}
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
                  <p className="text-2xl font-bold">
                    {topSearches.length > 0 ? topSearches[0] : "N/A"}
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
              <p className="text-2xl font-bold">5 Zones</p>
              <p className="text-sm text-gray-400 mt-2">Real-time tracking</p>
            </div>
            <div className="h-12 w-12 bg-purple-500 bg-opacity-20 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Heat Map and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <GlassCard className="p-6">
  <h2 className="text-xl font-semibold mb-4">Weekly Sales Overview</h2>
  <ResponsiveContainer width="100%" height={220}>
    <BarChart
      data={mockSalesByDay}
      margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
      <XAxis dataKey="day" tick={{ fill: '#aaa' }} />
      <YAxis tick={{ fill: '#aaa' }} />
      <Tooltip contentStyle={{ backgroundColor: "#222", borderColor: "#444" }} />
      <Bar dataKey="sales" fill="#38bdf8" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</GlassCard>

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
