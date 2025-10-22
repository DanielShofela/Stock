
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      product_variants: {
        Row: {
          barcode: string | null
          created_at: string | null
          id: number
          price: number | null
          product_id: number
          variant_name: string
        }
        Insert: {
          barcode?: string | null
          created_at?: string | null
          id?: number
          price?: number | null
          product_id: number
          variant_name: string
        }
        Update: {
          barcode?: string | null
          created_at?: string | null
          id?: number
          price?: number | null
          product_id?: number
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          images: Json | null
          name: string
          sku: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          images?: Json | null
          name: string
          sku?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          images?: Json | null
          name?: string
          sku?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          id: number
          last_modified: string | null
          quantity: number | null
          safety_stock: number | null
          user_id: string
          variant_id: number
          warehouse_id: number
        }
        Insert: {
          id?: number
          last_modified?: string | null
          quantity?: number | null
          safety_stock?: number | null
          user_id: string
          variant_id: number
          warehouse_id: number
        }
        Update: {
          id?: number
          last_modified?: string | null
          quantity?: number | null
          safety_stock?: number | null
          user_id?: string
          variant_id?: number
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: number
          product_name_cache: string | null
          quantity: number
          reference: string | null
          sku_cache: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          user_id: string
          variant_id: number | null
          variant_name_cache: string | null
          warehouse_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_name_cache?: string | null
          quantity: number
          reference?: string | null
          sku_cache?: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          user_id: string
          variant_id?: number | null
          variant_name_cache?: string | null
          warehouse_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          product_name_cache?: string | null
          quantity?: number
          reference?: string | null
          sku_cache?: string | null
          movement_type?: Database["public"]["Enums"]["movement_type"]
          user_id?: string
          variant_id?: number | null
          variant_name_cache?: string | null
          warehouse_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          created_at: string | null
          id: number
          location: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          location?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          location?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id_from_product: {
        Args: {
          p_id: number
        }
        Returns: string
      }
    }
    Enums: {
      movement_type:
        | "in"
        | "out"
        | "adjustment"
        | "transfer"
        | "sale"
        | "purchase"
      order_status:
        | "draft"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_method: "cash" | "card" | "bank_transfer" | "mobile_money"
      payment_status: "pending" | "completed" | "failed"
      user_role: "admin" | "manager" | "seller" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Frontend-specific types for ease of use in components
export interface StockLevel {
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  safety_stock: number;
  last_modified: string;
}

export interface ProductVariant {
  id: number;
  variant_name: string;
  barcode: string | null;
  price: number;
  stock_levels: StockLevel[];
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
  type: Database["public"]["Enums"]["movement_type"];
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

export type Warehouse = Database['public']['Tables']['warehouses']['Row'];
