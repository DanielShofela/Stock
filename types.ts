
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

// Roles for Role-Based Access Control (RBAC)
export type UserRole = 'manager';

export interface Profile {
  id: string; // Corresponds to auth.users.id
  role: UserRole;
  email: string;
  status?: 'active' | 'blocked';
  walkthrough_completed?: boolean;
}


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
  created_by?: string | null;
  last_modified_by?: string | null;
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
  userEmail?: string | null;
}

export type Warehouse = DB['public']['Tables']['warehouses']['Row'];

// Types for Order Management
export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  order_date: string;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
  created_by_user_email?: string | null;
}

export interface Customer {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
}
