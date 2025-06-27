import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

const SignUpCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const fullName = data.get('fullName')?.toString() || '';
    const email    = data.get('email')?.toString()    || '';
    const password = data.get('password')?.toString() || '';

    try {
      await axios.post('http://localhost:4000/signup', {
        fullName,
        email,
        password,
        role: 'customer'
      });
      alert('Registration successful! Please sign in.');
      navigate('/signin/customer');
    } catch (err: any) {
      console.error('Signup error →', err);
      if (err.response) {
        alert(err.response.data.error || `Signup failed (${err.response.status})`);
      } else if (err.request) {
        alert('No response from server — is it running on port 4000?');
      } else {
        alert('Signup failed: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 px-4 text-white">
      <GlassCard className="w-full max-w-md p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-500 bg-opacity-20 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.121 17.804A4 4 0 017 17h10a4 4 0 011.879.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="absolute top-4 right-4 text-sm text-green-400">● System Online</p>
        </div>

        <h2 className="text-2xl font-bold text-center mb-1">Create Account</h2>
        <p className="text-sm text-center text-gray-400 mb-4">Register as a new user</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

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
              placeholder="Create a password"
              className="w-full px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-[36px] text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Sign Up →
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/signin/customer" className="text-cyan-400 hover:underline">
            Sign In
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default SignUpCustomer;
