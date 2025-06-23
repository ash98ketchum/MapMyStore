import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Bell, Database, Download, Upload } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('roles');

  const roles = [
    { name: 'Admin', users: 2, permissions: { read: true, write: true, delete: true, manage: true } },
    { name: 'Staff', users: 8, permissions: { read: true, write: true, delete: false, manage: false } },
    { name: 'Analyst', users: 3, permissions: { read: true, write: false, delete: false, manage: false } },
  ];

  const tabs = [
    { id: 'roles', name: 'Roles & Permissions', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data Management', icon: Database },
  ];

  const togglePermission = (roleName: string, permission: string) => {
    // Mock permission toggle
    console.log(`Toggling ${permission} for ${roleName}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings & Configuration</h1>
        <p className="text-gray-400">Manage system settings and user permissions</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-glass rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-accent text-primary shadow-glow'
                  : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Role Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-glass">
                    <tr>
                      <th className="text-left p-4 font-semibold">Role</th>
                      <th className="text-left p-4 font-semibold">Users</th>
                      <th className="text-left p-4 font-semibold">Read</th>
                      <th className="text-left p-4 font-semibold">Write</th>
                      <th className="text-left p-4 font-semibold">Delete</th>
                      <th className="text-left p-4 font-semibold">Manage</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role, index) => (
                      <motion.tr
                        key={role.name}
                        className="border-b border-glass hover:bg-glass hover:bg-opacity-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-accent bg-opacity-20 rounded-lg flex items-center justify-center">
                              <Users className="h-4 w-4 text-accent" />
                            </div>
                            <span className="font-medium">{role.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">{role.users} users</td>
                        <td className="p-4">
                          <button
                            onClick={() => togglePermission(role.name, 'read')}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                              role.permissions.read
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400'
                            }`}
                          >
                            {role.permissions.read && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => togglePermission(role.name, 'write')}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                              role.permissions.write
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400'
                            }`}
                          >
                            {role.permissions.write && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => togglePermission(role.name, 'delete')}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                              role.permissions.delete
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400'
                            }`}
                          >
                            {role.permissions.delete && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => togglePermission(role.name, 'manage')}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                              role.permissions.manage
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400'
                            }`}
                          >
                            {role.permissions.manage && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-glass rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400">Require 2FA for admin accounts</p>
                  </div>
                  <button className="w-12 h-6 bg-accent rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-glass rounded-lg">
                  <div>
                    <h3 className="font-medium">Session Timeout</h3>
                    <p className="text-sm text-gray-400">Auto-logout after inactivity</p>
                  </div>
                  <select className="px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none">
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-glass rounded-lg">
                  <div>
                    <h3 className="font-medium">API Rate Limiting</h3>
                    <p className="text-sm text-gray-400">Limit API requests per minute</p>
                  </div>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-20 px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none text-center"
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-glass rounded-lg">
                  <div>
                    <h3 className="font-medium">Beacon Offline Alerts</h3>
                    <p className="text-sm text-gray-400">Get notified when beacons go offline</p>
                  </div>
                  <button className="w-12 h-6 bg-accent rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-glass rounded-lg">
                  <div>
                    <h3 className="font-medium">Low Stock Warnings</h3>
                    <p className="text-sm text-gray-400">Alert when products are running low</p>
                  </div>
                  <button className="w-12 h-6 bg-accent rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-glass rounded-lg">
                  <div>
                    <h3 className="font-medium">Daily Analytics Report</h3>
                    <p className="text-sm text-gray-400">Receive daily summary emails</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Data Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Export Data</h3>
                  <div className="space-y-3">
                    <Button variant="secondary" icon={Download} className="w-full">
                      Export Product Data
                    </Button>
                    <Button variant="secondary" icon={Download} className="w-full">
                      Export Analytics
                    </Button>
                    <Button variant="secondary" icon={Download} className="w-full">
                      Export User Activity
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Import Data</h3>
                  <div className="space-y-3">
                    <Button variant="secondary" icon={Upload} className="w-full">
                      Import Products (CSV)
                    </Button>
                    <Button variant="secondary" icon={Upload} className="w-full">
                      Import Floor Plan
                    </Button>
                    <Button variant="secondary" icon={Upload} className="w-full">
                      Import Beacon Config
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-glass">
                <h3 className="font-medium mb-4">Data Retention</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Analytics Data:</span>
                    <select className="px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none">
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                      <option value="0">Forever</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">User Activity Logs:</span>
                    <select className="px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none">
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;