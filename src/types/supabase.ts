export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          userId: string;
          type: string;
          provider: string;
          providerAccountId: string;
          refresh_token: string | null;
          access_token: string | null;
          expires_at: number | null;
          token_type: string | null;
          scope: string | null;
          id_token: string | null;
          session_state: string | null;
          refresh_token_expires_in: number | null;
        };
        Insert: {
          id: string;
          userId: string;
          type: string;
          provider: string;
          providerAccountId: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
          refresh_token_expires_in?: number | null;
        };
        Update: {
          id?: string;
          userId?: string;
          type?: string;
          provider?: string;
          providerAccountId?: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
          refresh_token_expires_in?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      sessions: {
        Row: {
          id: string;
          sessionToken: string;
          userId: string;
          expires: string;
        };
        Insert: {
          id: string;
          sessionToken: string;
          userId: string;
          expires: string;
        };
        Update: {
          id?: string;
          sessionToken?: string;
          userId?: string;
          expires?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      users: {
        Row: {
          id: string;
          name: string | null;
          username: string | null;
          email: string | null;
          emailVerified: string | null;
          image: string | null;
          password: string | null;
          role: string;
          createdAt: string;
          updatedAt: string;
          lastLogin: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          username?: string | null;
          email?: string | null;
          emailVerified?: string | null;
          image?: string | null;
          password?: string | null;
          role?: string;
          createdAt?: string;
          updatedAt?: string;
          lastLogin?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          username?: string | null;
          email?: string | null;
          emailVerified?: string | null;
          image?: string | null;
          password?: string | null;
          role?: string;
          createdAt?: string;
          updatedAt?: string;
          lastLogin?: string | null;
        };
        Relationships: [];
      };

      verification_tokens: {
        Row: {
          identifier: string;
          token: string;
          expires: string;
        };
        Insert: {
          identifier: string;
          token: string;
          expires: string;
        };
        Update: {
          identifier?: string;
          token?: string;
          expires?: string;
        };
        Relationships: [];
      };

      foodcourts: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          locationLat: number;
          locationLng: number;
          address: string | null;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
          ownerId: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          locationLat: number;
          locationLng: number;
          address?: string | null;
          isActive?: boolean;
          createdAt?: string;
          updatedAt?: string;
          ownerId: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          locationLat?: number;
          locationLng?: number;
          address?: string | null;
          isActive?: boolean;
          createdAt?: string;
          updatedAt?: string;
          ownerId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "foodcourts_ownerId_fkey";
            columns: ["ownerId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      tables: {
        Row: {
          id: string;
          tableNumber: number;
          barcodeValue: string;
          capacity: number;
          isAvailable: boolean;
          createdAt: string;
          updatedAt: string;
          foodcourtId: string;
        };
        Insert: {
          id: string;
          tableNumber: number;
          barcodeValue: string;
          capacity: number;
          isAvailable?: boolean;
          createdAt?: string;
          updatedAt?: string;
          foodcourtId: string;
        };
        Update: {
          id?: string;
          tableNumber?: number;
          barcodeValue?: string;
          capacity?: number;
          isAvailable?: boolean;
          createdAt?: string;
          updatedAt?: string;
          foodcourtId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tables_foodcourtId_fkey";
            columns: ["foodcourtId"];
            isOneToOne: false;
            referencedRelation: "foodcourts";
            referencedColumns: ["id"];
          },
        ];
      };

      table_sessions: {
        Row: {
          id: string;
          sessionStart: string;
          sessionEnd: string | null;
          isActive: boolean;
          tableId: string;
        };
        Insert: {
          id: string;
          sessionStart?: string;
          sessionEnd?: string | null;
          isActive?: boolean;
          tableId: string;
        };
        Update: {
          id?: string;
          sessionStart?: string;
          sessionEnd?: string | null;
          isActive?: boolean;
          tableId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "table_sessions_tableId_fkey";
            columns: ["tableId"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };

      menu_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          displayOrder: number;
          foodcourtId: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          displayOrder?: number;
          foodcourtId: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          displayOrder?: number;
          foodcourtId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_categories_foodcourtId_fkey";
            columns: ["foodcourtId"];
            isOneToOne: false;
            referencedRelation: "foodcourts";
            referencedColumns: ["id"];
          },
        ];
      };

      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          imageUrl: string | null;
          isAvailable: boolean;
          createdAt: string;
          updatedAt: string;
          foodcourtId: string;
          categoryId: string | null;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          price: number;
          imageUrl?: string | null;
          isAvailable?: boolean;
          createdAt?: string;
          updatedAt?: string;
          foodcourtId: string;
          categoryId?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          imageUrl?: string | null;
          isAvailable?: boolean;
          createdAt?: string;
          updatedAt?: string;
          foodcourtId?: string;
          categoryId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_foodcourtId_fkey";
            columns: ["foodcourtId"];
            isOneToOne: false;
            referencedRelation: "foodcourts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_items_categoryId_fkey";
            columns: ["categoryId"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
        ];
      };

      orders: {
        Row: {
          id: string;
          customerName: string;
          totalAmount: number;
          status: string;
          createdAt: string;
          updatedAt: string;
          tableId: string;
        };
        Insert: {
          id: string;
          customerName: string;
          totalAmount: number;
          status?: string;
          createdAt?: string;
          updatedAt?: string;
          tableId: string;
        };
        Update: {
          id?: string;
          customerName?: string;
          totalAmount?: number;
          status?: string;
          createdAt?: string;
          updatedAt?: string;
          tableId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_tableId_fkey";
            columns: ["tableId"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };

      order_items: {
        Row: {
          id: string;
          quantity: number;
          unitPrice: number;
          subtotal: number;
          specialInstructions: string | null;
          status: string;
          createdAt: string;
          updatedAt: string;
          orderId: string;
          foodcourtId: string;
          menuItemId: string;
        };
        Insert: {
          id: string;
          quantity: number;
          unitPrice: number;
          subtotal: number;
          specialInstructions?: string | null;
          status?: string;
          createdAt?: string;
          updatedAt?: string;
          orderId: string;
          foodcourtId: string;
          menuItemId: string;
        };
        Update: {
          id?: string;
          quantity?: number;
          unitPrice?: number;
          subtotal?: number;
          specialInstructions?: string | null;
          status?: string;
          createdAt?: string;
          updatedAt?: string;
          orderId?: string;
          foodcourtId?: string;
          menuItemId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_orderId_fkey";
            columns: ["orderId"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_foodcourtId_fkey";
            columns: ["foodcourtId"];
            isOneToOne: false;
            referencedRelation: "foodcourts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_menuItemId_fkey";
            columns: ["menuItemId"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          },
        ];
      };

      owner_permissions: {
        Row: {
          id: string;
          canEditMenu: boolean;
          canViewOrders: boolean;
          canUpdateOrders: boolean;
          ownerId: string;
          foodcourtId: string;
        };
        Insert: {
          id: string;
          canEditMenu?: boolean;
          canViewOrders?: boolean;
          canUpdateOrders?: boolean;
          ownerId: string;
          foodcourtId: string;
        };
        Update: {
          id?: string;
          canEditMenu?: boolean;
          canViewOrders?: boolean;
          canUpdateOrders?: boolean;
          ownerId?: string;
          foodcourtId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "owner_permissions_ownerId_fkey";
            columns: ["ownerId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_permissions_foodcourtId_fkey";
            columns: ["foodcourtId"];
            isOneToOne: false;
            referencedRelation: "foodcourts";
            referencedColumns: ["id"];
          },
        ];
      };

      order_logs: {
        Row: {
          id: string;
          previousStatus: string | null;
          newStatus: string;
          updatedAt: string;
          orderId: string;
          orderItemId: string | null;
          updatedById: string;
        };
        Insert: {
          id: string;
          previousStatus?: string | null;
          newStatus: string;
          updatedAt?: string;
          orderId: string;
          orderItemId?: string | null;
          updatedById: string;
        };
        Update: {
          id?: string;
          previousStatus?: string | null;
          newStatus?: string;
          updatedAt?: string;
          orderId?: string;
          orderItemId?: string | null;
          updatedById?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_logs_orderId_fkey";
            columns: ["orderId"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_logs_orderItemId_fkey";
            columns: ["orderItemId"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_logs_updatedById_fkey";
            columns: ["updatedById"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      order_notifications: {
        Row: {
          id: string;
          message: string;
          isDisplayed: boolean;
          createdAt: string;
          orderId: string;
        };
        Insert: {
          id: string;
          message: string;
          isDisplayed?: boolean;
          createdAt?: string;
          orderId: string;
        };
        Update: {
          id?: string;
          message?: string;
          isDisplayed?: boolean;
          createdAt?: string;
          orderId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_notifications_orderId_fkey";
            columns: ["orderId"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };

      owner_notifications: {
        Row: {
          id: string;
          message: string;
          isRead: boolean;
          createdAt: string;
          foodcourtId: string;
          orderId: string;
        };
        Insert: {
          id: string;
          message: string;
          isRead?: boolean;
          createdAt?: string;
          foodcourtId: string;
          orderId: string;
        };
        Update: {
          id?: string;
          message?: string;
          isRead?: boolean;
          createdAt?: string;
          foodcourtId?: string;
          orderId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "owner_notifications_foodcourtId_fkey";
            columns: ["foodcourtId"];
            isOneToOne: false;
            referencedRelation: "foodcourts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_notifications_orderId_fkey";
            columns: ["orderId"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      UserRole: "CUSTOMER" | "OWNER" | "ADMIN";
      OrderStatus:
        | "WAITING_FOR_CONFIRMATION"
        | "FOOD_BEING_MADE"
        | "ORDER_DONE"
        | "CANCELLED";
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for common database operations
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export type InsertDTO<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDTO<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// User-related types
export type User = Tables<"users">;
export type UserRole = Enums<"UserRole">;

// Foodcourt-related types
export type Foodcourt = Tables<"foodcourts">;
export type Table = Tables<"tables">;
export type TableSession = Tables<"table_sessions">;
export type MenuCategory = Tables<"menu_categories">;
export type MenuItem = Tables<"menu_items">;

// Order-related types
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type OrderStatus = Enums<"OrderStatus">;
export type OrderLog = Tables<"order_logs">;
export type OrderNotification = Tables<"order_notifications">;
export type OwnerNotification = Tables<"owner_notifications">;

// Permission-related types
export type OwnerPermission = Tables<"owner_permissions">;

// Auth-related types
export type Account = Tables<"accounts">;
export type Session = Tables<"sessions">;
export type VerificationToken = Tables<"verification_tokens">;
