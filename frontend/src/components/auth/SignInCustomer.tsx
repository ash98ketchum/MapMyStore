import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import api from '../../lib/api';


const SignInCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email    = data.get('email')?.toString()    || '';
    const password = data.get('password')?.toString() || '';
    const role     = isAdmin ? 'admin' : 'customer';

    try {
      const res = await axios.post('/signin', { email, password, role });
      localStorage.setItem('token', res.data.token);
      navigate(role === 'admin' ? '/admin' : '/customer');
    } catch (err: any) {
      console.error('Signin customer error →', err);
      if (err.response) {
        alert(err.response.data.error || `Login failed (${err.response.status})`);
      } else if (err.request) {
        alert('No response from server — is it running?');
      } else {
        alert('Login failed: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 px-4 text-white">
      <GlassCard className="w-full max-w-md p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-500 bg-opacity-20 flex items-center justify-center mx-auto">
            {/* icon */}
          </div>
          <p className="absolute top-4 right-4 text-sm text-green-400">● System Online</p>
        </div>

        <h2 className="text-2xl font-bold text-center mb-1">Welcome Back</h2>
        <p className="text-sm text-center text-gray-400 mb-4">Sign in to Smart Floor Manager</p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setIsAdmin(true)}
            className={`px-4 py-1 text-sm rounded-full border ${isAdmin ? 'bg-cyan-500 text-white' : 'border-gray-600 text-gray-400'}`}
          >
            Admin
          </button>
          <button
            onClick={() => setIsAdmin(false)}
            className={`px-4 py-1 text-sm rounded-full border ${!isAdmin ? 'bg-cyan-500 text-white' : 'border-gray-600 text-gray-400'}`}
          >
            Customer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-[36px] text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox bg-gray-800 border-gray-600" />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-cyan-400 hover:underline">Forgot password?</button>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Sign In →
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Don’t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate(isAdmin ? '/signup/admin' : '/signup/customer')}
            className="text-cyan-400 hover:underline"
          >
            Register
          </button>
        </p>
      </GlassCard>
    </div>
  );
};

export default SignInCustomer;
