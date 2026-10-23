# VendiSphere — Smart Multi-Vendor E-Commerce & Vendor Intelligence Platform

> **A modern, full-stack MERN e-commerce ecosystem empowering independent merchants with automated inventory intelligence, robust role-based access control, and an explainable AI shopping assistant.**

---

## 1. System Architecture & Tech Stack

VendiSphere is built with an enterprise-grade MERN architecture:

- **Frontend**: React 19, React Router DOM 7, Vite 8, Vanilla CSS design tokens with custom CSS variables, responsive mobile-first layouts, and accessible contrast ratios.
- **Backend**: Node.js v24+, Express 4.21, Mongoose 8.12, JSON Web Tokens (`jsonwebtoken`), bcryptjs, cookie-parser, CORS, dotenv.
- **Database**: MongoDB (Local standalone or MongoDB Atlas replica set).
- **Security**: HTTP-only session cookies, server-side role authorization middleware, atomic stock decrement protection against concurrency races, and no client-side price trust.
- **Intelligence**: Hybrid AI architecture combining deterministic local intent parsing and budget matching with optional Google Gemini LLM external integration.

---

## 2. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher (v24.x recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Community Server v6.x or higher, or a MongoDB Atlas cluster URI

---

## 3. Quick Start & Setup Guide

### 3.1 Clone & Setup Environment Files

Copy the provided environment templates into active `.env` files:

#### Server Configuration
```bash
cd server
cp .env.example .env
```
Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vendisphere
JWT_SECRET=your_super_secret_jwt_key_here
AI_API_KEY=   # (Optional) Leave blank for high-speed local deterministic intelligence
```

#### Client Configuration
```bash
cd ../client
cp .env.example .env
```
Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3.2 Install Dependencies

From the workspace root:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3.3 Seed Sample Data (Optional)

To initialize sample vendors, customers, products, and initial orders:
```bash
cd server
npm run seed
```
> **Note**: The seed script populates 4 demo accounts and 8 initial marketplace products across Electronics, Fashion, Grocery, Accessories, and Home & Kitchen.

### 3.4 Start the Platform

Run both services in separate terminals:

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# Server listens on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 4. Demo User Accounts

| Role | Email | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@vendisphere.com` | `admin123` | Platform oversight, vendor approvals/rejections, user accounts, and catalog moderation. |
| **Approved Vendor** | `techvendor@vendisphere.com` | `password123` | Full vendor portal: Product CRUD, smart inventory velocity tracking, customer order fulfillment, and AI store insights. |
| **Pending Vendor** | `pendingvendor@vendisphere.com` | `password123` | Demonstrates the admin approval gate: Displays approval pending notice until verified by admin. |
| **Customer** | `customer@vendisphere.com` | `password123` | Browse catalog, search, filter by category/price, AI Shopping Assistant, persistent cart, checkout, order tracking, and reviews. |

---

## 5. API Reference

All backend endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register customer or vendor (vendors created in `pending` state). |
| `POST` | `/auth/login` | Public | Login and receive HTTP-only cookie + Bearer token. |
| `POST` | `/auth/logout` | Public | Clear session cookie. |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile. |

### Products & Catalog (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Query catalog with filters: `search`, `category`, `minPrice`, `maxPrice`, `inStockOnly`, `sort`. |
| `GET` | `/products/:id` | Public | Retrieve product details with vendor info and rating. |
| `POST` | `/products` | Approved Vendor / Admin | Create a new product listing. |
| `PUT` | `/products/:id` | Owner Vendor / Admin | Update product information, price, and inventory. |
| `DELETE` | `/products/:id` | Owner Vendor / Admin | Delete product listing. |

### Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Customer | Retrieve persistent cart with populated product details. |
| `POST` | `/cart` | Customer | Add product to cart with quantity check. |
| `PUT` | `/cart/:itemId` | Customer | Update item quantity in cart. |
| `DELETE` | `/cart/:itemId` | Customer | Remove item from cart. |

### Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Customer | Place order with atomic stock decrement and cart clear. |
| `GET` | `/orders` | Customer | View customer order history. |
| `GET` | `/orders/:id` | Owner / Vendor / Admin | View full order receipt and tracking timeline. |
| `PUT` | `/orders/:id/status`| Vendor in Order / Admin | Update fulfillment status (`Placed`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`). Automatically restores stock on cancellation. |

### Vendor Portal (`/api/vendor`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/vendor/products` | Approved Vendor | View all products listed by this vendor. |
| `GET` | `/vendor/inventory` | Approved Vendor | Real-time stock velocity, stockout predictions, and 14-day reorder suggestions. |
| `GET` | `/vendor/orders` | Approved Vendor | View orders containing products sold by this vendor. |
| `GET` | `/vendor/analytics` | Approved Vendor | Real revenue totals (excluding cancellations), unit sales, and top products. |

### Admin Oversight (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/analytics` | Admin | Gross platform revenue (excluding cancelled orders), total orders, vendors, and customers. |
| `GET` | `/admin/vendors` | Admin | List all vendor profiles with approval status. |
| `PUT` | `/admin/vendors/:id/approve` | Admin | Approve vendor storefront for marketplace selling. |
| `PUT` | `/admin/vendors/:id/reject` | Admin | Reject vendor storefront application. |
| `GET` | `/admin/users` | Admin | List all registered user accounts. |
| `GET` | `/admin/orders` | Admin | Master transaction list across all platform vendors. |

### Hybrid AI Intelligence (`/api/ai`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/shopping-assistant` | Public | Extracts budget constraints, category intent, and keywords from natural language; returns scored real products. |
| `POST` | `/ai/vendor-insights` | Approved Vendor | Generates automated stock risk audits, average order value analysis, and growth recommendations. |

---

## 6. Automated Testing

Run the automated backend test suite:
```bash
cd server
npm test
```
The test runner validates:
1. API Health Check
2. Customer, Vendor, and Admin Authentication
3. Product Search, Filtering, and Sorting
4. Persistent Cart Operations
5. Atomic Order Concurrency & Stock Decrement
6. Order Cancellation & Stock Restoration
7. Vendor Inventory Intelligence & Reorder Formula
8. AI Shopping Assistant Intent & Budget Boundaries
9. Admin Vendor Approval Workflow
10. Admin Gross Revenue Calculations

---

## 7. Troubleshooting

- **MongoDB Connection Error**: Ensure the MongoDB service is running locally (`net start MongoDB` on Windows) or check your `MONGO_URI` in `server/.env`.
- **CORS Error**: Ensure `server/.env` `PORT` matches the port expected by `client/src/services/api.js` (default `5000`), and `client` is running on `http://localhost:5173`.
- **Vendor Access Denied (403)**: If registered as a vendor, an admin must approve the vendor application in the Admin Portal before products can be created.
