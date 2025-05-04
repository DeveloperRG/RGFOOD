<!-- COVER SECTION -->
<div align="center" style="margin-bottom: 32px;">
  <img src="https://img.icons8.com/color/96/000000/restaurant.png" width="96" alt="RGFOOD Logo"/>
  <h1 style="font-size:2.5em; margin-bottom:0;">🍽️ <span style="color:#e67e22;">RGFOOD API Documentation</span> 🍽️</h1>
  <p style="font-size:1.2em; color:#555;">Comprehensive REST API reference for the RGFOOD platform</p>
  <a href="#table-of-contents" style="font-size:1.1em; color:#2980b9;">Jump to Table of Contents ↓</a>
</div>

---

## <span style="color:#e67e22;">Table of Contents</span>

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Public APIs](#public-apis)
4. [Admin APIs](#admin-apis)
5. [Foodcourt Owner APIs](#foodcourt-owner-apis)
6. [Search APIs](#search-apis)
7. [Importing to Postman](#importing-to-postman)

## <span style="color:#e67e22;">Introduction</span>

The RGFOOD API is built using Next.js API routes and follows RESTful principles. The base URL for all endpoints is:

> **Base URL:**  
> <span style="background:#f6f8fa; color:#2980b9; padding:2px 8px; border-radius:4px; font-family:monospace;">http://localhost:3000/api</span>

## <span style="color:#e67e22;">Authentication</span>

### <span style="color:#2980b9;">Register</span>

**Endpoint:** `POST /api/auth/register`

**Description:** Registers a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "OWNER"
}
```

**Response:**
```json
{
  "id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "OWNER",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### <span style="color:#2980b9;">Login</span>

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "OWNER"
  },
  "token": "session_token"
}
```

### <span style="color:#2980b9;">Verify Email</span>

**Endpoint:** `GET /api/auth/verify-email`

**Query Parameters:**
- `token`: Verification token sent in the email

**Description:** Verifies a user's email address using the token sent in the verification email.

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### <span style="color:#2980b9;">Resend Verification Email</span>

**Endpoint:** `POST /api/auth/resend-verification`

**Description:** Resends the verification email to a user.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent successfully"
}
```

## <span style="color:#e67e22;">Public APIs</span>
> These endpoints are accessible <span style="color:#27ae60;"><b>without authentication</b></span>.

### <span style="color:#2980b9;">Foodcourts</span>

#### <span style="color:#16a085;">Get All Foodcourts</span>

**Endpoint:** `GET /api/public/foodcourt`

**Description:** Retrieves a list of all active foodcourts.

**Response:**
```json
[
  {
    "id": "fc123",
    "name": "Food Paradise",
    "description": "A variety of delicious foods",
    "address": "Jl. Makan Enak No. 123",
    "image": "https://example.com/image.jpg",
    "imagePublicId": "foodcourts/fc123",
    "category": "MIXED",
    "status": "BUKA"
  }
]
```

#### <span style="color:#16a085;">Get Foodcourt Menu</span>

**Endpoint:** `GET /api/public/foodcourt/:foodcourtId/menu`

**Query Parameters:**
- `categoryFilter` (optional): Filter by category ID

**Description:** Retrieves menu items for a specific foodcourt.

**Response:**
```json
{
  "menuItems": [
    {
      "id": "menu123",
      "name": "Nasi Goreng",
      "description": "Delicious fried rice",
      "price": 25000,
      "image": "https://example.com/nasigoreng.jpg",
      "imagePublicId": "menu/menu123",
      "isAvailable": true,
      "categoryId": "cat123",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### <span style="color:#2980b9;">Tables</span>

#### <span style="color:#16a085;">Get All Tables</span>

**Endpoint:** `GET /api/public/tables`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Description:** Retrieves a list of all tables.

**Response:**
```json
{
  "tables": [
    {
      "id": "table123",
      "tableNumber": "A1",
      "capacity": 4,
      "qrCode": "https://example.com/qr/table123",
      "isAvailable": true,
      "tableSessions": [
        {
          "id": "session123",
          "sessionStart": "2023-01-01T00:00:00.000Z"
        }
      ]
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### <span style="color:#16a085;">Get Table Details</span>

**Endpoint:** `GET /api/public/tables/:tableId`

**Description:** Retrieves details for a specific table.

**Response:**
```json
{
  "id": "table123",
  "tableNumber": "A1",
  "capacity": 4,
  "qrCode": "https://example.com/qr/table123",
  "isAvailable": true,
  "activeSession": {
    "id": "session123",
    "sessionStart": "2023-01-01T00:00:00.000Z"
  },
  "activeOrders": [
    {
      "id": "order123",
      "status": "PENDING",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "hasActiveOrder": true
}
```

#### <span style="color:#16a085;">Get Table Orders</span>

**Endpoint:** `GET /api/public/tables/:tableId/orders`

**Query Parameters:**
- `status` (optional): Filter by order status
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Description:** Retrieves orders for a specific table.

**Response:**
```json
{
  "orders": [
    {
      "id": "order123",
      "customerName": "John Doe",
      "status": "PENDING",
      "totalAmount": 50000,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "orderItems": [
        {
          "id": "item123",
          "quantity": 2,
          "unitPrice": 25000,
          "subtotal": 50000,
          "specialInstructions": "Extra spicy",
          "menuItem": {
            "name": "Nasi Goreng",
            "image": "https://example.com/nasigoreng.jpg"
          },
          "foodcourt": {
            "name": "Food Paradise"
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### <span style="color:#2980b9;">Orders</span>

#### <span style="color:#16a085;">Place Order</span>

**Endpoint:** `POST /api/public/orders`

**Request Body:**
```json
{
  "tableId": "table123",
  "customerName": "John Doe",
  "items": [
    {
      "menuItemId": "menu123",
      "quantity": 2,
      "specialInstructions": "Extra spicy"
    }
  ],
  "specialInstructions": "Please deliver quickly"
}
```

**Description:** Places a new order for a table.

**Response:**
```json
{
  "success": true,
  "message": "Pesanan berhasil dibuat",
  "order": {
    "id": "order123",
    "status": "PENDING",
    "totalAmount": 50000,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "formattedAmount": "Rp 50.000"
  }
}
```

## <span style="color:#e67e22;">Admin APIs</span>
> <span style="color:#c0392b;"><b>Admin only</b></span> endpoints.

### <span style="color:#2980b9;">Tables Management</span>

#### <span style="color:#16a085;">Get All Tables (Admin)</span>

**Endpoint:** `GET /api/admin/tables`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Description:** Retrieves a list of all tables for admin management.

**Response:**
```json
{
  "tables": [
    {
      "id": "table123",
      "tableNumber": "A1",
      "capacity": 4,
      "qrCode": "https://example.com/qr/table123",
      "isAvailable": true,
      "tableSessions": [
        {
          "id": "session123",
          "sessionStart": "2023-01-01T00:00:00.000Z"
        }
      ],
      "orders": [
        {
          "id": "order123",
          "status": "PENDING",
          "createdAt": "2023-01-01T00:00:00.000Z",
          "customerName": "John Doe"
        }
      ]
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### <span style="color:#16a085;">Create Table</span>

**Endpoint:** `POST /api/admin/tables`

**Request Body:**
```json
{
  "tableNumber": "A1",
  "capacity": 4,
  "isAvailable": true
}
```

**Description:** Creates a new table.

**Response:**
```json
{
  "id": "table123",
  "tableNumber": "A1",
  "capacity": 4,
  "qrCode": "https://example.com/qr/table123",
  "isAvailable": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### <span style="color:#16a085;">Get Table Details (Admin)</span>

**Endpoint:** `GET /api/admin/tables/:id`

**Description:** Retrieves details for a specific table for admin management.

**Response:**
```json
{
  "id": "table123",
  "tableNumber": "A1",
  "capacity": 4,
  "qrCode": "https://example.com/qr/table123",
  "isAvailable": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "tableSessions": [
    {
      "id": "session123",
      "sessionStart": "2023-01-01T00:00:00.000Z"
    }
  ],
  "orders": [
    {
      "id": "order123",
      "status": "PENDING",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "customerName": "John Doe"
    }
  ]
}
```

#### <span style="color:#16a085;">Update Table</span>

**Endpoint:** `PUT /api/admin/tables/:id`

**Request Body:**
```json
{
  "tableNumber": "A2",
  "capacity": 6,
  "isAvailable": true
}
```

**Description:** Updates an existing table.

**Response:**
```json
{
  "id": "table123",
  "tableNumber": "A2",
  "capacity": 6,
  "qrCode": "https://example.com/qr/table123",
  "isAvailable": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### <span style="color:#16a085;">Delete Table</span>

**Endpoint:** `DELETE /api/admin/tables/:id`

**Description:** Deletes a table. Cannot delete tables with active orders.

**Response:**
```json
{
  "message": "Table deleted successfully"
}
```

#### <span style="color:#16a085;">Get Table QR Code</span>

**Endpoint:** `GET /api/admin/tables/:id/qrcode`

**Description:** Retrieves QR code for a specific table.

**Response:**
```json
{
  "tableId": "table123",
  "tableNumber": "A1",
  "qrCodeUrl": "https://example.com/qr/table123",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "downloadUrl": "/api/admin/tables/table123/qrcode/download"
}
```

#### <span style="color:#16a085;">Download Table QR Code</span>

**Endpoint:** `GET /api/admin/tables/:id/qrcode/download`

**Description:** Downloads QR code for a specific table as a PNG file.

**Response:** PNG file download

**Headers:**
```
Content-Type: image/png
Content-Disposition: attachment; filename="table-A1-qrcode.png"
```

### <span style="color:#2980b9;">Foodcourts Management</span>

#### <span style="color:#16a085;">Get All Foodcourts (Admin)</span>

**Endpoint:** `GET /api/admin/foodcourts`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `name` (optional): Filter by foodcourt name
- `status` (optional): Filter by foodcourt status

**Description:** Retrieves a list of all foodcourts for admin management.

**Response:**
```json
{
  "data": [
    {
      "id": "fc123",
      "name": "Food Paradise",
      "description": "A variety of delicious foods",
      "address": "Jl. Makan Enak No. 123",
      "image": "https://example.com/image.jpg",
      "imagePublicId": "foodcourts/fc123",
      "category": "MIXED",
      "status": "BUKA",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "owner": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "creator": {
        "id": "admin123",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### <span style="color:#16a085;">Get Available Owners</span>

**Endpoint:** `GET /api/admin/foodcourts/available-owners`

**Description:** Retrieves a list of owners who don't have a foodcourt assigned yet.

**Response:**
```json
{
  "availableOwners": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### <span style="color:#2980b9;">Owners Management</span>

#### <span style="color:#16a085;">Get All Owners</span>

**Endpoint:** `GET /api/admin/owners`

**Description:** Retrieves a list of all owners with their foodcourts.

**Response:**
```json
{
  "owners": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "OWNER",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "ownedFoodcourt": {
        "id": "fc123",
        "name": "Food Paradise",
        "address": "Jl. Makan Enak No. 123"
      }
    }
  ]
}
```

### <span style="color:#2980b9;">Permission Templates</span>

#### <span style="color:#16a085;">Get All Permission Templates</span>

**Endpoint:** `GET /api/admin/permission-templates`

**Query Parameters:**
- `name` (optional): Filter by template name
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Description:** Retrieves a list of all permission templates.

**Response:**
```json
{
  "data": [
    {
      "id": "template123",
      "name": "Full Access",
      "description": "Full access to all features",
      "canManageMenu": true,
      "canViewOrders": true,
      "canManageOrders": true,
      "canViewReports": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "createdBy": {
        "id": "admin123",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### <span style="color:#16a085;">Create Permission Template</span>

**Endpoint:** `POST /api/admin/permission-templates`

**Request Body:**
```json
{
  "name": "Full Access",
  "description": "Full access to all features",
  "canEditMenu": true,
  "canViewOrders": true,
  "canUpdateOrders": true
}
```

**Response:**
```json
{
  "id": "template123",
  "name": "Full Access",
  "description": "Full access to all features",
  "canEditMenu": true,
  "canViewOrders": true,
  "canUpdateOrders": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "createdById": "user123"
}
```

#### <span style="color:#16a085;">Apply Permission Template</span>

**Endpoint:** `POST /api/admin/permission-templates/:id/apply`

**Request Body:**
```json
{
  "ownerIds": ["user123", "user456"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template applied to 2 owners",
  "appliedTo": [
    {
      "ownerId": "user123",
      "ownerName": "John Doe"
    },
    {
      "ownerId": "user456",
      "ownerName": "Jane Smith"
    }
  ]
}
```

### <span style="color:#2980b9;">Permissions History</span>

#### <span style="color:#16a085;">Get Permissions History</span>

**Endpoint:** `GET /api/admin/permissions/history`

**Query Parameters:**
- `ownerId` (optional): Filter by owner ID
- `foodcourtId` (optional): Filter by foodcourt ID
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Description:** Retrieves a history of permission changes.

**Response:**
```json
{
  "data": [
    {
      "id": "history123",
      "changedAt": "2023-01-01T00:00:00.000Z",
      "oldPermissions": {
        "canManageMenu": false,
        "canViewOrders": true,
        "canManageOrders": false,
        "canViewReports": true
      },
      "newPermissions": {
        "canManageMenu": true,
        "canViewOrders": true,
        "canManageOrders": true,
        "canViewReports": true
      },
      "permission": {
        "id": "perm123",
        "owner": {
          "id": "user123",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "foodcourt": {
          "id": "fc123",
          "name": "Food Paradise"
        }
      },
      "changedBy": {
        "id": "admin123",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "ADMIN"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## <span style="color:#e67e22;">Foodcourt Owner APIs</span>
> <span style="color:#2980b9;"><b>Foodcourt Owner</b></span> endpoints.

### <span style="color:#2980b9;">Menu Management</span>

#### <span style="color:#16a085;">Get Menu Items</span>

**Endpoint:** `GET /api/foodcourt/:foodcourtId/menu`

**Query Parameters:**
- `categoryId` (optional): Filter by category ID
- `available` (optional): Filter by availability (true/false)

**Description:** Retrieves menu items for a specific foodcourt.

**Response:**
```json
{
  "menuItems": [
    {
      "id": "menu123",
      "name": "Nasi Goreng",
      "description": "Delicious fried rice",
      "price": 25000,
      "image": "https://example.com/nasigoreng.jpg",
      "imagePublicId": "menu/menu123",
      "isAvailable": true,
      "categoryId": "cat123",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### <span style="color:#16a085;">Create Menu Item</span>

**Endpoint:** `POST /api/foodcourt/:foodcourtId/menu`

**Request Body:**
```json
{
  "name": "Nasi Goreng",
  "description": "Delicious fried rice",
  "price": 25000,
  "isAvailable": true,
  "categoryId": "cat123"
}
```

**Description:** Creates a new menu item for a foodcourt.

**Response:**
```json
{
  "id": "menu123",
  "name": "Nasi Goreng",
  "description": "Delicious fried rice",
  "price": 25000,
  "image": "https://example.com/nasigoreng.jpg",
  "imagePublicId": "menu/menu123",
  "isAvailable": true,
  "categoryId": "cat123",
  "foodcourtId": "fc123",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### <span style="color:#16a085;">Get Menu Item Details</span>

**Endpoint:** `GET /api/foodcourt/:foodcourtId/menu/:menuId`

**Description:** Retrieves details for a specific menu item.

**Response:**
```json
{
  "id": "menu123",
  "name": "Nasi Goreng",
  "description": "Delicious fried rice",
  "price": 25000,
  "image": "https://example.com/nasigoreng.jpg",
  "imagePublicId": "menu/menu123",
  "isAvailable": true,
  "categoryId": "cat123",
  "foodcourtId": "fc123",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### <span style="color:#2980b9;">Orders Management</span>

#### <span style="color:#16a085;">Get Foodcourt Orders</span>

**Endpoint:** `GET /api/foodcourt/:foodcourtId/orders`

**Query Parameters:**
- `status` (optional): Filter by order status
- `activeOnly` (optional): Show only active orders (true/false)
- `historyOnly` (optional): Show only completed/cancelled orders (true/false)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Description:** Retrieves orders for a specific foodcourt.

**Response:**
```json
{
  "orders": [
    {
      "id": "order123",
      "customerName": "John Doe",
      "status": "PENDING",
      "totalAmount": 50000,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "table": {
        "id": "table123",
        "tableNumber": "A1"
      },
      "items": [
        {
          "id": "item123",
          "menuItemId": "menu123",
          "menuItemName": "Nasi Goreng",
          "quantity": 2,
          "unitPrice": 25000,
          "subtotal": 50000,
          "status": "PENDING"
        }
      ]
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### <span style="color:#16a085;">Get Order Details</span>

**Endpoint:** `GET /api/foodcourt/:foodcourtId/orders/:orderId`

**Description:** Retrieves details for a specific order.

**Response:**
```json
{
  "id": "order123",
  "customerName": "John Doe",
  "status": "PENDING",
  "totalAmount": 50000,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "table": {
    "id": "table123",
    "tableNumber": "A1"
  },
  "items": [
    {
      "id": "item123",
      "menuItemId": "menu123",
      "menuItemName": "Nasi Goreng",
      "quantity": 2,
      "unitPrice": 25000,
      "subtotal": 50000,
      "status": "PENDING",
      "specialInstructions": "Extra spicy"
    }
  ],
  "logs": [
    {
      "id": "log123",
      "timestamp": "2023-01-01T00:00:00.000Z",
      "oldStatus": null,
      "newStatus": "PENDING",
      "updatedBy": {
        "id": "system",
        "name": "System"
      }
    }
  ]
}
```

## <span style="color:#e67e22;">Search APIs</span>

### <span style="color:#2980b9;">Search Foodcourts</span>

**Endpoint:** `GET /api/foodcourt/search`

**Query Parameters:**
- `q`: Search query

**Description:** Searches for foodcourts by name.

**Response:**
```json
[
  {
    "id": "fc123",
    "name": "Food Paradise",
    "address": "Jl. Makan Enak No. 123",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "imageUrl": "https://example.com/image.jpg",
    "owner": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

## <span style="color:#e67e22;">Importing to Postman</span>

To import the API collection into Postman:

1. Download the `RGFOOD-API-Collection.json` file
2. Open Postman
3. Click on "Import" in the top left corner
4. Drag and drop the JSON file or click "Upload Files" and select the file
5. Click "Import"

After importing, you'll have access to all the documented endpoints in Postman. You can set up environment variables for the base URL to easily switch between development and production environments.

### <span style="color:#2980b9;">Setting Up Environment Variables</span>

1. Click on "Environments" in the sidebar
2. Click "Add" to create a new environment
3. Name it (e.g., "RGFOOD Development")
4. Add a variable named "baseUrl" with the value "http://localhost:3000"
5. Click "Save"
6. Select the environment from the dropdown in the top right corner

Now you can use the collection with the configured environment variables.

### <span style="color:#2980b9;">Authentication in Postman</span>

For