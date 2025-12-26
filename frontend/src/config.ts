// src/config.ts

const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd
  ? import.meta.env.VITE_API_URL   // e.g. https://api.mapmystore.com
  : 'http://localhost:4000';

export const api = (path: string) => `${API_BASE_URL}${path}`;
