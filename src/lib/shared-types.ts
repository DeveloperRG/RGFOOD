// ~/lib/shared-types.ts
// Enum for user roles - this file is safe to import in both client and server components
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
}

// Enum for order status - must match Prisma schema exactly
export enum OrderStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
  role: UserRole;
  foodcourts: Foodcourt[];
}

export interface Foodcourt {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  image?: string | null;
  imagePublicId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  foodcourtId: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null; // Added the missing 'image' property
  imagePublicId?: string | null;
  isAvailable: boolean;
  foodcourtId: string;
  categoryId?: string | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialInstructions?: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
  foodcourtId: string;
  menuItemId: string;
  menuItem: MenuItem;
}

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  qrCode: string;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  tableId: string;
  orderItems: OrderItem[];
  table: Table;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
}

export interface OwnerPermission {
  id: string;
  canEditMenu: boolean;
  canViewOrders: boolean;
  canUpdateOrders: boolean;
  ownerId: string;
  foodcourtId: string;
}

export enum FoodcourtStatus {
  BUKA = "BUKA",
  TUTUP = "TUTUP",
}
