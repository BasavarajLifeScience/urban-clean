# Society Service Booking Application - POC Build Prompt (With Admin Module)

## Project Overview

Build a **Proof of Concept (POC)** for a Society Service Booking Application - a multi-role mobile platform connecting Residents with verified service providers (Sevaks) for cleaning, maintenance, and other services. This POC focuses on **Phase 1 features** with production-ready code quality, scalability, and best practices.

**Updated**: This version includes comprehensive **Admin Dashboard** functionality for central oversight, operations management, and platform control.

---

## User Roles

1. **Resident**: End-users who book services
2. **Sevak**: Service providers who fulfill bookings
3. **Vendor**: Business entities managing multiple Sevaks
4. **Admin**: Platform administrators with full system access and control

---

## Tech Stack & Versions

### Frontend
- **React Native**: Latest stable version with **Expo SDK 52+**
- **Navigation**: React Navigation v7+ (Stack, Bottom Tabs, Drawer)
- **State Management**: React Context API + Zustand (for complex state)
- **HTTP Client**: Axios v1.6+ with interceptors
- **Storage**: Expo SecureStore for tokens + AsyncStorage for preferences
- **UI Library**: React Native Paper v5+ (Material Design)
- **Forms**: React Hook Form v7+ with Zod validation
- **Icons**: @expo/vector-icons with Material Icons
- **Image Handling**: Expo Image Picker v15+
- **Animations**: React Native Reanimated v3+
- **Maps**: react-native-maps (if needed for location)
- **Charts & Analytics**: react-native-chart-kit or Victory Native for admin dashboards

### Backend
- **Runtime**: Node.js v20+ LTS
- **Framework**: Express.js v5+
- **Database**: MongoDB v7+ with Mongoose ODM v8+
- **Authentication**: JWT (jsonwebtoken v9+) with refresh token strategy
- **Validation**: Zod v3+ for schema validation
- **Security**: 
  - helmet v7+ (security headers)
  - express-rate-limit v7+ (rate limiting)
  - bcryptjs v2.4+ (password hashing)
  - cors v2.8+ (CORS configuration)
- **File Upload**: multer v1.4+ for image handling
- **Payment**: Razorpay Node SDK v2+
- **Notifications**: node-cron v3+ for scheduled tasks
- **API Documentation**: Swagger/OpenAPI v3
- **Logging**: winston v3+ with morgan
- **Environment**: dotenv v16+
- **Admin Reporting**: agregation pipelines with MongoDB

### DevOps & Tools
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky for pre-commit hooks
- **API Testing**: Jest + Supertest
- **Environment**: Development, Staging, Production configs

---

## Phase 1 Features - Detailed Requirements

### Module 1: User Management & Security

#### 1.1 User Registration & Secure Login
**Feature ID**: F-001

**Requirements**:
- Support four user roles: Resident, Sevak, Vendor, Admin
- Phone number and email-based registration
- OTP verification via SMS (mock for POC, integrate Twilio/AWS SNS later)
- Password-based login with remember me option
- Social login preparation (Google/Apple) - UI ready, backend hooks
- Account verification status tracking
- Admin accounts created only by super admin (no public registration)

**Frontend Components**:
```
screens/
  auth/
    WelcomeScreen.tsx          // Landing page with role selection
    LoginScreen.tsx            // Phone/Email + Password login
    RegisterScreen.tsx         // Registration form with role selection
    OTPVerificationScreen.tsx  // OTP input with resend functionality
    ForgotPasswordScreen.tsx   // Password reset flow
    AdminLoginScreen.tsx       // Dedicated admin login portal
```

**Backend APIs**:
```
POST /api/v1/auth/register
  Body: { phoneNumber, email, password, role, fullName }
  Response: { userId, message: "OTP sent" }

POST /api/v1/auth/verify-otp
  Body: { userId, otp }
  Response: { accessToken, refreshToken, user }

POST /api/v1/auth/login
  Body: { phoneOrEmail, password }
  Response: { accessToken, refreshToken, user }

POST /api/v1/auth/admin-login
  Body: { email, password, adminCode }
  Response: { accessToken, refreshToken, admin }

POST /api/v1/auth/refresh-token
  Body: { refreshToken }
  Response: { accessToken }

POST /api/v1/auth/forgot-password
  Body: { phoneOrEmail }
  Response: { message: "OTP sent" }

POST /api/v1/auth/reset-password
  Body: { userId, otp, newPassword }
  Response: { message: "Password reset successful" }
```

**Data Models**:
```javascript
// User Schema
{
  _id: ObjectId,
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['resident', 'sevak', 'vendor', 'admin'], required: true },
  fullName: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBlacklisted: { type: Boolean, default: false }, // For Sevaks
  blacklistReason: String,
  blacklistedAt: Date,
  blacklistedBy: { type: ObjectId, ref: 'User' }, // Admin who blacklisted
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

// Admin Schema (extends User)
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  adminCode: { type: String, required: true, unique: true },
  permissions: [{
    module: { type: String, enum: ['users', 'services', 'bookings', 'payments', 'analytics', 'content', 'notifications', 'settings'] },
    actions: [{ type: String, enum: ['view', 'create', 'edit', 'delete', 'approve'] }]
  }],
  isSuperAdmin: { type: Boolean, default: false },
  department: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

// OTP Schema (for verification)
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  otp: String,
  type: { type: String, enum: ['registration', 'login', 'password-reset'] },
  expiresAt: Date,
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}

// RefreshToken Schema
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  token: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
}
```

---

#### 1.2 Profile Setup & KYC
**Feature ID**: F-002

**Requirements**:
- Resident: Basic profile (name, flat number, society details)
- Sevak: Professional profile (skills, experience, documents, photo)
- Vendor: Business profile (business name, services offered, documents)
- Admin: Professional profile (name, department, permissions)
- Document upload with validation (Aadhaar, PAN, certificates)
- Profile completion progress indicator
- Avatar upload with image compression

**Frontend Components**:
```
screens/
  profile/
    ProfileSetupScreen.tsx        // Multi-step profile wizard
    ResidentProfileScreen.tsx     // Resident-specific fields
    SevakProfileScreen.tsx        // Sevak KYC form
    VendorProfileScreen.tsx       // Vendor business details
    AdminProfileScreen.tsx        // Admin profile management
    DocumentUploadScreen.tsx      // Document upload interface
    ProfilePreviewScreen.tsx      // Review before submission

components/
  profile/
    AvatarPicker.tsx             // Image picker with cropping
    DocumentUploader.tsx         // Multi-document upload
    ProgressIndicator.tsx        // Profile completion percentage
    SkillSelector.tsx            // Multi-select for Sevak skills
```

**Backend APIs**:
```
GET /api/v1/users/profile
  Headers: { Authorization: Bearer <token> }
  Response: { user, profile }

PUT /api/v1/users/profile
  Headers: { Authorization: Bearer <token> }
  Body: { firstName, lastName, avatar, ...roleSpecificFields }
  Response: { profile, isComplete }

POST /api/v1/users/profile/documents
  Headers: { Authorization: Bearer <token> }
  Body: FormData (multipart/form-data)
  Response: { documentUrls }

DELETE /api/v1/users/profile/documents/:documentId
  Headers: { Authorization: Bearer <token> }
  Response: { message }
```

