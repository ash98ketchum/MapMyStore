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
  { id: '1', name: 'Organic Bananas', category: 'Groceries', sku: 'BAN001', shelfId: 'shelf-1', stock: 25,imageUrl:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmFuYW5hfGVufDB8fDB8fHww' },
  { id: '2', name: 'Milk 2%', category: 'Groceries', sku: 'MLK001', shelfId: 'shelf-2', stock: 12,imageUrl:'https://dairynutrition.ca/sites/dairynutrition/files/image_file_browser/dn_article/2023-03/shutterstock_4305538_1182x788px.jpg' },
  { id: '3', name: 'Bread Whole Wheat', category: 'Groceries', sku: 'BRD001', shelfId: 'shelf-3', stock: 8 , imageUrl:'https://images.getrecipekit.com/20230728144103-md-100-whole-wheat-bread-11-1-of-1-scaled.jpg?aspect_ratio=4:3&quality=90&'},
  { id: '4', name: 'Aashirvaad Atta', category: 'Groceries', sku: 'ATT001', shelfId: 'shelf-4', stock: 18,imageUrl:'https://www.bbassets.com/media/uploads/p/l/126906_10-aashirvaad-atta-whole-wheat.jpg' },
  { id: '5', name: 'TATA Salt', category: 'Groceries', sku: 'SLT001', shelfId: 'shelf-5', stock: 40,imageUrl:'https://m.media-amazon.com/images/I/614mm2hYHyL.jpg' },
  { id: '6', name: 'Fortune Oil', category: 'Groceries', sku: 'OIL001', shelfId: 'shelf-6', stock: 22, imageUrl:'https://freshclub.co.in/cdn/shop/products/Screenshot2022-10-26145311.jpg?v=1666776395' },
  { id: '7', name: 'Basmati Rice', category: 'Groceries', sku: 'RIC001', shelfId: 'shelf-7', stock: 30,imageUrl:'https://indischwindisch.com/wp-content/uploads/2023/10/Boiled-rice-3-1.jpg' },
  { id: '8', name: 'Red Chili Powder', category: 'Groceries', sku: 'CHL001', shelfId: 'shelf-8', stock: 15,imageUrl:'https://m.media-amazon.com/images/I/81W2CBbvERL.jpg' },
  { id: '9', name: 'Turmeric Powder', category: 'Groceries', sku: 'TRM001', shelfId: 'shelf-9', stock: 12,imageUrl:'https://m.media-amazon.com/images/I/41ZT+xOOaYL.UF350,350_QL80.jpg' },
  { id: '10', name: 'Maggi Noodles', category: 'Groceries', sku: 'MGG001', shelfId: 'shelf-10', stock: 35,imageUrl:'https://www.madewithnestle.ca/sites/default/files/masala_cdn_3dsm.png' },

  // 🍫 Snacks
  { id: '11', name: 'Doritos Nacho', category: 'Snacks', sku: 'SNK001', shelfId: 'shelf-11', stock: 30,imageUrl:'https://m.media-amazon.com/images/I/71-Hp3FaY2L.UF1000,1000_QL80.jpg' },
  { id: '12', name: 'Lay\'s Classic Chips', category: 'Snacks', sku: 'SNK002', shelfId: 'shelf-12', stock: 25,imageUrl:'https://m.media-amazon.com/images/I/61e+UwnsWwL.jpg' },
  { id: '13', name: 'Oreo Cookies', category: 'Snacks', sku: 'SNK003', shelfId: 'shelf-13', stock: 22,imageUrl:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTz06l8G8nJ596dIyYgjcSapIFaigfCsIGCZQ&s' },
  { id: '14', name: 'Perk Chocolate', category: 'Snacks', sku: 'SNK004', shelfId: 'shelf-14', stock: 40,imageUrl:'https://rukminim3.flixcart.com/image/850/1000/xif0q/chocolate/6/v/4/960-perk-plus-chocolate-coated-wafer-1-cadbury-original-imah6tcxenzhjzs4.jpeg?q=90&crop=false' },
  { id: '15', name: 'Hide & Seek Biscuits', category: 'Snacks', sku: 'SNK005', shelfId: 'shelf-15', stock: 18 ,imageUrl:'https://m.media-amazon.com/images/I/71cw2JLKmvL.jpg'},
  { id: '16', name: 'Haldiram\'s Bhujia', category: 'Snacks', sku: 'SNK006', shelfId: 'shelf-16', stock: 27,imageUrl:'https://www.haldiramuk.com/cdn/shop/files/0002s_0000_Bhujia_2c7d104a-308d-4ca3-a418-bbcb5585b632.png?v=1718874026' },
  { id: '17', name: 'Bingo Mad Angles', category: 'Snacks', sku: 'SNK007', shelfId: 'shelf-17', stock: 19,imageUrl:'https://m.media-amazon.com/images/I/81R07cM4UrL.jpg' },
  { id: '18', name: 'Dairy Milk Silk', category: 'Snacks', sku: 'SNK008', shelfId: 'shelf-18', stock: 21,imageUrl:'https://m.media-amazon.com/images/I/71YUCToeFgL.jpg' },
  { id: '19', name: 'Nachos with Dip', category: 'Snacks', sku: 'SNK009', shelfId: 'shelf-19', stock: 17,imageUrl:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHaI29OAIIFO4PermMK14MYwEdIMvMrW4ArA&s' },
  { id: '20', name: 'Ready Popcorn', category: 'Snacks', sku: 'SNK010', shelfId: 'shelf-20', stock: 24,imageUrl:'https://www.vridhistores.com/uploads/2023/Dec/products/17031497496053.jpg' },

  // 💄 Beauty & Health
  { id: '21', name: 'Dove Soap', category: 'Beauty & Health', sku: 'HLT001', shelfId: 'shelf-21', stock: 30,imageUrl:'https://m.media-amazon.com/images/I/71f5+Dw8TBL.jpg' },
  { id: '22', name: 'Himalaya Face Wash', category: 'Beauty & Health', sku: 'HLT002', shelfId: 'shelf-22', stock: 14,imageUrl:'https://images.apollo247.in/pub/media/catalog/product/H/I/HIM0094_1-JULY23_1.jpg' },
  { id: '23', name: 'Nivea Body Lotion', category: 'Beauty & Health', sku: 'HLT003', shelfId: 'shelf-23', stock: 20,imageUrl:'https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/11245432/2025/2/24/f214ae79-be41-4716-a995-be2c94b720b51740387844904-Nivea-Nourishing-Lotion-Body-Milk-For-Dry-Skin--600ml-483174-1.jpg' },
  { id: '24', name: 'Colgate Toothpaste', category: 'Beauty & Health', sku: 'HLT004', shelfId: 'shelf-24', stock: 25,imageUrl:'https://m.media-amazon.com/images/I/61f+32QXZML.jpg' },
  { id: '25', name: 'Dettol Hand Sanitizer', category: 'Beauty & Health', sku: 'HLT005', shelfId: 'shelf-25', stock: 40,imageUrl:'https://m.media-amazon.com/images/I/51PnL9IMQfL.jpg' },
  { id: '26', name: 'Lakmé Lip Balm', category: 'Beauty & Health', sku: 'HLT006', shelfId: 'shelf-26', stock: 18,imageUrl:'https://m.media-amazon.com/images/I/61My8L1dGFL.jpg' },
  { id: '27', name: 'Clinic Plus Shampoo', category: 'Beauty & Health', sku: 'HLT007', shelfId: 'shelf-27', stock: 30,imageUrl:'https://m.media-amazon.com/images/I/4142KkASm+L.AC.jpg' },
  { id: '28', name: 'Veet Hair Remover', category: 'Beauty & Health', sku: 'HLT008', shelfId: 'shelf-28', stock: 16,imageUrl:'https://m.media-amazon.com/images/I/61pIYl-ZjSL.UF1000,1000_QL80.jpg' },
  { id: '29', name: 'Johnson Baby Powder', category: 'Beauty & Health', sku: 'HLT009', shelfId: 'shelf-29', stock: 19,imageUrl:'https://m.media-amazon.com/images/I/414MZ4RJ1KL.jpg' },
  { id: '30', name: 'Whisper Sanitary Pads', category: 'Beauty & Health', sku: 'HLT010', shelfId: 'shelf-30', stock: 35,imageUrl:'https://m.media-amazon.com/images/I/71PmYHrryIL.jpg' },

  // 💻 Electronics
  { id: '31', name: 'iPhone 15 Pro', category: 'Electronics', sku: 'ELE001', shelfId: 'shelf-31', stock: 5,imageUrl:'https://media-ik.croma.com/prod/https://media.croma.com/image/upload/v1708674089/Croma%20Assets/Communication/Mobiles/Images/300787_0_hezn4b.png' },
  { id: '32', name: 'Samsung TV 55"', category: 'Electronics', sku: 'ELE002', shelfId: 'shelf-32', stock: 3,imageUrl:'https://www.dxomark.com/wp-content/uploads/medias/post-167690/Samsung-Galaxy-A55-5G_featured-image-packshot-review.jpg' },
  { id: '33', name: 'boAt Bluetooth Speaker', category: 'Electronics', sku: 'ELE003', shelfId: 'shelf-33', stock: 12,imageUrl:'https://m.media-amazon.com/images/I/81ocVi-mglL.jpg' },
  { id: '34', name: 'HP Wireless Mouse', category: 'Electronics', sku: 'ELE004', shelfId: 'shelf-34', stock: 18,imageUrl:'https://m.media-amazon.com/images/I/61Zv+ufF51L.jpg' },
  { id: '35', name: 'Smartwatch Noise', category: 'Electronics', sku: 'ELE005', shelfId: 'shelf-35', stock: 10,imageUrl:'https://m.media-amazon.com/images/I/61TapeOXotL.jpg' },
  { id: '36', name: 'LED Light Bulb', category: 'Electronics', sku: 'ELE006', shelfId: 'shelf-36', stock: 40,imageUrl:'https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsAceBrightLEDBulb1.png?v=1747311693' },
  { id: '37', name: '32GB Pen Drive', category: 'Electronics', sku: 'ELE007', shelfId: 'shelf-37', stock: 25,imageUrl:'https://m.media-amazon.com/images/I/61mcOyUlsTL.jpg' },
  { id: '38', name: 'USB Charging Cable', category: 'Electronics', sku: 'ELE008', shelfId: 'shelf-38', stock: 28,imageUrl:'https://m.media-amazon.com/images/I/61whFcpC1nL.jpg' },
  { id: '39', name: 'Mi Power Bank', category: 'Electronics', sku: 'ELE009', shelfId: 'shelf-39', stock: 14,imageUrl:'https://www.zeepee.in/wp-content/uploads/2020/07/mi-20000-mah-powerbank.jpg' },
  { id: '40', name: 'Extension Board', category: 'Electronics', sku: 'ELE010', shelfId: 'shelf-40', stock: 17,imageUrl:'https://m.media-amazon.com/images/I/61GK5jIFCKL.jpg' }
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