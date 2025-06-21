export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  shelfId: string;
  stock: number;
}

export interface Shelf {
  id: string;
  type: 'aisle' | 'endcap' | 'island' | 'checkout';
  x: number;
  y: number;
  width: number;
  height: number;
  zone: string;
  capacity: number;
  products: Product[];
}

export interface Beacon {
  id: string;
  name: string;
  type: 'qr' | 'ble';
  zoneId: string;
  status: 'online' | 'offline' | 'mock';
  batteryLevel?: number;
  lastSeen?: Date;
}

export interface DiscountRule {
  id: string;
  name: string;
  trigger: {
    type: 'zone-enter' | 'product-view' | 'time-based';
    value: string;
  };
  condition: {
    type: 'category' | 'product' | 'user-type';
    value: string;
  };
  action: {
    type: 'percentage' | 'fixed-amount' | 'buy-one-get-one';
    value: number;
  };
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'staff' | 'analyst';
  avatar: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Zone {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
}