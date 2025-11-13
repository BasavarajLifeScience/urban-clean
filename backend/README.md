# Society Booking API

Backend API for the Society Service Booking Application - A multi-role platform connecting residents with service providers (Sevaks).

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Models](#database-models)
- [Testing](#testing)

## 🛠 Tech Stack

- **Runtime**: Node.js v20+ LTS
- **Framework**: Express.js v5+
- **Database**: MongoDB v7+ with Mongoose ODM v8+
- **Authentication**: JWT (jsonwebtoken v9+) with refresh token strategy
- **Validation**: Zod v3+ for schema validation
- **Security**: helmet, express-rate-limit, bcryptjs, cors
- **File Upload**: multer v1.4+
- **Payment**: Razorpay Node SDK v2+
- **Logging**: winston v3+ with morgan

## ✨ Features

### Authentication & User Management
- Multi-role system (Resident, Sevak, Vendor)
- JWT-based authentication with refresh tokens
- OTP verification for registration and password reset
- Secure password hashing with bcrypt
- Profile management with document uploads

### Service Management
- Browse services by category
- Search and filter services
- Service ratings and reviews
- Favorite services

### Booking System
- Create and manage bookings
- Real-time booking status tracking
- Reschedule and cancel bookings
- Available time slots API
- OTP-based check-in system

### Payment Integration
- Razorpay payment gateway integration
- Secure payment verification
- Invoice generation
- Payment history
- Refund processing

### Sevak Features
- Job management dashboard
- Check-in/out with OTP
- Before/after photo uploads
- Issue reporting
- Earnings tracking
- Performance metrics
- Attendance tracking

### Notifications
- In-app notifications
- Notification preferences
- Real-time status updates

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, JWT, Razorpay)
│   ├── models/          # Mongoose models
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware (auth, validation, error handling)
│   ├── services/        # Business logic (OTP, payments, notifications)
│   ├── utils/           # Utility functions and helpers
│   └── app.js           # Express app configuration
├── uploads/             # File uploads directory
│   ├── avatars/
│   ├── documents/
│   └── job-photos/
├── logs/                # Application logs
├── .env                 # Environment variables
├── server.js            # Server entry point
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js v20+ installed
- MongoDB v7+ installed and running
- npm or yarn package manager

### Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**:
   ```bash
   mongod --dbpath /path/to/data
   ```

4. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

5. **Start the server**:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

### Test Credentials

After running the seed script:

- **Resident**: resident@example.com / password123
- **Sevak**: sevak@example.com / password123
- **Vendor**: vendor@example.com / password123

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "email": "user@example.com",
  "password": "password123",
  "role": "resident",
  "fullName": "John Doe"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "userId": "user_id",
  "otp": "123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "phoneOrEmail": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Service Endpoints

#### Get All Services
```http
GET /services?category=Cleaning&page=1&limit=10
```

#### Get Service by ID
```http
GET /services/:serviceId
```

#### Get Categories
```http
GET /services/categories
```

#### Add to Favorites (Protected)
```http
POST /services/favorites
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceId": "service_id"
}
```

### Booking Endpoints (All Protected)

#### Create Booking
```http
POST /bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceId": "service_id",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "10:00",
  "address": {
    "flatNumber": "101",
    "society": "Green Valley",
    "city": "Mumbai"
  },
  "specialInstructions": "Please call before arrival"
}
```

#### Get My Bookings
```http
GET /bookings/my-bookings?status=pending&page=1&limit=10
Authorization: Bearer <access_token>
```

#### Get Available Slots
```http
GET /bookings/available-slots?serviceId=service_id&date=2024-01-15
```

### Payment Endpoints (All Protected)

#### Create Payment Order
```http
POST /payments/create-order
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bookingId": "booking_id",
  "amount": 1500
}
```

#### Verify Payment
```http
POST /payments/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "razorpayOrderId": "order_id",
  "razorpayPaymentId": "payment_id",
  "razorpaySignature": "signature"
}
```

### Sevak Endpoints (Protected - Sevak Role Only)

#### Get Jobs
```http
GET /sevak/jobs?date=2024-01-15&status=assigned
Authorization: Bearer <access_token>
```

#### Check-In
```http
POST /sevak/check-in
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bookingId": "booking_id",
  "otp": "123456",
  "location": { "lat": 19.0760, "lng": 72.8777 }
}
```

#### Complete Job
```http
PATCH /sevak/jobs/:bookingId/complete
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

beforeImages: [files]
afterImages: [files]
completionNotes: "Job completed successfully"
```

#### Get Earnings
```http
GET /sevak/earnings?period=month
Authorization: Bearer <access_token>
```

### Rating Endpoints

#### Create Rating (Protected)
```http
POST /ratings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bookingId": "booking_id",
  "ratedTo": "sevak_id",
  "rating": 5,
  "comment": "Excellent service!"
}
```

#### Get Sevak Ratings
```http
GET /ratings/sevak/:sevakId?page=1&limit=10
```

### Notification Endpoints (All Protected)

#### Get Notifications
```http
GET /notifications?page=1&limit=20&isRead=false
Authorization: Bearer <access_token>
```

#### Mark as Read
```http
PATCH /notifications/:notificationId/read
Authorization: Bearer <access_token>
```

## 🔐 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/society-booking

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# CORS
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19001

# OTP (Development)
DEV_OTP=123456
```

## 💾 Database Models

- **User**: Authentication and user information
- **Profile**: Extended user profile with role-specific fields
- **Service**: Service catalog
- **Category**: Service categories
- **Booking**: Booking management
- **Payment**: Payment transactions
- **Invoice**: Invoice generation
- **Rating**: Service ratings and reviews
- **Notification**: In-app notifications
- **NotificationSettings**: User notification preferences
- **Issue**: Sevak issue reporting
- **Earnings**: Sevak earnings tracking
- **OTP**: OTP verification
- **RefreshToken**: JWT refresh tokens
- **Favorite**: User favorite services
- **Checklist**: Service completion checklists

## 🧪 Testing

### Test with Seed Data

```bash
npm run seed
```

### Test OTP

In development mode, use the fixed OTP: `123456`

### Test Payment Cards (Razorpay)

- **Success**: 4111 1111 1111 1111
- **Failure**: 4111 1111 1111 1112
- Use any CVV and future expiry date

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": { }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS configuration
- Helmet for security headers
- Input validation and sanitization
- File upload restrictions
- MongoDB injection prevention

## 📄 License

MIT

## 👥 Support

For issues and questions, please open an issue in the repository.
