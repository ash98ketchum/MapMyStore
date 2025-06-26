// src/types/index.ts

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  shelfId: string;
  stock: number;
  imageUrl?: string;
  price?: number;
}

export interface ProductOnShelf {
  productId: string;
  qty: number;
}

export type ShelfType = 'aisle' | 'endcap' | 'island' | 'checkout';

export interface Shelf {
  id: string;           // uuid or nanoid
  label: string;        // e.g. "#1"
  type: ShelfType;
  x: number;
  y: number;
  width: number;
  height: number;
  zone: string;
  capacity: number;
  products: ProductOnShelf[];
}

export interface Zone {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Path {
  id: string;
  points: Point[];
  color: string;
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
    type: 'zone-enter' | 'product-view' | 'time-based' | 'cart-total';
    value: string;
  };
  condition: {
    type: 'category' | 'product' | 'user-type' | 'first-visit' | 'item-count';
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

export interface Road {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZonePaletteDef {
  name: string;
  color: string;
}

/**
 * Full Layout type matching your Zod schema:
 */
export interface Layout {
  name: string;
  createdAt: number;
  scale: number;
  offset: { x: number; y: number };
  shelves: Shelf[];
  zones: Zone[];
  roads: Road[];
}
