// File: src/data/mockData.ts
// ------------------------------------------------------------
// Complete mock data set, fully compatible with the **flattened
// Zone interface** (x | y | width | height) and the **Shelf
// ------------------------------------------------------------

import {
  Product,
  Shelf,
  Beacon,
  DiscountRule,
  User,
  Zone,
} from '../types';
import { nanoid } from 'nanoid';

/* ───────── Products ───────── */
export const mockProducts: Product[] = [
  // 🛒 Groceries
  { id: '1', name: 'Organic Bananas', category: 'Groceries', sku: 'BAN001', shelfId: 'shelf-1', stock: 25 },
  { id: '2', name: 'Milk 2%', category: 'Groceries', sku: 'MLK001', shelfId: 'shelf-2', stock: 12 },
  { id: '3', name: 'Bread Whole Wheat', category: 'Groceries', sku: 'BRD001', shelfId: 'shelf-3', stock: 8 },
  { id: '4', name: 'Aashirvaad Atta', category: 'Groceries', sku: 'ATT001', shelfId: 'shelf-4', stock: 18 },
  { id: '5', name: 'TATA Salt', category: 'Groceries', sku: 'SLT001', shelfId: 'shelf-5', stock: 40 },
  { id: '6', name: 'Fortune Oil', category: 'Groceries', sku: 'OIL001', shelfId: 'shelf-6', stock: 22 },
  { id: '7', name: 'Basmati Rice', category: 'Groceries', sku: 'RIC001', shelfId: 'shelf-7', stock: 30 },
  { id: '8', name: 'Red Chili Powder', category: 'Groceries', sku: 'CHL001', shelfId: 'shelf-8', stock: 15 },
  { id: '9', name: 'Turmeric Powder', category: 'Groceries', sku: 'TRM001', shelfId: 'shelf-9', stock: 12 },
  { id: '10', name: 'Maggi Noodles', category: 'Groceries', sku: 'MGG001', shelfId: 'shelf-10', stock: 35 },

  // 🍫 Snacks
  { id: '11', name: 'Doritos Nacho', category: 'Snacks', sku: 'SNK001', shelfId: 'shelf-11', stock: 30 },
  { id: '12', name: 'Lay\'s Classic Chips', category: 'Snacks', sku: 'SNK002', shelfId: 'shelf-12', stock: 25 },
  { id: '13', name: 'Oreo Cookies', category: 'Snacks', sku: 'SNK003', shelfId: 'shelf-13', stock: 22 },
  { id: '14', name: 'Perk Chocolate', category: 'Snacks', sku: 'SNK004', shelfId: 'shelf-14', stock: 40 },
  { id: '15', name: 'Hide & Seek Biscuits', category: 'Snacks', sku: 'SNK005', shelfId: 'shelf-15', stock: 18 },
  { id: '16', name: 'Haldiram\'s Bhujia', category: 'Snacks', sku: 'SNK006', shelfId: 'shelf-16', stock: 27 },
  { id: '17', name: 'Bingo Mad Angles', category: 'Snacks', sku: 'SNK007', shelfId: 'shelf-17', stock: 19 },
  { id: '18', name: 'Dairy Milk Silk', category: 'Snacks', sku: 'SNK008', shelfId: 'shelf-18', stock: 21 },
  { id: '19', name: 'Nachos with Dip', category: 'Snacks', sku: 'SNK009', shelfId: 'shelf-19', stock: 17 },
  { id: '20', name: 'Ready Popcorn', category: 'Snacks', sku: 'SNK010', shelfId: 'shelf-20', stock: 24 },

  // 💄 Beauty & Health
  { id: '21', name: 'Dove Soap', category: 'Beauty & Health', sku: 'HLT001', shelfId: 'shelf-21', stock: 30 },
  { id: '22', name: 'Himalaya Face Wash', category: 'Beauty & Health', sku: 'HLT002', shelfId: 'shelf-22', stock: 14 },
  { id: '23', name: 'Nivea Body Lotion', category: 'Beauty & Health', sku: 'HLT003', shelfId: 'shelf-23', stock: 20 },
  { id: '24', name: 'Colgate Toothpaste', category: 'Beauty & Health', sku: 'HLT004', shelfId: 'shelf-24', stock: 25 },
  { id: '25', name: 'Dettol Hand Sanitizer', category: 'Beauty & Health', sku: 'HLT005', shelfId: 'shelf-25', stock: 40 },
  { id: '26', name: 'Lakmé Lip Balm', category: 'Beauty & Health', sku: 'HLT006', shelfId: 'shelf-26', stock: 18 },
  { id: '27', name: 'Clinic Plus Shampoo', category: 'Beauty & Health', sku: 'HLT007', shelfId: 'shelf-27', stock: 30 },
  { id: '28', name: 'Veet Hair Remover', category: 'Beauty & Health', sku: 'HLT008', shelfId: 'shelf-28', stock: 16 },
  { id: '29', name: 'Johnson Baby Powder', category: 'Beauty & Health', sku: 'HLT009', shelfId: 'shelf-29', stock: 19 },
  { id: '30', name: 'Whisper Sanitary Pads', category: 'Beauty & Health', sku: 'HLT010', shelfId: 'shelf-30', stock: 35 },

  // 💻 Electronics
  { id: '31', name: 'iPhone 15 Pro', category: 'Electronics', sku: 'ELE001', shelfId: 'shelf-31', stock: 5 },
  { id: '32', name: 'Samsung TV 55"', category: 'Electronics', sku: 'ELE002', shelfId: 'shelf-32', stock: 3 },
  { id: '33', name: 'boAt Bluetooth Speaker', category: 'Electronics', sku: 'ELE003', shelfId: 'shelf-33', stock: 12 },
  { id: '34', name: 'HP Wireless Mouse', category: 'Electronics', sku: 'ELE004', shelfId: 'shelf-34', stock: 18 },
  { id: '35', name: 'Smartwatch Noise', category: 'Electronics', sku: 'ELE005', shelfId: 'shelf-35', stock: 10 },
  { id: '36', name: 'LED Light Bulb', category: 'Electronics', sku: 'ELE006', shelfId: 'shelf-36', stock: 40 },
  { id: '37', name: '32GB Pen Drive', category: 'Electronics', sku: 'ELE007', shelfId: 'shelf-37', stock: 25 },
  { id: '38', name: 'USB Charging Cable', category: 'Electronics', sku: 'ELE008', shelfId: 'shelf-38', stock: 28 },
  { id: '39', name: 'Mi Power Bank', category: 'Electronics', sku: 'ELE009', shelfId: 'shelf-39', stock: 14 },
  { id: '40', name: 'Extension Board', category: 'Electronics', sku: 'ELE010', shelfId: 'shelf-40', stock: 17 }
];


