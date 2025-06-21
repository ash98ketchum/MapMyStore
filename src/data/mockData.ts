import { Product, Shelf, Beacon, DiscountRule, User, Zone } from '../types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Organic Bananas', category: 'Groceries', sku: 'BAN001', shelfId: 'shelf-1', stock: 25 },
  { id: '2', name: 'Milk 2%', category: 'Groceries', sku: 'MLK001', shelfId: 'shelf-2', stock: 12 },
  { id: '3', name: 'Bread Whole Wheat', category: 'Groceries', sku: 'BRD001', shelfId: 'shelf-3', stock: 8 },
  { id: '4', name: 'Doritos Nacho', category: 'Snacks', sku: 'SNK001', shelfId: 'shelf-4', stock: 30 },
  { id: '5', name: 'iPhone 15 Pro', category: 'Electronics', sku: 'IPH001', shelfId: 'shelf-5', stock: 5 },
  { id: '6', name: 'Samsung TV 55"', category: 'Electronics', sku: 'TV001', shelfId: 'shelf-6', stock: 3 },
  { id: '7', name: 'Toothpaste', category: 'Health', sku: 'TTP001', shelfId: 'shelf-7', stock: 15 },
  { id: '8', name: 'Shampoo', category: 'Health', sku: 'SHP001', shelfId: 'shelf-8', stock: 20 },
];

export const mockShelves: Shelf[] = [
  { id: 'shelf-1', type: 'aisle', x: 100, y: 100, width: 120, height: 40, zone: 'grocery', capacity: 50, products: [] },
  { id: 'shelf-2', type: 'aisle', x: 100, y: 180, width: 120, height: 40, zone: 'grocery', capacity: 50, products: [] },
  { id: 'shelf-3', type: 'aisle', x: 100, y: 260, width: 120, height: 40, zone: 'grocery', capacity: 50, products: [] },
  { id: 'shelf-4', type: 'endcap', x: 300, y: 100, width: 80, height: 60, zone: 'snacks', capacity: 30, products: [] },
  { id: 'shelf-5', type: 'island', x: 450, y: 150, width: 100, height: 80, zone: 'electronics', capacity: 20, products: [] },
  { id: 'shelf-6', type: 'aisle', x: 300, y: 220, width: 120, height: 40, zone: 'electronics', capacity: 40, products: [] },
  { id: 'shelf-7', type: 'aisle', x: 100, y: 340, width: 120, height: 40, zone: 'health', capacity: 45, products: [] },
  { id: 'shelf-8', type: 'aisle', x: 300, y: 340, width: 120, height: 40, zone: 'health', capacity: 45, products: [] },
];

export const mockBeacons: Beacon[] = [
  { id: 'beacon-1', name: 'Entrance QR', type: 'qr', zoneId: 'entrance', status: 'online' },
  { id: 'beacon-2', name: 'Grocery BLE', type: 'ble', zoneId: 'grocery', status: 'online', batteryLevel: 85 },
  { id: 'beacon-3', name: 'Electronics BLE', type: 'ble', zoneId: 'electronics', status: 'online', batteryLevel: 92 },
  { id: 'beacon-4', name: 'Snacks QR', type: 'qr', zoneId: 'snacks', status: 'mock' },
  { id: 'beacon-5', name: 'Health BLE', type: 'ble', zoneId: 'health', status: 'offline', batteryLevel: 15 },
];

export const mockDiscountRules: DiscountRule[] = [
  {
    id: 'rule-1',
    name: 'Snacks Zone Welcome',
    trigger: { type: 'zone-enter', value: 'snacks' },
    condition: { type: 'category', value: 'Snacks' },
    action: { type: 'percentage', value: 15 },
    active: true
  },
  {
    id: 'rule-2',
    name: 'Electronics Flash Sale',
    trigger: { type: 'product-view', value: 'electronics' },
    condition: { type: 'category', value: 'Electronics' },
    action: { type: 'fixed-amount', value: 50 },
    active: true
  },
];

export const mockUser: User = {
  id: 'user-1',
  name: 'Sarah Chen',
  role: 'admin',
  avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
};

export const mockZones: Zone[] = [
  { id: 'entrance', name: 'Entrance', bounds: { x: 50, y: 50, width: 100, height: 80 }, color: '#00D3FF' },
  { id: 'grocery', name: 'Grocery', bounds: { x: 80, y: 80, width: 160, height: 200 }, color: '#10B981' },
  { id: 'snacks', name: 'Snacks', bounds: { x: 280, y: 80, width: 120, height: 100 }, color: '#FFB547' },
  { id: 'electronics', name: 'Electronics', bounds: { x: 280, y: 200, width: 200, height: 120 }, color: '#8B5CF6' },
  { id: 'health', name: 'Health & Beauty', bounds: { x: 80, y: 320, width: 200, height: 80 }, color: '#EF4444' },
];

export const mockAnalytics = {
  activeUsers: 147,
  dailyGrowth: 12.5,
  topSearches: ['Milk', 'Bananas', 'iPhone', 'Toothpaste', 'Bread'],
  heatmapData: [
    { zone: 'grocery', visits: 89, avgTime: 4.2 },
    { zone: 'electronics', visits: 45, avgTime: 8.7 },
    { zone: 'snacks', visits: 67, avgTime: 2.1 },
    { zone: 'health', visits: 34, avgTime: 3.8 },
  ]
};

export const mockEvents = [
  { id: '1', time: '14:31', message: 'Offer accepted in Snacks Zone', type: 'success' },
  { id: '2', time: '14:28', message: 'New user entered Electronics section', type: 'info' },
  { id: '3', time: '14:25', message: 'Beacon offline: Health BLE', type: 'warning' },
  { id: '4', time: '14:22', message: 'Flash sale triggered for iPhone 15', type: 'success' },
  { id: '5', time: '14:18', message: '12 users currently shopping', type: 'info' },
];