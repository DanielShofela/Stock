import type { Database as DB } from './database.types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Re-exporting the generated Database type for use in the app
export type Database = DB;

// Override the generated enum to include the new 'damaged' type and 'sale' type
export type MovementType = DB['public']['Enums']['movement_type'] | 'damaged' | 'sale';


// Frontend-specific types for ease of use in components
export interface StockLevel {
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  safety_stock: number;
  initial_quantity: number;
  last_modified: string;
}

export interface ProductVariant {
  id: number;
  variant_name: string;
  barcode: string | null;
  price: number;
  stock_levels: StockLevel[];
  // Calculated fields
  total_received?: number;
  total_shipped?: number;
  total_damaged?: number;
  last_received_date?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  images: string[];
  variants: ProductVariant[];
}

export interface StockMovement {
  id: number;
  productName: string;
  variantName: string;
  sku: string | null;
  quantity: number;
  type: MovementType;
  date: string;
  reference: string | null;
}

export interface OverduePayment {
  id: number;
  orderId: string;
  customerName: string;
  amount: number;
  dueDate: string;
}

export type Warehouse = DB['public']['Tables']['warehouses']['Row'];

// --- NEW TYPES FOR ORDERS ---

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number; // Price at time of order
}

export interface Order {
  id: number;
  customer_name: string;
  order_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  items: OrderItem[];
}