**Data Models**:
```javascript
// Profile Schema
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  avatar: String, // URL
  
  // Common fields
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  
  // Address
  address: {
    flatNumber: String,
    building: String,
    society: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  
  // Resident specific
  emergencyContact: {
    name: String,
    phoneNumber: String,
    relationship: String
  },
  
  // Sevak specific
  skills: [String],
  experience: Number, // in years
  bio: String,
  documents: [{
    type: { type: String, enum: ['aadhaar', 'pan', 'certificate', 'police-verification', 'other'] },
    url: String,
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verifiedBy: { type: ObjectId, ref: 'User' }, // Admin who verified
    verificationNotes: String,
    uploadedAt: Date,
    verifiedAt: Date
  }],
  availability: {
    days: [String], // ['Monday', 'Tuesday', ...]
    timeSlots: [String] // ['09:00-12:00', '14:00-18:00']
  },
  
  // Vendor specific
  businessName: String,
  businessType: String,
  gstNumber: String,
  servicesOffered: [String],
  
  // Metadata
  profileCompletionPercentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

---

#### 1.3 Feedback & Ratings
**Feature ID**: F-003

**Requirements**:
- 5-star rating system for services and Sevaks
- Text feedback/review with character limit
- Rating submission only after service completion
- Display average ratings on profiles
- Filter and sort reviews (most recent, highest rated)
- Report inappropriate reviews
- Admin moderation of reported reviews

**Frontend Components**:
```
screens/
  ratings/
    RatingScreen.tsx              // Post-service rating interface
    ReviewsListScreen.tsx         // View all reviews
    ReviewModerationScreen.tsx    // Admin review moderation (Admin only)
    
components/
  ratings/
    StarRating.tsx                // Interactive star rating
    RatingModal.tsx               // Quick rating popup
    ReviewCard.tsx                // Display single review
    RatingsSummary.tsx            // Average rating display
    ReviewForm.tsx                // Text feedback input
    ReviewReportModal.tsx         // Report inappropriate review
```

**Backend APIs**:
```
POST /api/v1/ratings
  Headers: { Authorization: Bearer <token> }
  Body: { bookingId, ratedTo, rating, comment }
  Response: { rating }

GET /api/v1/ratings/sevak/:sevakId
  Query: { page, limit, sort }
  Response: { ratings, averageRating, totalCount }

GET /api/v1/ratings/booking/:bookingId
  Headers: { Authorization: Bearer <token> }
  Response: { rating }

PUT /api/v1/ratings/:ratingId
  Headers: { Authorization: Bearer <token> }
  Body: { rating, comment }
  Response: { rating }

DELETE /api/v1/ratings/:ratingId
  Headers: { Authorization: Bearer <token> }
  Response: { message }

POST /api/v1/ratings/:ratingId/report
  Headers: { Authorization: Bearer <token> }
  Body: { reason, description }
  Response: { message }

// Admin endpoints
GET /api/v1/admin/ratings/reported
  Headers: { Authorization: Bearer <admin-token> }
  Query: { page, limit, status }
  Response: { reports, totalCount }

PUT /api/v1/admin/ratings/:ratingId/moderate
  Headers: { Authorization: Bearer <admin-token> }
  Body: { action: 'approve' | 'remove' | 'warning', notes }
  Response: { rating }
