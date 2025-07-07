import React from 'react';
import { Outlet } from 'react-router-dom';
import Chatbot from '../ui/Chatbot';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-primary text-white max-w-sm mx-auto relative overflow-hidden">
      {/* Mobile PWA Container */}
      <div className="h-screen flex flex-col">
        <Outlet />
      </div>
      <Chatbot />
    </div>
  );
};

export default CustomerLayout;