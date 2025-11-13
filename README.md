# Society Service Booking Application - POC

A comprehensive multi-role mobile platform connecting residents with verified service providers (Sevaks) for cleaning, maintenance, and other services.

## 🎯 Project Overview

This is a **Proof of Concept (POC)** application demonstrating Phase 1 features with production-ready code quality, scalability, and best practices. The application supports three user roles:

- **Residents**: Browse and book services, make payments, rate service providers
- **Sevaks**: Manage jobs, check-in/out, track earnings and performance
- **Vendors**: Manage business profiles and services (basic implementation)

## 🏗️ Architecture

The project consists of two main components:

### Backend (Node.js + Express + MongoDB)
- RESTful API with comprehensive endpoints
- JWT-based authentication with refresh tokens
- Razorpay payment integration
- File upload handling
- Real-time notifications
- Role-based access control

### Frontend (React Native + Expo)
- Cross-platform mobile app (iOS & Android)
- TypeScript for type safety
- React Navigation for routing
- Axios for API integration
- React Native Paper for UI components
- Expo for simplified development

## 📁 Project Structure

```
urban-clean/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # Database models
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── uploads/            # File uploads
│   └── server.js           # Entry point
│
├── frontend/                # React Native mobile app (To be implemented)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── navigation/     # Navigation setup
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   └── App.tsx             # Root component
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js v20+ LTS
- MongoDB v7+
- npm or yarn
- Expo CLI (for mobile app)

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start MongoDB**:
   ```bash
   mongod --dbpath /path/to/data
   ```

4. **Seed database**:
   ```bash
   npm run seed
   ```

5. **Start server**:
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:5000`

### Test Credentials

- **Resident**: resident@example.com / password123
- **Sevak**: sevak@example.com / password123
- **Vendor**: vendor@example.com / password123
- **OTP**: 123456 (development mode)

## 📋 Features Implemented

### ✅ Phase 1 - Core Features

#### User Management & Security (F-001, F-002, F-003)
- ✅ Multi-role registration (Resident, Sevak, Vendor)
- ✅ OTP-based verification
- ✅ JWT authentication with refresh tokens
- ✅ Profile management with document uploads
- ✅ KYC document handling
- ✅ Rating and feedback system

#### Resident App (F-004, F-005, F-006, F-007, F-008, F-009)
- ✅ Service discovery with search and filters
- ✅ Service categories
- ✅ Favorites/wishlist
- ✅ Booking creation and management
- ✅ Reschedule and cancel bookings
- ✅ Available time slots
- ✅ Razorpay payment integration
- ✅ Invoice generation
- ✅ Payment history
- ✅ Refund processing
- ✅ In-app notifications

#### Sevak App (F-010, F-011, F-012, F-013, F-014, F-015)
- ✅ Job management dashboard
- ✅ Job details with resident information
- ✅ OTP-based check-in system
- ✅ Check-out functionality
- ✅ Before/after photo uploads
- ✅ Completion notes
- ✅ Issue reporting with photos
- ✅ Earnings tracking
- ✅ Performance metrics
- ✅ Feedback and reviews
- ✅ Attendance history

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express.js v5+
- **Database**: MongoDB v7+ with Mongoose v8+
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod v3+
- **Security**: helmet, rate limiting, bcryptjs, CORS
- **Payment**: Razorpay SDK v2+
- **File Upload**: multer v1.4+
- **Logging**: winston v3+

### Frontend (To be implemented)
- **Framework**: React Native with Expo SDK 52+
- **Language**: TypeScript
- **Navigation**: React Navigation v7+
- **State Management**: Context API + Zustand
- **HTTP Client**: Axios v1.6+
- **UI Library**: React Native Paper v5+
- **Forms**: React Hook Form v7+ with Zod

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token

#### Services
- `GET /services` - Get all services (with filters)
- `GET /services/:id` - Get service details
- `GET /services/categories` - Get all categories

#### Bookings
- `POST /bookings` - Create booking
- `GET /bookings/my-bookings` - Get user bookings
- `PATCH /bookings/:id/reschedule` - Reschedule booking
- `PATCH /bookings/:id/cancel` - Cancel booking

#### Payments
- `POST /payments/create-order` - Create Razorpay order
- `POST /payments/verify` - Verify payment
- `GET /payments/history` - Payment history

#### Sevak
- `GET /sevak/jobs` - Get assigned jobs
- `POST /sevak/check-in` - Check-in to job
- `POST /sevak/check-out` - Check-out from job
- `GET /sevak/earnings` - Get earnings

For complete API documentation, see [backend/README.md](backend/README.md)

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS configuration
- Helmet for security headers
- Input validation and sanitization
- File upload restrictions
- MongoDB injection prevention
- OTP verification for critical actions

## 📊 Database Schema

Key collections:
- **users**: Authentication and basic info
- **profiles**: Extended user profiles
- **services**: Service catalog
- **bookings**: Booking management
- **payments**: Payment transactions
- **ratings**: Reviews and ratings
- **notifications**: User notifications
- **earnings**: Sevak earnings tracking

## 🧪 Testing

### Backend Testing

1. **Run seed script**:
   ```bash
   cd backend
   npm run seed
   ```

2. **Test API endpoints** using:
   - Postman
   - cURL
   - Any HTTP client

### Test Data

- 3 test users (one per role)
- 5 service categories
- 8 sample services
- Complete with ratings and reviews

## 🚧 Future Enhancements (Phase 2+)

- Real-time chat between residents and sevaks
- Advanced search with AI recommendations
- Multi-language support
- Push notifications (Firebase)
- In-app wallet
- Subscription packages
- Vendor management portal
- Admin dashboard
- Analytics and reporting
- Social login (Google, Apple)

## 📝 Development Guidelines

### Code Style
- ESLint + Prettier for formatting
- TypeScript strict mode
- Meaningful variable/function names
- Comprehensive error handling
- Logging for debugging

### Git Workflow
- Feature branch naming: `feature/feature-name`
- Commit message format: `feat: Add user registration`
- Pull requests for all changes

### Best Practices
- JWT security
- Input validation
- Error handling
- Code documentation
- API versioning
- Environment-based configuration

## 🐛 Known Issues & Limitations (POC)

1. OTP is fixed in development (123456)
2. SMS/Email services are mocked
3. Push notifications not implemented
4. No admin panel
5. Limited vendor functionality
6. Basic analytics only

## 📄 License

MIT License - This is a POC project

## 👥 Contributors

- Development Team

## 🆘 Support

For issues or questions:
1. Check the documentation in each module's README
2. Review API documentation
3. Check logs in `backend/logs/`
4. Open an issue in the repository

## 🎯 Project Status

**Current Phase**: Phase 1 POC - Backend Complete ✅

**Next Steps**:
1. Implement React Native mobile app
2. Integration testing
3. Performance optimization
4. Production deployment preparation

---

**Built with ❤️ using Node.js, Express, MongoDB, and React Native**