/* ───────── Shelves (now include label) ───────── */
export const mockShelves: Shelf[] = [
  { id: 'shelf-1', label: '#1', type: 'aisle',    x: 100, y: 100, width: 120, height: 40, zone: 'grocery',     capacity: 50, products: [] },
  { id: 'shelf-2', label: '#2', type: 'aisle',    x: 100, y: 180, width: 120, height: 40, zone: 'grocery',     capacity: 50, products: [] },
  { id: 'shelf-4', label: '#3', type: 'aisle',    x: 100, y: 260, width: 120, height: 40, zone: 'grocery',     capacity: 50, products: [] },
  { id: 'shelf-5', label: '#3', type: 'aisle',    x: 100, y: 260, width: 120, height: 40, zone: 'grocery',     capacity: 50, products: [] },
  { id: 'shelf-6', label: '#3', type: 'aisle',    x: 100, y: 260, width: 120, height: 40, zone: 'grocery',     capacity: 50, products: [] },
  { id: 'shelf-7', label: '#3', type: 'aisle',    x: 100, y: 260, width: 120, height: 40, zone: 'grocery',     capacity: 50, products: [] },
  { id: 'shelf-8', label: '#4', type: 'endcap',   x: 300, y: 100, width:  80, height: 60, zone: 'snacks',      capacity: 30, products: [] },
  { id: 'shelf-9', label: '#5', type: 'island',   x: 450, y: 150, width: 100, height: 80, zone: 'electronics', capacity: 20, products: [] },
  { id: 'shelf-10', label: '#6', type: 'aisle',    x: 300, y: 220, width: 120, height: 40, zone: 'electronics', capacity: 40, products: [] },
  { id: 'shelf-11', label: '#7', type: 'aisle',    x: 100, y: 340, width: 120, height: 40, zone: 'health',      capacity: 45, products: [] },
];

