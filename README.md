# 🍔 FoodCourt Management System

A comprehensive web application for managing food courts, menus, and orders. This system connects food court owners with customers, streamlining the ordering process and providing powerful management tools.

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📦 Dependencies](#-dependencies)
- [📷 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- **Multi-tenant Architecture**: Supports multiple food courts with their own menus and item management.
- **Role-based Access Control**: Different interfaces for admins, food court owners, and customers.
- **QR Code Table Integration**: Customers can scan QR codes at tables to place orders.
- **Real-time Order Management**: Food court owners receive orders in real-time and can update status.
- **Menu Management**: Easy-to-use interface for creating and updating menu items and categories.
- **Dashboard & Analytics**: Performance insights for food court owners.
- **Responsive Design**: Works seamlessly on mobile and desktop devices.

---

## 🛠️ Tech Stack

[![Next.js](https://img.shields.io/badge/Next.js-13+-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-4.15.0-blue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.22.0-green.svg)](https://next-auth.js.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black.svg)](https://vercel.com/)


- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Prisma ORM.
- **Database**: PostgreSQL.
- **Authentication**: NextAuth.js.
- **State Management**: React Context API.
- **Real-time Updates**: WebSockets.
- **Deployment**: Vercel.

---

## 🚀 Getting Started

Follow these steps to set up the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/DeveloperRG/RGFOOD.git
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the required variables:
   ```
   DATABASE_URL=your_database_url
   NEXTAUTH_SECRET=your_secret
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---


## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

---
