# CoreHex Rental Management Backend

A scalable REST API built with **Node.js, Express, MongoDB, and Mongoose** powering the CoreHex Rental Management System.

The backend provides:

* Authentication & Authorization
* Equipment Management
* Booking Management
* Quote Requests
* Customer Analytics
* Inventory Tracking
* Notifications
* Dashboard Analytics

---

# Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* HTTP-only Cookie Authentication
* bcryptjs
* cookie-parser
* dotenv
* cors

---

# Dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken cookie-parser
```

Development:

```bash
npm install nodemon --save-dev
```

---

# Project Structure

```text
backend
│
├── config
│     └── db.js
│
├── controllers
│     ├── analyticsController.js
│     ├── bookingController.js
│     ├── customerController.js
│     ├── equipmentController.js
│     ├── inventoryController.js
│     ├── notificationController.js
│     ├── quoteController.js
│     └── userController.js
│
├── middleware
│     ├── authMiddleware.js
│     └── adminMiddleware.js
│
├── models
│     ├── bookingModel.js
│     ├── equipmentModel.js
│     ├── notificationModel.js
│     ├── quoteModel.js
│     └── userModel.js
│
├── routes
│     ├── analyticsRoutes.js
│     ├── bookingRoutes.js
│     ├── customerRoutes.js
│     ├── equipmentRoutes.js
│     ├── inventoryRoutes.js
│     ├── notificationRoutes.js
│     ├── quoteRoutes.js
│     └── userRoutes.js
│
├── utils
│     └── generateToken.js
│
├── .env
├── server.js
└── package.json
```

---

# Architecture

```text
Routes
   ↓
Controllers
   ↓
Models
   ↓
MongoDB
```

Authentication:

```text
Client
   ↓
HTTP-only Cookie
   ↓
Protect Middleware
   ↓
Admin Middleware
   ↓
Controller
```

---

# Environment Variables

```env
PORT=5000

MONGO_URI=<mongodb connection string>

JWT_SECRET=<secret key>

NODE_ENV=development
```

---

# Authentication

Uses:

* JWT
* HTTP-only cookies
* Role based authorization

Roles:

```text
admin
user
```

---

# API Base URL

```text
/api
```

---

# User APIs

## Register

POST

```text
/api/users/register
```

Request:

```json
{
  "name":"Admin User",
  "email":"admin@example.com",
  "password":"Admin@123",
  "role":"admin"
}
```

---

## Login

POST

```text
/api/users/login
```

Request:

```json
{
  "email":"admin@example.com",
  "password":"Admin@123"
}
```

---

## Logout

POST

```text
/api/users/logout
```

---

## Current User

GET

```text
/api/users/me
```

---

# Equipment APIs

## Create Equipment

POST

```text
/api/equipment
```

Request:

```json
{
  "name":"MacBook Pro M3",
  "slug":"macbook-pro-m3",
  "category":"laptops",
  "description":"Apple laptop",
  "dailyRate":150,
  "weeklyRate":900,
  "monthlyRate":3000,
  "totalQuantity":10,
  "availableQuantity":8
}
```

---

## Routes

```text
GET     /api/equipment
GET     /api/equipment/:id
POST    /api/equipment
PUT     /api/equipment/:id
DELETE  /api/equipment/:id
```

---

# Booking APIs

Request:

```json
{
  "equipmentSlug":"macbook-pro-m3",
  "startDate":"2026-06-25",
  "endDate":"2026-06-30",
  "quantity":2,
  "name":"John Doe",
  "company":"Acme",
  "email":"john@acme.com",
  "phone":"+919876543210",
  "estimatedCost":1200
}
```

Routes:

```text
GET     /api/bookings
GET     /api/bookings/:id
POST    /api/bookings
PATCH   /api/bookings/:id
DELETE  /api/bookings/:id
```

---

# Quote APIs

Request:

```json
{
  "name":"John Doe",
  "company":"Acme",
  "email":"john@acme.com",
  "phone":"+919876543210",
  "items":[
    {
      "slug":"macbook-pro-m3",
      "quantity":2
    }
  ]
}
```

Routes:

```text
GET     /api/quotes
GET     /api/quotes/:id
POST    /api/quotes
PATCH   /api/quotes/:id
```

---

# Customer APIs

Derived from:

* Bookings
* Quotes

Routes:

```text
GET /api/customers

GET /api/customers/:email
```

Returns:

* Customer profile
* Booking history
* Quote history
* Lifetime revenue

---

# Analytics APIs

## Overview

```text
GET /api/analytics/overview
```

Returns:

* Total Equipment
* Active Rentals
* Pending Bookings
* Monthly Revenue
* Utilization
* Available Inventory

---

## Revenue Trends

```text
GET /api/analytics/trends
```

Query:

```text
?granularity=weekly
?granularity=monthly
?granularity=quarterly
?granularity=yearly
```

---

## Category Performance

```text
GET /api/analytics/category-performance
```

---

## Most Rented Equipment

```text
GET /api/analytics/most-rented
```

---

# Inventory APIs

## Summary

```text
GET /api/inventory/summary
```

Returns:

* Total Stock
* Available Stock
* Rented Stock
* Maintenance Stock
* Low Stock
* Out Of Stock

---

## Inventory List

```text
GET /api/inventory
```

---

# Notification APIs

Notifications are automatically generated from:

* Bookings
* Quotes
* Inventory events

Routes:

```text
GET     /api/notifications

GET     /api/notifications/unread-count

PATCH   /api/notifications/:id

PATCH   /api/notifications/read-all
```

---

# Middleware

## protect

Verifies JWT from HTTP-only cookies.

Attaches:

```js
req.user
```

---

## admin

Allows only:

```text
role = admin
```

---

# Main Features

JWT Authentication

Cookie-based Sessions

Role-Based Authorization

Equipment CRUD

Booking Management

Quote Management

Customer Analytics

Dashboard Analytics

Inventory Tracking

Notification System

Low Stock Alerts

Admin Dashboard Support

MongoDB Persistence