/* ───────── Zones (flattened) ───────── */
export const mockZones: Zone[] = [
  { id: 'entrance',    name: 'Entrance',        x:  50, y:  50, width: 100, height:  80, color: '#00D3FF' },
  { id: 'grocery',     name: 'Grocery',         x:  80, y:  80, width: 160, height: 200, color: '#10B981' },
  { id: 'snacks',      name: 'Snacks',          x: 280, y:  80, width: 120, height: 100, color: '#FFB547' },
  { id: 'electronics', name: 'Electronics',     x: 280, y: 200, width: 200, height: 120, color: '#8B5CF6' },
  { id: 'health',      name: 'Health & Beauty', x:  80, y: 320, width: 200, height:  80, color: '#EF4444' },
];

/* ───────── Beacons ───────── */
export const mockBeacons: Beacon[] = [
  { id: 'beacon-1', name: 'Entrance QR',      type: 'qr',  zoneId: 'entrance',    status: 'online' },
  { id: 'beacon-2', name: 'Grocery BLE',      type: 'ble', zoneId: 'grocery',     status: 'online',  batteryLevel: 85 },
  { id: 'beacon-3', name: 'Electronics BLE',  type: 'ble', zoneId: 'electronics', status: 'online',  batteryLevel: 92 },
  { id: 'beacon-4', name: 'Snacks QR',        type: 'qr',  zoneId: 'snacks',      status: 'mock' },
  { id: 'beacon-5', name: 'Health BLE',       type: 'ble', zoneId: 'health',      status: 'offline', batteryLevel: 15 },
];

/* ───────── Discount rules ───────── */
export const mockDiscountRules: DiscountRule[] = [
  {
    id: 'rule-1',
    name: 'Snacks Zone Welcome',
    trigger:   { type: 'zone-enter',  value: 'snacks' },
    condition: { type: 'category',    value: 'Snacks' },
    action:    { type: 'percentage',  value: 15 },
    active: true,
  },
  {
    id: 'rule-2',
    name: 'Electronics Flash Sale',
    trigger:   { type: 'product-view', value: 'electronics' },
    condition: { type: 'category',     value: 'Electronics' },
    action:    { type: 'fixed-amount', value: 50 },
    active: true,
  },
  {
    id: 'rule-3',
    name: 'Dairy Welcome Gift',
    trigger:   { type: 'zone-enter', value: 'dairy' },
    condition: { type: 'user-type', value: 'first-visit' },
    action:    { type: 'fixed-amount', value: 20 },
    active: true,
  },
  {
    id: 'rule-4',
    name: 'Happy Hour - Beverages',
    trigger:   { type: 'time-based', value: '16:00-18:00' },
    condition: { type: 'category', value: 'Beverages' },
    action:    { type: 'percentage', value: 25 },
    active: true,
  },
  {
    id: 'rule-5',
    name: 'Bulk Buy Bonus',
    trigger:   { type: 'cart-total', value: 'above-1000' },
    condition: { type: 'item-count', value: '>=5' },
    action:    { type: 'fixed-amount', value: 100 },
    active: true,
  }
];

/* ───────── Current user ───────── */
export const mockUser: User = {
  id: 'user-1',
  name: 'Sarah Chen',
  role: 'admin',
  avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
};

/* ───────── Analytics, events ───────── */
export const mockAnalytics = {
  activeUsers: 147,
  dailyGrowth: 12.5,
  topSearches: ['Milk', 'Bananas', 'iPhone', 'Toothpaste', 'Bread'],
  heatmapData: [
    { zone: 'grocery',     visits: 89, avgTime: 4.2 },
    { zone: 'electronics', visits: 45, avgTime: 8.7 },
    { zone: 'snacks',      visits: 67, avgTime: 2.1 },
    { zone: 'health',      visits: 34, avgTime: 3.8 },
  ],
};

export const mockEvents = [
  { id: '1', time: '14:31', message: 'Offer accepted in Snacks Zone',        type: 'success' },
  { id: '2', time: '14:28', message: 'New user entered Electronics section', type: 'info' },
  { id: '3', time: '14:25', message: 'Beacon offline: Health BLE',           type: 'warning' },
  { id: '4', time: '14:22', message: 'Flash sale triggered for iPhone 15',   type: 'success' },
  { id: '5', time: '14:18', message: '12 users currently shopping',          type: 'info' },
];