```

**Data Models**:
```javascript
// Rating Schema
{
  _id: ObjectId,
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  ratedBy: { type: ObjectId, ref: 'User', required: true }, // Resident
  ratedTo: { type: ObjectId, ref: 'User', required: true }, // Sevak
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  photos: [String], // URLs
  isReported: { type: Boolean, default: false },
  reportReason: String,
  reportedBy: { type: ObjectId, ref: 'User' },
  reportedAt: Date,
  moderationStatus: { type: String, enum: ['pending', 'approved', 'removed'], default: 'approved' },
  moderatedBy: { type: ObjectId, ref: 'User' }, // Admin
  moderationNotes: String,
  moderatedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

---

### Module 2: Service Management

#### 2.1 Service Catalog & Discovery
**Feature ID**: F-004

**Requirements**:
- Browse services by category (Cleaning, Repair, Maintenance, etc.)
- Search with filters (price, rating, availability)
- Service details page (description, pricing, photos, reviews)
- Trending and recommended services
- Category-based navigation
- Service availability status
- Admin management of service catalog

**Frontend Components**:
```
screens/
  services/
    ServiceCatalogScreen.tsx      // Main catalog with categories
    ServiceSearchScreen.tsx       // Search with filters
    ServiceDetailScreen.tsx       // Detailed service page
    CategoryServicesScreen.tsx    // Services by category
    
    // Admin screens
    AdminServiceManagementScreen.tsx  // Admin service CRUD
    AdminServiceFormScreen.tsx        // Add/Edit service form
    AdminCategoryManagementScreen.tsx // Manage categories
    
components/
  services/
    ServiceCard.tsx               // Service preview card
    CategoryFilter.tsx            // Category selection
    PriceFilter.tsx              // Price range filter
    RatingFilter.tsx             // Rating filter
    ServiceGallery.tsx           // Image carousel
    SevakList.tsx                // Available Sevaks
    AdminServiceTable.tsx        // Admin service list table
```

**Backend APIs**:
```
GET /api/v1/services
  Query: { category, search, minPrice, maxPrice, minRating, sort, page, limit }
  Response: { services, totalCount, categories }

GET /api/v1/services/:serviceId
  Response: { service, availableSevaks, reviews }

GET /api/v1/services/categories
  Response: { categories }

GET /api/v1/services/trending
  Query: { limit }
  Response: { services }

// Admin endpoints
POST /api/v1/admin/services
  Headers: { Authorization: Bearer <admin-token> }
  Body: FormData { name, description, categoryId, basePrice, duration, inclusions, images }
  Response: { service }

PUT /api/v1/admin/services/:serviceId
  Headers: { Authorization: Bearer <admin-token> }
  Body: FormData { name, description, basePrice, duration, isActive, images }
  Response: { service }

DELETE /api/v1/admin/services/:serviceId
  Headers: { Authorization: Bearer <admin-token> }
  Response: { message }

POST /api/v1/admin/services/categories
  Headers: { Authorization: Bearer <admin-token> }
  Body: { name, description, icon, displayOrder }
  Response: { category }

PUT /api/v1/admin/services/categories/:categoryId
  Headers: { Authorization: Bearer <admin-token> }
  Body: { name, description, icon, isActive }
  Response: { category }
```

**Data Models**:
```javascript
// Service Schema
{
  _id: ObjectId,
  name: { type: String, required: true },
  description: String,
  category: { type: ObjectId, ref: 'Category', required: true },
  basePrice: { type: Number, required: true },
  priceUnit: { type: String, enum: ['fixed', 'per-hour', 'per-sqft'], default: 'fixed' },
  duration: Number, // in minutes
  images: [String], // URLs
  inclusions: [String],
  exclusions: [String],
  isActive: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  tags: [String],
  createdBy: { type: ObjectId, ref: 'User' }, // Admin who created
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

// Category Schema
{
  _id: ObjectId,
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String, // icon name or URL
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  serviceCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

---

#### 2.2 Booking System
**Feature ID**: F-005

**Requirements**:
- Select service and view pricing
- Choose date and time slot
- Select preferred Sevak or auto-assign
- Add booking notes/special instructions
- View booking summary before confirmation
- Booking confirmation with unique booking ID
- Booking history with status tracking
- Reschedule and cancellation with policies
- Admin can manually assign/reassign Sevaks to bookings

**Frontend Components**:
```
screens/
  booking/
    BookingFormScreen.tsx         // Multi-step booking form
    DateTimePickerScreen.tsx      // Date and time selection
    SevakSelectionScreen.tsx      // Choose Sevak
    BookingSummaryScreen.tsx      // Review before payment
    BookingConfirmationScreen.tsx // Success screen
    BookingHistoryScreen.tsx      // Past bookings
    BookingDetailScreen.tsx       // Booking details
    RescheduleBookingScreen.tsx   // Reschedule flow
    CancelBookingScreen.tsx       // Cancellation flow
    
    // Admin screens
    AdminBookingManagementScreen.tsx  // All bookings overview
    AdminBookingDetailScreen.tsx      // Detailed booking view
    AdminSevakAssignmentScreen.tsx    // Assign/reassign Sevaks
    
components/
  booking/
    DateCalendar.tsx              // Calendar component
    TimeSlotPicker.tsx            // Available time slots
    BookingStatusBadge.tsx        // Status indicator
    BookingCard.tsx               // Booking preview card
    CancellationPolicy.tsx        // Policy display
```

**Backend APIs**:
```
POST /api/v1/bookings
  Headers: { Authorization: Bearer <token> }
  Body: { serviceId, sevakId, scheduledDate, scheduledTime, notes, address }
  Response: { booking, paymentOrder }

GET /api/v1/bookings
  Headers: { Authorization: Bearer <token> }
  Query: { status, page, limit, sort }
  Response: { bookings, totalCount }

GET /api/v1/bookings/:bookingId
  Headers: { Authorization: Bearer <token> }
  Response: { booking, payment, service, sevak, resident }

PUT /api/v1/bookings/:bookingId/reschedule
  Headers: { Authorization: Bearer <token> }
  Body: { newDate, newTime, reason }
  Response: { booking }

POST /api/v1/bookings/:bookingId/cancel
  Headers: { Authorization: Bearer <token> }
  Body: { reason, cancelledBy }
  Response: { booking, refund }

// Admin endpoints
GET /api/v1/admin/bookings
  Headers: { Authorization: Bearer <admin-token> }
  Query: { status, dateFrom, dateTo, sevakId, residentId, page, limit }
  Response: { bookings, totalCount, statistics }

PUT /api/v1/admin/bookings/:bookingId/assign-sevak
  Headers: { Authorization: Bearer <admin-token> }
  Body: { sevakId, notes }
  Response: { booking }

PUT /api/v1/admin/bookings/:bookingId/status
  Headers: { Authorization: Bearer <admin-token> }
  Body: { status, notes }
  Response: { booking }
```

**Data Models**:
```javascript
// Booking Schema
{
  _id: ObjectId,
  bookingNumber: { type: String, unique: true, required: true }, // BOK-YYYYMMDD-XXXX
  resident: { type: ObjectId, ref: 'User', required: true },
  service: { type: ObjectId, ref: 'Service', required: true },
  sevak: { type: ObjectId, ref: 'User' },
  assignedBy: { type: ObjectId, ref: 'User' }, // Admin who assigned
  
  // Scheduling
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  estimatedDuration: Number, // minutes
  
  // Location
  address: {
    flatNumber: String,
    building: String,
    society: String,
    street: String,
    city: String,
    pincode: String,
    landmark: String,
    geoLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  
  // Booking details
  notes: String,
  specialInstructions: String,
  
  // Pricing
  basePrice: { type: Number, required: true },
  additionalCharges: [{
    description: String,
    amount: Number
  }],
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Timing
  checkInTime: Date,
  checkOutTime: Date,
  actualDuration: Number, // minutes
  
  // Completion
  completionPhotos: [String], // URLs
  completionNotes: String,
  
  // Cancellation
  isCancelled: { type: Boolean, default: false },
  cancellationReason: String,
  cancelledBy: { type: ObjectId, ref: 'User' },
  cancelledAt: Date,
  refundAmount: Number,
  refundStatus: { type: String, enum: ['pending', 'processed', 'rejected'] },
  
  // Rescheduling
  isRescheduled: { type: Boolean, default: false },
  rescheduleCount: { type: Number, default: 0 },
  previousSchedule: [{
    date: Date,
    time: String,
    rescheduledAt: Date,
    reason: String
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

---

#### 2.3 Job Management (Sevak Side)
**Feature ID**: F-006

**Requirements**:
- View assigned jobs in calendar view
- Job details with customer info and location
- Accept/reject job assignments
- Check-in at job start with GPS
- Upload progress photos during job
- Mark job as complete with photos
- Add completion notes
- View job history and earnings

**Frontend Components**:
```
screens/
  jobs/
    JobsDashboardScreen.tsx       // Sevak job overview
    JobsCalendarScreen.tsx        // Calendar view
    JobDetailScreen.tsx           // Job details
    JobCheckInScreen.tsx          // Check-in interface
    JobProgressScreen.tsx         // During job execution
    JobCompletionScreen.tsx       // Mark as complete
    JobHistoryScreen.tsx          // Past jobs
    EarningsScreen.tsx            // Earnings and payouts
    
components/
  jobs/
    JobCard.tsx                   // Job preview card
    CheckInButton.tsx             // GPS-enabled check-in
    PhotoUploader.tsx             // Progress photo upload
    JobStatusTimeline.tsx         // Status progression
    EarningsChart.tsx             // Earnings visualization
```

**Backend APIs**:
```
GET /api/v1/sevak/jobs
  Headers: { Authorization: Bearer <token> }
  Query: { status, dateFrom, dateTo, page, limit }
  Response: { jobs, totalCount, todayJobs }

GET /api/v1/sevak/jobs/:jobId
  Headers: { Authorization: Bearer <token> }
  Response: { job, customer, service, directions }

PUT /api/v1/sevak/jobs/:jobId/accept
  Headers: { Authorization: Bearer <token> }
  Response: { job }

PUT /api/v1/sevak/jobs/:jobId/reject
  Headers: { Authorization: Bearer <token> }
  Body: { reason }
  Response: { job }

POST /api/v1/sevak/jobs/:jobId/check-in
  Headers: { Authorization: Bearer <token> }
  Body: { location: { latitude, longitude }, checkInPhoto }
  Response: { job, checkInTime }

POST /api/v1/sevak/jobs/:jobId/check-out
  Headers: { Authorization: Bearer <token> }
  Body: { location: { latitude, longitude }, completionPhotos, notes }
  Response: { job, checkOutTime }

POST /api/v1/sevak/jobs/:jobId/progress-photos
  Headers: { Authorization: Bearer <token> }
  Body: FormData
  Response: { photoUrls }

GET /api/v1/sevak/earnings
  Headers: { Authorization: Bearer <token> }
  Query: { month, year }
  Response: { totalEarnings, jobsCompleted, pendingPayouts, earnings }
```

---

### Module 3: Payment Integration

#### 3.1 Razorpay Integration
**Feature ID**: F-007

**Requirements**:
- Razorpay payment gateway integration
- Support for credit/debit cards, UPI, wallets
- Secure payment processing
- Payment confirmation and receipt
- Payment history
- Refund processing
- Admin refund management

**Frontend Components**:
```
screens/
  payment/
    PaymentScreen.tsx             // Payment interface
    PaymentMethodsScreen.tsx      // Select payment method
    PaymentSuccessScreen.tsx      // Success confirmation
    PaymentFailedScreen.tsx       // Failed transaction
    PaymentHistoryScreen.tsx      // Transaction history
    RefundStatusScreen.tsx        // Refund tracking
    
    // Admin screens
    AdminPaymentDashboardScreen.tsx  // Payment overview
    AdminRefundManagementScreen.tsx  // Process refunds
    AdminTransactionListScreen.tsx   // All transactions
    
components/
  payment/
    RazorpayCheckout.tsx          // Razorpay checkout component
    PaymentCard.tsx               // Payment method card
    TransactionCard.tsx           // Transaction history item
    RefundRequestCard.tsx         // Refund request item
```

**Backend APIs**:
```
POST /api/v1/payments/create-order
  Headers: { Authorization: Bearer <token> }
  Body: { bookingId, amount }
  Response: { orderId, amount, currency, razorpayOrderId }

POST /api/v1/payments/verify
  Headers: { Authorization: Bearer <token> }
  Body: { orderId, paymentId, signature }
  Response: { payment, booking }

GET /api/v1/payments/history
  Headers: { Authorization: Bearer <token> }
  Query: { page, limit, status }
  Response: { payments, totalCount }

GET /api/v1/payments/:paymentId
  Headers: { Authorization: Bearer <token> }
  Response: { payment, booking, receipt }

POST /api/v1/payments/:paymentId/request-refund
  Headers: { Authorization: Bearer <token> }
  Body: { reason, amount }
  Response: { refundRequest }

// Admin endpoints
GET /api/v1/admin/payments
  Headers: { Authorization: Bearer <admin-token> }
  Query: { status, dateFrom, dateTo, page, limit }
  Response: { payments, statistics, totalRevenue }

GET /api/v1/admin/refunds/pending
  Headers: { Authorization: Bearer <admin-token> }
  Query: { page, limit }
  Response: { refundRequests, totalCount }

POST /api/v1/admin/refunds/:refundId/process
  Headers: { Authorization: Bearer <admin-token> }
  Body: { action: 'approve' | 'reject', notes, amount }
  Response: { refund }
```

**Data Models**:
```javascript
// Payment Schema
{
  _id: ObjectId,
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  
  // Razorpay details
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Payment details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: String, // card, upi, wallet
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Refund
  isRefunded: { type: Boolean, default: false },
  refundAmount: Number,
  refundId: String,
  refundReason: String,
  refundStatus: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'] },
  refundRequestedAt: Date,
  refundProcessedAt: Date,
  refundProcessedBy: { type: ObjectId, ref: 'User' }, // Admin
  
  // Metadata
  failureReason: String,
  receipt: String,
  notes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

// Refund Request Schema
{
  _id: ObjectId,
  paymentId: { type: ObjectId, ref: 'Payment', required: true },
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  requestedBy: { type: ObjectId, ref: 'User', required: true },
  requestedAmount: { type: Number, required: true },
  reason: String,
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  processedBy: { type: ObjectId, ref: 'User' }, // Admin
  processedAmount: Number,
  processingNotes: String,
  processedAt: Date,
  createdAt: { type: Date, default: Date.now }
}
```

---

### Module 4: Notifications System

#### 4.1 Push Notifications
**Feature ID**: F-008

**Requirements**:
- Booking confirmations
- Job assignments for Sevaks
- Check-in/out reminders
- Payment confirmations
- Rating reminders
- Promotional notifications
- Admin broadcasts to specific user groups

**Frontend Components**:
```
screens/
  notifications/
    NotificationsScreen.tsx       // List all notifications
    NotificationDetailScreen.tsx  // Detailed notification
    NotificationSettingsScreen.tsx // Manage preferences
    
    // Admin screens
    AdminNotificationCenterScreen.tsx // Send notifications
    AdminBroadcastScreen.tsx          // Broadcast messages
    AdminNotificationHistoryScreen.tsx // Sent notifications log
    
components/
  notifications/
    NotificationCard.tsx          // Single notification item
    NotificationBadge.tsx         // Unread count badge
    NotificationPreferences.tsx   // Settings form
    BroadcastComposer.tsx         // Compose broadcast message
```

**Backend APIs**:
```
GET /api/v1/notifications
  Headers: { Authorization: Bearer <token> }
  Query: { isRead, page, limit }
  Response: { notifications, unreadCount }

PUT /api/v1/notifications/:notificationId/read
  Headers: { Authorization: Bearer <token> }
  Response: { notification }

PUT /api/v1/notifications/read-all
  Headers: { Authorization: Bearer <token> }
  Response: { message }

PUT /api/v1/notifications/settings
  Headers: { Authorization: Bearer <token> }
  Body: { emailNotifications, pushNotifications, smsNotifications }
  Response: { settings }

// Admin endpoints
POST /api/v1/admin/notifications/broadcast
  Headers: { Authorization: Bearer <admin-token> }
  Body: { 
    title, 
    message, 
    targetAudience: 'all' | 'residents' | 'sevaks' | 'vendors',
    userIds, // specific users
    scheduledAt // optional
  }
  Response: { broadcast, recipientCount }

GET /api/v1/admin/notifications/history
  Headers: { Authorization: Bearer <admin-token> }
  Query: { type, dateFrom, dateTo, page, limit }
  Response: { notifications, statistics }
```

**Data Models**:
```javascript
// Notification Schema
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['booking', 'payment', 'job', 'rating', 'promotional', 'system', 'admin-broadcast'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: Object, // Additional contextual data
  
  // Delivery
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isPush: { type: Boolean, default: true },
  isEmail: { type: Boolean, default: false },
  isSMS: { type: Boolean, default: false },
  
  // For admin broadcasts
  isBroadcast: { type: Boolean, default: false },
  sentBy: { type: ObjectId, ref: 'User' }, // Admin
  
  createdAt: { type: Date, default: Date.now }
}

// Broadcast Schema
{
  _id: ObjectId,
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetAudience: { type: String, enum: ['all', 'residents', 'sevaks', 'vendors', 'custom'] },
  targetUserIds: [{ type: ObjectId, ref: 'User' }],
  sentBy: { type: ObjectId, ref: 'User', required: true }, // Admin
  recipientCount: Number,
  deliveredCount: Number,
  readCount: Number,
  scheduledAt: Date,
  sentAt: Date,
  status: { type: String, enum: ['draft', 'scheduled', 'sent', 'cancelled'], default: 'draft' },
  createdAt: { type: Date, default: Date.now }
}
```

---

### Module 5: Admin Dashboard & Platform Management

#### 5.1 Central Oversight & Unified Dashboard
**Feature ID**: F-009

**Requirements**:
- Unified view of all entities (communities, customers, bookings, Sevaks, vendors)
- Real-time statistics and KPIs
- Quick action buttons for common tasks
- Recent activities feed
- System health monitoring
- Role-based access control

**Frontend Components**:
```
screens/
  admin/
    dashboard/
      AdminDashboardScreen.tsx        // Main overview dashboard
      EntitiesOverviewScreen.tsx      // All entities summary
      QuickActionsScreen.tsx          // Common actions
      RecentActivitiesScreen.tsx      // Activity feed
      SystemHealthScreen.tsx          // System status
      
components/
  admin/
    dashboard/
      StatCard.tsx                    // KPI statistic card
      QuickActionButton.tsx           // Action button
      ActivityFeedItem.tsx            // Activity item
      EntitySummaryCard.tsx           // Entity summary
      HealthIndicator.tsx             // System health status
```

**Backend APIs**:
```
GET /api/v1/admin/dashboard/overview
  Headers: { Authorization: Bearer <admin-token> }
  Response: { 
    totalUsers, 
    totalBookings, 
    totalRevenue,
    activeServices,
    statistics: {
      residents: { total, active, newThisMonth },
      sevaks: { total, active, verified, blacklisted },
      vendors: { total, active },
      bookings: { 
        total, 
        pending, 
        completed, 
        cancelled, 
        todayBookings,
        thisMonthBookings 
      },
      revenue: { 
        today, 
        thisMonth, 
        lastMonth, 
        growth 
      }
    }
  }

GET /api/v1/admin/dashboard/activities
  Headers: { Authorization: Bearer <admin-token> }
  Query: { limit, type }
  Response: { activities }

GET /api/v1/admin/dashboard/system-health
  Headers: { Authorization: Bearer <admin-token> }
  Response: { 
    databaseStatus,
    serverLoad,
    activeConnections,
    pendingJobs,
    errorRate,
    uptime
  }
```

---

#### 5.2 Performance Tracking & KPI Dashboards
**Feature ID**: F-010

**Requirements**:
- Track core KPIs (revenue, service quality, Sevak performance)
- Operational metrics and trends
- Comparative analytics (period over period)
- Export reports
- Customizable dashboard widgets
- Real-time data visualization

**Frontend Components**:
```
screens/
  admin/
    analytics/
      PerformanceDashboardScreen.tsx  // Main analytics dashboard
      RevenueAnalyticsScreen.tsx      // Revenue metrics
      ServiceQualityScreen.tsx        // Quality metrics
      SevakPerformanceScreen.tsx      // Sevak analytics
      OperationalMetricsScreen.tsx    // Operational data
      CustomReportsScreen.tsx         // Custom report builder
      
components/
  admin/
    analytics/
      KPICard.tsx                     // KPI display card
      TrendChart.tsx                  // Trend line chart
      ComparisonChart.tsx             // Period comparison
      PerformanceTable.tsx            // Tabular data
      ReportExporter.tsx              // Export functionality
      DateRangeSelector.tsx           // Date range picker
```

**Backend APIs**:
```
GET /api/v1/admin/analytics/revenue
  Headers: { Authorization: Bearer <admin-token> }
  Query: { dateFrom, dateTo, groupBy: 'day' | 'week' | 'month' }
  Response: { 
    totalRevenue,
    revenueByPeriod,
    revenueByService,
    revenueGrowth,
    averageOrderValue
  }

GET /api/v1/admin/analytics/service-quality
  Headers: { Authorization: Bearer <admin-token> }
  Query: { dateFrom, dateTo }
  Response: { 
    averageRating,
    ratingDistribution,
    completionRate,
    cancellationRate,
    repeatCustomerRate,
    topRatedServices
  }

GET /api/v1/admin/analytics/sevak-performance
  Headers: { Authorization: Bearer <admin-token> }
  Query: { dateFrom, dateTo, sevakId, limit }
  Response: { 
    sevaks: [{
      sevakId,
      name,
      totalJobs,
      completedJobs,
      averageRating,
      totalEarnings,
      onTimePercentage,
      cancellationRate
    }],
    topPerformers,
    underperformers
  }

GET /api/v1/admin/analytics/operational-metrics
  Headers: { Authorization: Bearer <admin-token> }
  Query: { dateFrom, dateTo }
  Response: { 
    bookingFulfillmentRate,
    averageResponseTime,
    customerAcquisitionCost,
    customerLifetimeValue,
    sevakUtilizationRate,
    peakBookingHours
  }

POST /api/v1/admin/analytics/export
  Headers: { Authorization: Bearer <admin-token> }
  Body: { reportType, dateFrom, dateTo, format: 'csv' | 'pdf' | 'excel' }
  Response: { downloadUrl }
```

**Data Models**:
```javascript
// Analytics Event Schema (for tracking)
{
  _id: ObjectId,
  eventType: { 
    type: String, 
    enum: ['user_registration', 'booking_created', 'payment_completed', 'service_completed', 'rating_submitted'],
    required: true 
  },
  userId: { type: ObjectId, ref: 'User' },
  metadata: Object, // Flexible data based on event type
  timestamp: { type: Date, default: Date.now },
  sessionId: String
}
```

---

#### 5.3 Configuration & Operations Management
**Feature ID**: F-011

**Requirements**:
- Manage offers and promotions
- Process refund requests
- Manage system-wide notifications
- Configure platform settings
- Manage pricing and policies
- System maintenance mode

**Frontend Components**:
```
screens/
  admin/
    operations/
      OperationsControlScreen.tsx     // Main operations panel
      OffersManagementScreen.tsx      // Create/edit offers
      RefundManagementScreen.tsx      // Process refunds
      NotificationManagementScreen.tsx // System notifications
      SettingsScreen.tsx              // Platform settings
      PricingManagementScreen.tsx     // Service pricing
      PoliciesScreen.tsx              // Terms, cancellation policies
      MaintenanceModeScreen.tsx       // System maintenance
      
components/
  admin/
    operations/
      OfferCard.tsx                   // Offer display
      RefundRequestCard.tsx           // Refund item
      SettingItem.tsx                 // Configuration item
      PolicyEditor.tsx                // Rich text policy editor
      MaintenanceToggle.tsx           // Maintenance switch
```

**Backend APIs**:
```
// Offers & Promotions
GET /api/v1/admin/offers
  Headers: { Authorization: Bearer <admin-token> }
  Query: { status, page, limit }
  Response: { offers, totalCount }

POST /api/v1/admin/offers
  Headers: { Authorization: Bearer <admin-token> }
  Body: { 
    title, 
    description, 
    code, 
    discountType: 'percentage' | 'fixed',
    discountValue,
    minOrderValue,
    maxDiscount,
    validFrom,
    validTo,
    usageLimit,
    applicableServices
  }
  Response: { offer }

PUT /api/v1/admin/offers/:offerId
  Headers: { Authorization: Bearer <admin-token> }
  Body: { ...offer fields }
  Response: { offer }

DELETE /api/v1/admin/offers/:offerId
  Headers: { Authorization: Bearer <admin-token> }
  Response: { message }

// Platform Settings
GET /api/v1/admin/settings
  Headers: { Authorization: Bearer <admin-token> }
  Response: { settings }

PUT /api/v1/admin/settings
  Headers: { Authorization: Bearer <admin-token> }
  Body: { 
    platformName,
    supportEmail,
    supportPhone,
    commissionRate,
    cancellationWindowHours,
    refundProcessingDays,
    maintenanceMode,
    maintenanceMessage
  }
  Response: { settings }

// Pricing
PUT /api/v1/admin/pricing/service/:serviceId
  Headers: { Authorization: Bearer <admin-token> }
  Body: { basePrice, surcharges, discounts }
  Response: { service }
```

**Data Models**:
```javascript
// Offer Schema
{
  _id: ObjectId,
  title: { type: String, required: true },
  description: String,
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: Number,
  maxDiscount: Number,
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  usageLimit: Number,
  usageCount: { type: Number, default: 0 },
  applicableServices: [{ type: ObjectId, ref: 'Service' }],
  applicableUserTypes: [{ type: String, enum: ['resident', 'all'] }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

// Platform Settings Schema
{
  _id: ObjectId,
  platformName: String,
  supportEmail: String,
  supportPhone: String,
  commissionRate: Number, // percentage
  cancellationWindowHours: Number,
  refundProcessingDays: Number,
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: String,
  features: {
    enableRatings: { type: Boolean, default: true },
    enableReferrals: { type: Boolean, default: false },
    enableWallet: { type: Boolean, default: false }
  },
  updatedBy: { type: ObjectId, ref: 'User' },
  updatedAt: Date
}
```

---

#### 5.4 Reporting & Analytics
**Feature ID**: F-012

**Requirements**:
- Access comprehensive dashboards and reports
- Analytical reports for decision-making
- Export reports in multiple formats
- Scheduled reports
- Custom report builder
- Data visualization

**Frontend Components**:
```
screens/
  admin/
    reports/
      ReportsHomeScreen.tsx           // Reports overview
      RevenueReportScreen.tsx         // Revenue reports
      BookingReportScreen.tsx         // Booking analytics
      UserReportScreen.tsx            // User statistics
      ServiceReportScreen.tsx         // Service performance
      CustomReportBuilderScreen.tsx   // Build custom reports
      ScheduledReportsScreen.tsx      // Manage scheduled reports
      
components/
  admin/
    reports/
      ReportCard.tsx                  // Report preview
      ChartSelector.tsx               // Chart type selector
      FilterBuilder.tsx               // Report filters
      ReportPreview.tsx               // Report preview
      ScheduleReportForm.tsx          // Schedule configuration
```

**Backend APIs**:
```
GET /api/v1/admin/reports/revenue
  Headers: { Authorization: Bearer <admin-token> }
  Query: { dateFrom, dateTo, groupBy, format }
  Response: { report, summary }

GET /api/v1/admin/reports/bookings
  Headers: { Authorization: Bearer <admin-token> }
  Query: { dateFrom, dateTo, status, serviceId }
  Response: { report, summary }

GET /api/v1/admin/reports/users
  Headers: { Authorization: Bearer <admin-token> }
  Query: { role, dateFrom, dateTo }
  Response: { report, summary }

GET /api/v1/admin/reports/services
  Headers: { Authorization: Bearer <admin-token> }
  Query: { dateFrom, dateTo, categoryId }
  Response: { report, summary }

POST /api/v1/admin/reports/custom
  Headers: { Authorization: Bearer <admin-token> }
  Body: { 
    name,
    metrics: ['revenue', 'bookings', 'users'],
    filters,
    groupBy,
    dateRange
  }
  Response: { report }

POST /api/v1/admin/reports/schedule
  Headers: { Authorization: Bearer <admin-token> }
  Body: { 
    reportType,
    frequency: 'daily' | 'weekly' | 'monthly',
    recipients: [emails],
    format: 'pdf' | 'excel'
  }
  Response: { scheduledReport }
```

---

#### 5.5 Content Management
**Feature ID**: F-013

**Requirements**:
- Manage service content and media
- Upload, edit, remove service descriptions
- Manage pricing and service details
- Upload banners and promotional content
- Manage categories and tags
- Content approval workflow

**Frontend Components**:
```
screens/
  admin/
    content/
      ContentManagementScreen.tsx     // Main content hub
      ServiceContentScreen.tsx        // Manage service content
      MediaLibraryScreen.tsx          // Manage media assets
      BannersScreen.tsx               // Banner management
      CategoryManagementScreen.tsx    // Manage categories
      ContentApprovalScreen.tsx       // Approve pending content
      
components/
  admin/
    content/
      ServiceContentEditor.tsx        // Rich text editor
      MediaUploader.tsx               // Media upload
      BannerEditor.tsx                // Banner creator
      CategoryForm.tsx                // Category form
      ContentApprovalCard.tsx         // Approval item
```

**Backend APIs**:
```
// Service Content
PUT /api/v1/admin/content/service/:serviceId
  Headers: { Authorization: Bearer <admin-token> }
  Body: { 
    name,
    description,
    detailedDescription,
    inclusions,
    exclusions,
    termsAndConditions
  }
  Response: { service }

POST /api/v1/admin/content/media
  Headers: { Authorization: Bearer <admin-token> }
  Body: FormData { files, category, tags }
  Response: { mediaUrls, mediaIds }

DELETE /api/v1/admin/content/media/:mediaId
  Headers: { Authorization: Bearer <admin-token> }
  Response: { message }

// Banners
GET /api/v1/admin/content/banners
  Headers: { Authorization: Bearer <admin-token> }
  Response: { banners }

POST /api/v1/admin/content/banners
  Headers: { Authorization: Bearer <admin-token> }
  Body: FormData { image, title, link, displayOrder, isActive }
  Response: { banner }

PUT /api/v1/admin/content/banners/:bannerId
  Headers: { Authorization: Bearer <admin-token> }
  Body: { title, link, displayOrder, isActive }
  Response: { banner }

DELETE /api/v1/admin/content/banners/:bannerId
  Headers: { Authorization: Bearer <admin-token> }
  Response: { message }
```

**Data Models**:
```javascript
// Media Library Schema
{
  _id: ObjectId,
  fileName: String,
  originalName: String,
  url: String,
  mimeType: String,
  size: Number,
  category: { type: String, enum: ['service', 'banner', 'profile', 'job', 'other'] },
  tags: [String],
  uploadedBy: { type: ObjectId, ref: 'User' },
  usedIn: [{
    type: { type: String, enum: ['service', 'banner', 'offer'] },
    referenceId: ObjectId
  }],
  createdAt: { type: Date, default: Date.now }
}

// Banner Schema
{
  _id: ObjectId,
  title: String,
  image: String, // URL
  link: String,
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  clickCount: { type: Number, default: 0 },
  impressionCount: { type: Number, default: 0 },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

---

#### 5.6 User Management (Admin)
**Feature ID**: F-014

**Requirements**:
- Manage Sevak profiles
- View, verify, edit, deactivate Sevak profiles
- Manage personal details and documents
- Track performance records
- Verify documents and KYC
- Manage all user types (Residents, Vendors)

**Frontend Components**:
```
screens/
  admin/
    users/
      UserManagementScreen.tsx        // All users overview
      SevakManagementScreen.tsx       // Sevak list
      SevakDetailScreen.tsx           // Sevak profile details
      SevakVerificationScreen.tsx     // Document verification
      ResidentManagementScreen.tsx    // Resident list
      VendorManagementScreen.tsx      // Vendor list
      UserProfileEditScreen.tsx       // Edit user profile
      
components/
  admin/
    users/
      UserCard.tsx                    // User preview card
      UserTable.tsx                   // User list table
      DocumentVerification.tsx        // Document review
      PerformanceMetrics.tsx          // User performance
      UserActionMenu.tsx              // Quick actions
      BlacklistModal.tsx              // Blacklist confirmation
```

**Backend APIs**:
```
// Sevak Management
GET /api/v1/admin/sevaks
  Headers: { Authorization: Bearer <admin-token> }
  Query: { status, isVerified, isBlacklisted, search, page, limit }
  Response: { sevaks, totalCount, statistics }

GET /api/v1/admin/sevaks/:sevakId
  Headers: { Authorization: Bearer <admin-token> }
  Response: { sevak, profile, documents, bookings, ratings, earnings }

PUT /api/v1/admin/sevaks/:sevakId
  Headers: { Authorization: Bearer <admin-token> }
  Body: { profile data }
  Response: { sevak }

PUT /api/v1/admin/sevaks/:sevakId/verify
  Headers: { Authorization: Bearer <admin-token> }
  Body: { documentId, status: 'verified' | 'rejected', notes }
  Response: { document }

PUT /api/v1/admin/sevaks/:sevakId/toggle-active
  Headers: { Authorization: Bearer <admin-token> }
  Body: { isActive, reason }
  Response: { sevak }

// Resident & Vendor Management
GET /api/v1/admin/residents
  Headers: { Authorization: Bearer <admin-token> }
  Query: { search, page, limit }
  Response: { residents, totalCount }

GET /api/v1/admin/vendors
  Headers: { Authorization: Bearer <admin-token> }
  Query: { search, page, limit }
  Response: { vendors, totalCount }

GET /api/v1/admin/users/:userId
  Headers: { Authorization: Bearer <admin-token> }
  Response: { user, profile, activity }
```

---

#### 5.7 Operations Management - Sevak Assignment
**Feature ID**: F-015

**Requirements**:
- Assign specific Sevaks to Sevas/service requests
- Based on availability, skill set, and location
- Manual override of auto-assignment
- Reassign Sevaks if needed
- Track assignment history

**Frontend Components**:
```
screens/
  admin/
    operations/
      SevakAssignmentScreen.tsx       // Main assignment interface
      AvailableSevaksScreen.tsx       // View available Sevaks
      AssignmentHistoryScreen.tsx     // Assignment logs
      
components/
  admin/
    operations/
      SevakSelector.tsx               // Sevak selection dropdown
      AvailabilityCalendar.tsx        // Sevak availability
      AssignmentCard.tsx              // Assignment details
      SkillMatchIndicator.tsx         // Skill match score
```

**Backend APIs**:
```
GET /api/v1/admin/sevaks/available
  Headers: { Authorization: Bearer <admin-token> }
  Query: { date, time, serviceId, location }
  Response: { availableSevaks: [{ sevak, matchScore, distance }] }

PUT /api/v1/admin/bookings/:bookingId/assign-sevak
  Headers: { Authorization: Bearer <admin-token> }
  Body: { sevakId, notes, notifySevak }
  Response: { booking, notification }

PUT /api/v1/admin/bookings/:bookingId/reassign-sevak
  Headers: { Authorization: Bearer <admin-token> }
  Body: { newSevakId, reason, notifyOldSevak, notifyNewSevak }
  Response: { booking }

GET /api/v1/admin/assignments/history
  Headers: { Authorization: Bearer <admin-token> }
  Query: { sevakId, bookingId, dateFrom, dateTo, page, limit }
  Response: { assignments, totalCount }
```

**Data Models**:
```javascript
// Assignment History Schema
{
  _id: ObjectId,
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  sevakId: { type: ObjectId, ref: 'User', required: true },
  assignedBy: { type: ObjectId, ref: 'User', required: true }, // Admin
  assignmentType: { type: String, enum: ['auto', 'manual', 'reassignment'] },
  previousSevakId: { type: ObjectId, ref: 'User' }, // For reassignments
  reason: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
}
```

---

#### 5.8 Compliance & Control - Blacklist Management
**Feature ID**: F-016

**Requirements**:
- Blacklist Sevaks temporarily or permanently
- Based on complaints, poor performance, or policy violations
- Maintain blacklist reasons and history
- Reinstate blacklisted Sevaks
- Track blacklist impact on operations

**Frontend Components**:
```
screens/
  admin/
    compliance/
      BlacklistManagementScreen.tsx   // Blacklist overview
      BlacklistSevakScreen.tsx        // Blacklist form
      BlacklistedSevaksScreen.tsx     // List blacklisted
      ReinstateScreen.tsx             // Reinstate Sevak
      BlacklistHistoryScreen.tsx      // Historical log
      
components/
  admin/
    compliance/
      BlacklistForm.tsx               // Blacklist reason form
      BlacklistCard.tsx               // Blacklisted Sevak card
      ReinstateModal.tsx              // Reinstatement confirmation
      ViolationSummary.tsx            // Violation details
```

**Backend APIs**:
```
POST /api/v1/admin/sevaks/:sevakId/blacklist
  Headers: { Authorization: Bearer <admin-token> }
  Body: { 
    reason, 
    type: 'temporary' | 'permanent',
    duration, // days for temporary
    notes,
    relatedComplaints: [complaintIds]
  }
  Response: { sevak, blacklistRecord }

PUT /api/v1/admin/sevaks/:sevakId/reinstate
  Headers: { Authorization: Bearer <admin-token> }
  Body: { reason, notes }
  Response: { sevak }

GET /api/v1/admin/sevaks/blacklisted
  Headers: { Authorization: Bearer <admin-token> }
  Query: { type, page, limit }
  Response: { blacklistedSevaks, totalCount }

GET /api/v1/admin/blacklist/history/:sevakId
  Headers: { Authorization: Bearer <admin-token> }
  Response: { history }
```

**Data Models**:
```javascript
// Blacklist Record Schema
{
  _id: ObjectId,
  sevakId: { type: ObjectId, ref: 'User', required: true },
  blacklistedBy: { type: ObjectId, ref: 'User', required: true }, // Admin
  type: { type: String, enum: ['temporary', 'permanent'], required: true },
  reason: { type: String, required: true },
  detailedNotes: String,
  duration: Number, // days, for temporary blacklist
  startDate: { type: Date, default: Date.now },
  endDate: Date, // for temporary blacklist
  relatedComplaints: [{ type: ObjectId, ref: 'Complaint' }],
  
  // Reinstatement
  isActive: { type: Boolean, default: true },
  reinstatedBy: { type: ObjectId, ref: 'User' }, // Admin
  reinstatementReason: String,
  reinstatedAt: Date,
  
  createdAt: { type: Date, default: Date.now }
}

// Complaint Schema
{
  _id: ObjectId,
  bookingId: { type: ObjectId, ref: 'Booking' },
  complainantId: { type: ObjectId, ref: 'User', required: true },
  against: { type: ObjectId, ref: 'User', required: true }, // Sevak
  complaintType: { 
    type: String, 
    enum: ['poor-service', 'unprofessional', 'no-show', 'fraud', 'other'],
    required: true 
  },
  description: { type: String, required: true },
  evidence: [String], // URLs to images/documents
  status: { 
    type: String, 
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending' 
  },
  assignedTo: { type: ObjectId, ref: 'User' }, // Admin investigating
  resolutionNotes: String,
  actionTaken: String,
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
}
```

---

## Admin Dashboard Navigation Structure

```
Admin App Navigation:
├── Dashboard (Home)
│   ├── Overview Statistics
│   ├── Quick Actions
│   ├── Recent Activities
│   └── System Health
│
├── Users
│   ├── All Users
│   ├── Residents
│   ├── Sevaks
│   │   ├── Sevak List
│   │   ├── Verification Queue
│   │   ├── Performance Tracking
│   │   └── Blacklisted Sevaks
│   └── Vendors
│
├── Services
│   ├── Service Catalog
│   ├── Categories
│   ├── Pricing Management
│   └── Service Analytics
│
├── Bookings
│   ├── All Bookings
│   ├── Pending Assignments
│   ├── In Progress
│   ├── Completed
│   ├── Cancelled
│   └── Sevak Assignment
│
├── Payments
│   ├── Transactions
│   ├── Revenue Dashboard
│   ├── Refund Management
│   └── Payout Schedule
│
├── Content
│   ├── Service Content
│   ├── Media Library
│   ├── Banners
│   └── Promotions
│
├── Analytics
│   ├── Revenue Analytics
│   ├── Service Quality
│   ├── Sevak Performance
│   ├── Operational Metrics
│   └── Custom Reports
│
├── Operations
│   ├── Offers & Discounts
│   ├── Notifications
│   ├── Settings
│   ├── Policies
│   └── Maintenance Mode
│
├── Compliance
│   ├── Complaints
│   ├── Blacklist Management
│   ├── Document Verification
│   └── Audit Logs
│
└── Settings
    ├── Admin Accounts
    ├── Roles & Permissions
    ├── Platform Settings
    └── Integrations
```

---

## Security & Authorization

### Role-Based Access Control (RBAC)

```javascript
// Permission Structure
const permissions = {
  'super-admin': ['*'], // All permissions
  'operations-admin': [
    'bookings:*',
    'sevaks:assign',
    'users:view',
    'notifications:send'
  ],
  'content-admin': [
    'services:*',
    'content:*',
    'media:*'
  ],
  'finance-admin': [
    'payments:view',
    'refunds:process',
    'reports:revenue'
  ],
  'support-admin': [
    'users:view',
    'bookings:view',
    'complaints:*'
  ]
};
```

### Middleware for Admin Routes
```javascript
// Admin authentication middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Permission check middleware
const hasPermission = (permission) => {
  return (req, res, next) => {
    const admin = req.user;
    const adminPermissions = admin.permissions;
    
    // Super admin has all permissions
    if (admin.isSuperAdmin) return next();
    
    // Check if admin has required permission
    const hasAccess = adminPermissions.some(p => {
      const [module, action] = p.split(':');
      const [reqModule, reqAction] = permission.split(':');
      return (module === reqModule || module === '*') && 
             (action === reqAction || action === '*');
    });
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage in routes
router.get('/admin/bookings', 
  isAdmin, 
  hasPermission('bookings:view'), 
  getBookings
);

router.put('/admin/bookings/:id/assign', 
  isAdmin, 
  hasPermission('bookings:assign'), 
  assignSevak
);
```

---

## Testing Requirements

### Admin Module Testing

```javascript
// Admin Authentication Tests
describe('Admin Authentication', () => {
  test('Admin login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/admin-login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
        adminCode: 'ADM001'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.role).toBe('admin');
  });
  
  test('Regular user cannot access admin endpoints', async () => {
    const userToken = await getResidentToken();
    
    const response = await request(app)
      .get('/api/v1/admin/dashboard/overview')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(response.status).toBe(403);
  });
});

// Sevak Blacklist Tests
describe('Sevak Blacklist Management', () => {
  test('Admin can blacklist Sevak', async () => {
    const adminToken = await getAdminToken();
    
    const response = await request(app)
      .post('/api/v1/admin/sevaks/123/blacklist')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Multiple customer complaints',
        type: 'temporary',
        duration: 30
      });
    
    expect(response.status).toBe(200);
    expect(response.body.sevak.isBlacklisted).toBe(true);
  });
  
  test('Blacklisted Sevak cannot be assigned to bookings', async () => {
    // Test auto-assignment logic
    // Verify blacklisted Sevak is excluded
  });
});

// Assignment Tests
describe('Sevak Assignment', () => {
  test('Admin can manually assign Sevak to booking', async () => {
    const adminToken = await getAdminToken();
    
    const response = await request(app)
      .put('/api/v1/admin/bookings/456/assign-sevak')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sevakId: '789',
        notes: 'Best match for this job'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.booking.sevak).toBe('789');
  });
});
```

---

## Environment Variables (Updated)

### Frontend (.env)
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:5000
EXPO_PUBLIC_ADMIN_URL=http://localhost:5000/admin/api/v1

# Razorpay (Test Keys)
EXPO_PUBLIC_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxx

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX

# App Configuration
EXPO_PUBLIC_APP_NAME=Society Booking
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ADMIN_APP_NAME=Society Booking Admin
```

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000
ADMIN_PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/society-booking
MONGODB_URI_TEST=mongodb://localhost:27017/society-booking-test

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_ADMIN_SECRET=your-super-secret-admin-key-change-in-production

# Admin
SUPER_ADMIN_EMAIL=superadmin@societybooking.com
SUPER_ADMIN_PASSWORD=change-in-production
SUPER_ADMIN_CODE=SA001

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# SMS (Twilio - Optional for POC)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email (SendGrid - Optional for POC)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@societybooking.com

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf

# Redis (Optional for POC)
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19001,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_RATE_LIMIT_MAX_REQUESTS=500
```

---

## Deliverables (Updated)

### Phase 1 POC Completion
1. **Functional Application**:
   - Working mobile app for Residents and Sevaks (Android/iOS via Expo)
   - Admin dashboard web/mobile interface
   - Complete backend API with admin endpoints
   - MongoDB database with test data

2. **Code Repository**:
   - Clean, well-organized code
   - Separate folders for mobile app and admin dashboard
   - Git repository with proper commits
   - README files for all projects

3. **Documentation**:
   - API documentation (Swagger/Postman) including admin endpoints
   - Setup and installation guide
   - Architecture diagrams
   - Database schema documentation
   - Admin user guide

4. **Testing**:
   - Postman collection for all APIs (including admin)
   - Basic unit tests for critical functions
   - Test accounts for all user types (including admin)

5. **Deployment Ready**:
   - Environment configurations
   - Build scripts
   - Deployment documentation
   - Admin access setup guide

---

## Success Criteria (Updated)

✅ User can register and login successfully (all roles)  
✅ Admin can login to admin dashboard  
✅ Resident can browse and book services  
✅ Payment integration works (test mode)  
✅ Sevak can view assigned jobs  
✅ Admin can assign/reassign Sevaks to bookings  
✅ Admin can blacklist/reinstate Sevaks  
✅ Check-in/out functionality works  
✅ Photo upload for job completion works  
✅ Rating and feedback system functional  
✅ Admin can manage services and content  
✅ Admin analytics and reporting work  
✅ Admin can process refunds  
✅ Admin can manage offers and notifications  
✅ Notifications are sent correctly  
✅ All API endpoints working as documented (including admin)  
✅ Mobile app is responsive and performant  
✅ Admin dashboard is functional and intuitive  
✅ Error handling is robust  
✅ Code is production-ready quality  
✅ Role-based access control works correctly  

---

## Additional Notes

### Admin Dashboard Development Options

1. **Option 1: React Native (Expo) for Admin Mobile App**
   - Unified codebase with main app
   - Separate entry point for admin
   - Suitable for on-the-go admin management

2. **Option 2: React Web App for Admin Dashboard**
   - Better suited for complex dashboards
   - More screen real estate for analytics
   - Can use libraries like Material-UI, Ant Design, or Recharts
   - Recommended for POC

3. **Option 3: Hybrid (Both)**
   - Web dashboard for comprehensive management
   - Mobile app for essential on-the-go tasks

**Recommendation for POC**: Start with React Native (Option 1) to maintain unified codebase, with plans to expand to web dashboard (Option 2) in future phases.

### Mock Data for Testing
Create seed scripts to populate:
- 3 regular user roles (Resident, Sevak, Vendor)
- 2 admin accounts (super admin, regular admin)
- 10+ services across different categories
- Sample bookings in various states
- Sample ratings and reviews
- Sample blacklisted Sevaks
- Sample complaints
- Sample analytics data

### Admin Test Accounts
```javascript
// Super Admin
Email: superadmin@societybooking.com
Password: Admin@123
Code: SA001

// Operations Admin
Email: operations@societybooking.com
Password: Operations@123
Code: OA001

// Content Admin
Email: content@societybooking.com
Password: Content@123
Code: CA001
```

### Razorpay Test Cards
- Success: 4111 1111 1111 1111
- Failure: 4111 1111 1111 1112
- Any CVV and future expiry date

### OTP for Testing
In development mode, use fixed OTP: `123456` or bypass OTP verification

### Performance Targets
- App launch time: < 3 seconds
- Admin dashboard load: < 2 seconds
- API response time: < 200ms (average)
- Admin API response: < 300ms (with aggregations)
- Image upload time: < 5 seconds
- Screen navigation: Smooth 60fps
- Report generation: < 5 seconds

---

## Build This POC With

**Priority**: Production-ready code quality, scalability, and maintainability  
**Focus**: Complete Phase 1 features including comprehensive admin functionality  
**Timeline**: Build as a comprehensive POC demonstrating all features  
**Output**: Fully functional mobile app + admin dashboard + backend API ready for further development

---

**Start building this application following all specifications, best practices, and implementation guidelines provided above. Create a scalable, production-ready POC that demonstrates all Phase 1 features including the complete admin management system.**
