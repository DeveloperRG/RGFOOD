// ~/lib/shared-types.ts
// Enum for user roles - this file is safe to import in both client and server components
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  FOODCOURT_OWNER = "FOODCOURT_OWNER",
  ADMIN = "ADMIN",
}

// Enum for foodcourt status
export enum FoodCourtStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

// Enum for order status
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Enum for stall status
export enum StallStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING_APPROVAL = "PENDING_APPROVAL",
}
