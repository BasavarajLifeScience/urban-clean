# Society Service Booking Application - POC Build Prompt

## Project Overview

Build a **Proof of Concept (POC)** for a Society Service Booking Application - a multi-role mobile platform connecting Residents with verified service providers (Sevaks) for cleaning, maintenance, and other services. This POC focuses on **Phase 1 features** with production-ready code quality, scalability, and best practices.

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
- Support three user roles: Resident, Sevak, Vendor
- Phone number and email-based registration
- OTP verification via SMS (mock for POC, integrate Twilio/AWS SNS later)
- Password-based login with remember me option
- Social login preparation (Google/Apple) - UI ready, backend hooks
- Account verification status tracking

**Frontend Components**:
```
screens/
  auth/
    WelcomeScreen.tsx          // Landing page with role selection
    LoginScreen.tsx            // Phone/Email + Password login
    RegisterScreen.tsx         // Registration form with role selection
    OTPVerificationScreen.tsx  // OTP input with resend functionality
    ForgotPasswordScreen.tsx   // Password reset flow
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
  role: { type: String, enum: ['resident', 'sevak', 'vendor'], required: true },
  fullName: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
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
    type: { type: String, enum: ['aadhaar', 'pan', 'certificate', 'other'] },
    url: String,
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    uploadedAt: Date
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

**Frontend Components**:
```
screens/
  ratings/
    RatingScreen.tsx              // Post-service rating interface
    ReviewsListScreen.tsx         // View all reviews
    
components/
  ratings/
    StarRating.tsx                // Interactive star rating
    RatingModal.tsx               // Quick rating popup
    ReviewCard.tsx                // Display single review
    RatingsSummary.tsx            // Average rating display
    ReviewForm.tsx                // Text feedback input
```

**Backend APIs**:
```
POST /api/v1/ratings
  Headers: { Authorization: Bearer <token> }
  Body: { bookingId, ratedTo, rating, comment }
  Response: { rating }

GET /api/v1/ratings/sevak/:sevakId
  Query: { page, limit, sort }
  Response: { ratings[], averageRating, totalRatings }

GET /api/v1/ratings/booking/:bookingId
  Headers: { Authorization: Bearer <token> }
  Response: { rating }

PUT /api/v1/ratings/:ratingId
  Headers: { Authorization: Bearer <token> }
  Body: { rating, comment }
  Response: { rating }

POST /api/v1/ratings/:ratingId/report
  Headers: { Authorization: Bearer <token> }
  Body: { reason }
  Response: { message }
```

**Data Models**:
```javascript
// Rating Schema
{
  _id: ObjectId,
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  ratedTo: { type: ObjectId, ref: 'User', required: true }, // Sevak/Vendor
  ratedBy: { type: ObjectId, ref: 'User', required: true }, // Resident
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 },
  isReported: { type: Boolean, default: false },
  reportReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

---

### Module 2: Resident App

#### 2.1 Service Discovery
**Feature ID**: F-004

**Requirements**:
- Browse services by categories (Cleaning, Maintenance, Plumbing, etc.)
- Search services by keywords
- Filter by price range, rating, availability
- Service cards with image, name, price, rating
- Service detail page with description, reviews, FAQs
- Add to favorites/wishlist

**Frontend Components**:
```
screens/
  resident/
    HomeScreen.tsx                // Dashboard with categories
    ServiceCategoriesScreen.tsx   // All categories grid
    ServiceListScreen.tsx         // Filtered service list
    ServiceDetailScreen.tsx       // Detailed service page
    SearchScreen.tsx              // Search with suggestions
    FavoritesScreen.tsx           // Saved services

components/
  services/
    ServiceCard.tsx               // Service preview card
    CategoryCard.tsx              // Category tile
    SearchBar.tsx                 // Search input with filters
    FilterModal.tsx               // Advanced filters
    ServiceCarousel.tsx           // Featured services slider
```

**Backend APIs**:
```
GET /api/v1/services
  Query: { category, search, minPrice, maxPrice, rating, page, limit }
  Response: { services[], totalPages, currentPage }

GET /api/v1/services/:serviceId
  Response: { service, averageRating, reviewCount }

GET /api/v1/services/categories
  Response: { categories[] }

POST /api/v1/services/favorites
  Headers: { Authorization: Bearer <token> }
  Body: { serviceId }
  Response: { message }

GET /api/v1/services/favorites
  Headers: { Authorization: Bearer <token> }
  Response: { favorites[] }

DELETE /api/v1/services/favorites/:serviceId
  Headers: { Authorization: Bearer <token> }
  Response: { message }
```

**Data Models**:
```javascript
// Service Schema
{
  _id: ObjectId,
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  imageUrl: String,
  images: [String],
  basePrice: { type: Number, required: true },
  priceUnit: { type: String, default: 'per service' }, // 'per hour', 'per sqft', etc.
  duration: Number, // in minutes
  isActive: { type: Boolean, default: true },
  tags: [String],
  features: [String],
  faqs: [{
    question: String,
    answer: String
  }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  bookingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

// Category Schema
{
  _id: ObjectId,
  name: { type: String, required: true, unique: true },
  icon: String,
  imageUrl: String,
  description: String,
  isActive: { type: Boolean, default: true },
  displayOrder: Number,
  createdAt: { type: Date, default: Date.now }
}

// Favorite Schema
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  serviceId: { type: ObjectId, ref: 'Service', required: true },
  createdAt: { type: Date, default: Date.now }
}
```

---

#### 2.2 Booking & Scheduling
**Feature ID**: F-005, F-006, F-007

**Requirements**:
- Select service date and time slot
- Add special instructions/requirements
- View booking summary before confirmation
- Track booking status (Pending → Assigned → In Progress → Completed)
- Real-time status updates
- View booking history
- Reschedule with available slots
- Cancel with refund policy enforcement
- Push notifications for status changes

**Frontend Components**:
```
screens/
  resident/
    BookingScreen.tsx             // Date/time selection & booking flow
    BookingSummaryScreen.tsx      // Review before confirmation
    MyBookingsScreen.tsx          // List of all bookings
    BookingDetailScreen.tsx       // Detailed booking view
    RescheduleScreen.tsx          // Change date/time
    
components/
  booking/
    DateTimePicker.tsx            // Calendar + time slot selector
    TimeSlotGrid.tsx              // Available time slots
    BookingCard.tsx               // Booking summary card
    StatusBadge.tsx               // Visual status indicator
    BookingTimeline.tsx           // Progress tracker
    CancellationModal.tsx         // Cancel with reason
```

**Backend APIs**:
```
POST /api/v1/bookings
  Headers: { Authorization: Bearer <token> }
  Body: { serviceId, scheduledDate, scheduledTime, address, specialInstructions }
  Response: { booking }

GET /api/v1/bookings/my-bookings
  Headers: { Authorization: Bearer <token> }
  Query: { status, page, limit }
  Response: { bookings[], totalPages }

GET /api/v1/bookings/:bookingId
  Headers: { Authorization: Bearer <token> }
  Response: { booking, service, sevak, timeline }

PATCH /api/v1/bookings/:bookingId/reschedule
  Headers: { Authorization: Bearer <token> }
  Body: { newDate, newTime }
  Response: { booking }

PATCH /api/v1/bookings/:bookingId/cancel
  Headers: { Authorization: Bearer <token> }
  Body: { reason }
  Response: { booking, refundAmount }

GET /api/v1/bookings/available-slots
  Query: { serviceId, date }
  Response: { availableSlots[] }
```

**Data Models**:
```javascript
// Booking Schema
{
  _id: ObjectId,
  bookingNumber: { type: String, unique: true }, // Auto-generated: BK-20240115-001
  
  residentId: { type: ObjectId, ref: 'User', required: true },
  serviceId: { type: ObjectId, ref: 'Service', required: true },
  sevakId: { type: ObjectId, ref: 'User' }, // Assigned later
  
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true }, // "09:00 AM"
  estimatedDuration: Number, // minutes
  
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending' 
  },
  
  address: {
    flatNumber: { type: String, required: true },
    building: String,
    society: String,
    street: String,
    city: String,
    pincode: String,
    landmark: String
  },
  
  specialInstructions: String,
  
  // Pricing
  basePrice: { type: Number, required: true },
  additionalCharges: Number,
  discount: Number,
  totalAmount: { type: Number, required: true },
  
  // Payment
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending' 
  },
  paymentId: String,
  paymentMethod: String,
  paidAt: Date,
  
  // Service Execution
  checkInTime: Date,
  checkOutTime: Date,
  checkInOTP: String,
  beforeImages: [String],
  afterImages: [String],
  completionNotes: String,
  reportedIssues: [String],
  
  // Cancellation
  cancelledBy: { type: ObjectId, ref: 'User' },
  cancellationReason: String,
  cancelledAt: Date,
  refundAmount: Number,
  refundStatus: String,
  
  // Timeline
  timeline: [{
    status: String,
    timestamp: Date,
    notes: String
  }],
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

---

#### 2.3 Payment Integration
**Feature ID**: F-008

**Requirements**:
- Integrate Razorpay for payment processing
- Support UPI, Cards, Net Banking, Wallets
- EMI options for high-value services
- Secure payment gateway
- Payment success/failure handling
- Generate invoices automatically
- Payment history and receipts
- Refund processing for cancellations

**Frontend Components**:
```
screens/
  resident/
    PaymentScreen.tsx             // Payment gateway integration
    PaymentSuccessScreen.tsx      // Success confirmation
    PaymentFailedScreen.tsx       // Failure handling
    InvoiceScreen.tsx             // Invoice view/download
    PaymentHistoryScreen.tsx      // All transactions
    
components/
  payment/
    PaymentMethodSelector.tsx     // Choose payment method
    PaymentSummary.tsx            // Amount breakdown
    InvoiceCard.tsx               // Invoice preview
```

**Backend APIs**:
```
POST /api/v1/payments/create-order
  Headers: { Authorization: Bearer <token> }
  Body: { bookingId, amount }
  Response: { orderId, razorpayOrderId, amount }

POST /api/v1/payments/verify
  Headers: { Authorization: Bearer <token> }
  Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
  Response: { payment, booking }

GET /api/v1/payments/invoice/:bookingId
  Headers: { Authorization: Bearer <token> }
  Response: { invoice }

GET /api/v1/payments/history
  Headers: { Authorization: Bearer <token> }
  Query: { page, limit }
  Response: { payments[] }

POST /api/v1/payments/refund
  Headers: { Authorization: Bearer <token> }
  Body: { bookingId, amount, reason }
  Response: { refund }
```

**Data Models**:
```javascript
// Payment Schema
{
  _id: ObjectId,
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  paymentMethod: String,
  status: { 
    type: String, 
    enum: ['created', 'pending', 'success', 'failed', 'refunded'],
    default: 'created' 
  },
  
  failureReason: String,
  
  // Refund
  refundId: String,
  refundAmount: Number,
  refundStatus: String,
  refundedAt: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

// Invoice Schema
{
  _id: ObjectId,
  invoiceNumber: { type: String, unique: true }, // INV-20240115-001
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  paymentId: { type: ObjectId, ref: 'Payment', required: true },
  
  userId: { type: ObjectId, ref: 'User', required: true },
  
  items: [{
    description: String,
    quantity: Number,
    rate: Number,
    amount: Number
  }],
  
  subtotal: Number,
  tax: Number,
  discount: Number,
  total: Number,
  
  issuedAt: { type: Date, default: Date.now },
  dueDate: Date,
  paidAt: Date,
  
  createdAt: { type: Date, default: Date.now }
}
```

---

#### 2.4 Communication & Notifications
**Feature ID**: F-009

**Requirements**:
- Push notifications for booking updates
- Email notifications for invoices and confirmations
- SMS alerts for important updates
- In-app notification center
- Notification preferences/settings
- Promotional offers and announcements

**Frontend Components**:
```
screens/
  notifications/
    NotificationsScreen.tsx       // Notification center
    NotificationSettingsScreen.tsx // Preferences
    
components/
  notifications/
    NotificationCard.tsx          // Single notification
    NotificationBadge.tsx         // Unread count
```

**Backend APIs**:
```
GET /api/v1/notifications
  Headers: { Authorization: Bearer <token> }
  Query: { page, limit, isRead }
  Response: { notifications[], unreadCount }

PATCH /api/v1/notifications/:notificationId/read
  Headers: { Authorization: Bearer <token> }
  Response: { notification }

PATCH /api/v1/notifications/read-all
  Headers: { Authorization: Bearer <token> }
  Response: { message }

PUT /api/v1/notifications/settings
  Headers: { Authorization: Bearer <token> }
  Body: { pushEnabled, emailEnabled, smsEnabled, types }
  Response: { settings }
```

**Data Models**:
```javascript
// Notification Schema
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  
  type: { 
    type: String, 
    enum: ['booking', 'payment', 'rating', 'offer', 'system'],
    required: true 
  },
  
  title: { type: String, required: true },
  body: { type: String, required: true },
  
  data: Object, // Additional metadata
  
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // For push notifications
  pushSent: { type: Boolean, default: false },
  pushSentAt: Date,
  
  createdAt: { type: Date, default: Date.now }
}

// NotificationSettings Schema
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  
  pushEnabled: { type: Boolean, default: true },
  emailEnabled: { type: Boolean, default: true },
  smsEnabled: { type: Boolean, default: true },
  
  enabledTypes: {
    booking: { type: Boolean, default: true },
    payment: { type: Boolean, default: true },
    rating: { type: Boolean, default: true },
    offer: { type: Boolean, default: true },
    system: { type: Boolean, default: true }
  },
  
  updatedAt: Date
}
```

---

### Module 3: Sevak App

#### 3.1 Job Management
**Feature ID**: F-010, F-011, F-012

**Requirements**:
- View daily assigned jobs with details
- Job list with filters (date, status, location)
- Job detail view with resident info and service requirements
- OTP-based check-in at resident's location
- Check-out with completion confirmation
- Attendance tracking and history
- Navigation to job location (Google Maps integration)

**Frontend Components**:
```
screens/
  sevak/
    SevakDashboardScreen.tsx      // Daily overview
    JobListScreen.tsx             // All jobs list
    JobDetailScreen.tsx           // Single job details
    CheckInScreen.tsx             // OTP verification
    AttendanceHistoryScreen.tsx   // Past attendance
    
components/
  sevak/
    JobCard.tsx                   // Job summary card
    JobStatusBadge.tsx            // Status indicator
    OTPInput.tsx                  // OTP entry field
    CheckInOutButton.tsx          // Action button
    JobTimeline.tsx               // Job progress
    NavigationButton.tsx          // Navigate to location
```

**Backend APIs**:
```
GET /api/v1/sevak/jobs
  Headers: { Authorization: Bearer <token> }
  Query: { date, status, page, limit }
  Response: { jobs[], todayCount, upcomingCount }

GET /api/v1/sevak/jobs/:jobId
  Headers: { Authorization: Bearer <token> }
  Response: { job, resident, service, checkInOTP }

POST /api/v1/sevak/check-in
  Headers: { Authorization: Bearer <token> }
  Body: { bookingId, otp, location }
  Response: { booking, checkedInAt }

POST /api/v1/sevak/check-out
  Headers: { Authorization: Bearer <token> }
  Body: { bookingId, location }
  Response: { booking, checkedOutAt, duration }

GET /api/v1/sevak/attendance
  Headers: { Authorization: Bearer <token> }
  Query: { startDate, endDate }
  Response: { attendance[], totalDays, presentDays }
```

---

#### 3.2 Service Reporting
**Feature ID**: F-013, F-014

**Requirements**:
- Upload before and after photos of work
- Add completion notes and observations
- Report issues encountered during service
- Select issue type (damage, missing materials, etc.)
- Add photos for reported issues
- Mark tasks as complete
- Quality assurance checklist

**Frontend Components**:
```
screens/
  sevak/
    TaskCompletionScreen.tsx      // Mark job complete
    PhotoUploadScreen.tsx         // Before/After photos
    ReportIssueScreen.tsx         // Issue reporting
    CompletionChecklistScreen.tsx // QA checklist
    
components/
  sevak/
    PhotoCapture.tsx              // Camera interface
    IssueTypeSelector.tsx         // Issue categories
    NotesInput.tsx                // Text area for notes
    ChecklistItem.tsx             // Checklist checkbox
```

**Backend APIs**:
```
PATCH /api/v1/sevak/jobs/:bookingId/complete
  Headers: { Authorization: Bearer <token> }
  Body: FormData { completionNotes, checklistItems }
  Files: beforeImages[], afterImages[]
  Response: { booking }

POST /api/v1/sevak/jobs/:bookingId/report-issue
  Headers: { Authorization: Bearer <token> }
  Body: FormData { issueType, description }
  Files: issueImages[]
  Response: { issue }

GET /api/v1/sevak/jobs/:bookingId/checklist
  Headers: { Authorization: Bearer <token> }
  Response: { checklist[] }
```

**Data Models**:
```javascript
// Issue Schema
{
  _id: ObjectId,
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  sevakId: { type: ObjectId, ref: 'User', required: true },
  
  issueType: { 
    type: String, 
    enum: ['damage', 'missing-materials', 'access-denied', 'safety-concern', 'other'],
    required: true 
  },
  
  description: { type: String, required: true },
  images: [String],
  
  status: { 
    type: String, 
    enum: ['reported', 'acknowledged', 'resolved'],
    default: 'reported' 
  },
  
  resolution: String,
  resolvedAt: Date,
  
  createdAt: { type: Date, default: Date.now }
}

// Checklist Schema
{
  _id: ObjectId,
  serviceId: { type: ObjectId, ref: 'Service', required: true },
  items: [{
    label: String,
    isRequired: Boolean,
    order: Number
  }],
  createdAt: { type: Date, default: Date.now }
}
```

---

#### 3.3 Earnings & Performance
**Feature ID**: F-015

**Requirements**:
- View daily, weekly, monthly earnings
- Earnings breakdown by job
- Payment history with status
- Average rating display
- Recent feedback/reviews
- Performance metrics (completion rate, on-time percentage)
- Earnings analytics with charts

**Frontend Components**:
```
screens/
  sevak/
    EarningsScreen.tsx            // Earnings dashboard
    EarningsDetailsScreen.tsx     // Detailed breakdown
    PerformanceScreen.tsx         // Ratings and metrics
    FeedbackListScreen.tsx        // All reviews
    
components/
  sevak/
    EarningsCard.tsx              // Earnings summary
    EarningsChart.tsx             // Visual analytics
    PerformanceMetrics.tsx        // KPI cards
    FeedbackCard.tsx              // Single review
    RatingBreakdown.tsx           // Star distribution
```

**Backend APIs**:
```
GET /api/v1/sevak/earnings
  Headers: { Authorization: Bearer <token> }
  Query: { period, startDate, endDate }
  Response: { totalEarnings, breakdown[], chart }

GET /api/v1/sevak/earnings/details
  Headers: { Authorization: Bearer <token> }
  Query: { page, limit }
  Response: { earnings[], totalAmount }

GET /api/v1/sevak/performance
  Headers: { Authorization: Bearer <token> }
  Response: { 
    averageRating, 
    totalRatings, 
    completionRate,
    onTimePercentage,
    totalJobs 
  }

GET /api/v1/sevak/feedback
  Headers: { Authorization: Bearer <token> }
  Query: { page, limit }
  Response: { feedback[], averageRating }
```

**Data Models**:
```javascript
// Earnings Schema
{
  _id: ObjectId,
  sevakId: { type: ObjectId, ref: 'User', required: true },
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  
  amount: { type: Number, required: true },
  commission: Number,
  netAmount: Number,
  
  status: { 
    type: String, 
    enum: ['pending', 'processed', 'paid'],
    default: 'pending' 
  },
  
  paidAt: Date,
  paymentMethod: String,
  transactionId: String,
  
  createdAt: { type: Date, default: Date.now }
}
```

---

## Architecture & Project Structure

### Frontend Structure
```
society-booking-app/
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Avatar.tsx
│   │   ├── auth/               # Auth-specific components
│   │   ├── booking/            # Booking components
│   │   ├── services/           # Service components
│   │   ├── ratings/            # Rating components
│   │   ├── sevak/              # Sevak-specific components
│   │   └── payment/            # Payment components
│   ├── screens/
│   │   ├── auth/               # Authentication screens
│   │   ├── resident/           # Resident app screens
│   │   ├── sevak/              # Sevak app screens
│   │   ├── profile/            # Profile screens
│   │   └── notifications/      # Notification screens
│   ├── navigation/
│   │   ├── AppNavigator.tsx    # Root navigator
│   │   ├── AuthNavigator.tsx   # Auth stack
│   │   ├── ResidentNavigator.tsx # Resident tabs
│   │   ├── SevakNavigator.tsx  # Sevak tabs
│   │   └── types.ts            # Navigation types
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Auth state
│   │   ├── BookingContext.tsx  # Booking state
│   │   └── NotificationContext.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── axios.config.ts # Axios setup
│   │   │   ├── auth.api.ts
│   │   │   ├── booking.api.ts
│   │   │   ├── service.api.ts
│   │   │   └── payment.api.ts
│   │   └── storage/
│   │       └── storage.service.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBooking.ts
│   │   └── useNotifications.ts
│   ├── utils/
│   │   ├── validators.ts       # Validation functions
│   │   ├── formatters.ts       # Data formatters
│   │   ├── constants.ts        # App constants
│   │   └── helpers.ts          # Utility functions
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── booking.types.ts
│   │   └── service.types.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── theme.ts
│   └── App.tsx
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── .env
```

### Backend Structure
```
society-booking-api/
├── src/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   ├── jwt.js              # JWT config
│   │   ├── razorpay.js         # Payment config
│   │   └── env.js              # Environment variables
│   ├── models/
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Rating.js
│   │   ├── Notification.js
│   │   ├── OTP.js
│   │   └── Issue.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── service.controller.js
│   │   ├── booking.controller.js
│   │   ├── payment.controller.js
│   │   ├── rating.controller.js
│   │   ├── sevak.controller.js
│   │   └── notification.controller.js
│   ├── routes/
│   │   ├── index.js            # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── service.routes.js
│   │   ├── booking.routes.js
│   │   ├── payment.routes.js
│   │   ├── rating.routes.js
│   │   ├── sevak.routes.js
│   │   └── notification.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── validate.middleware.js # Request validation
│   │   ├── error.middleware.js # Error handler
│   │   ├── upload.middleware.js # File upload
│   │   └── rateLimit.middleware.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── booking.validator.js
│   │   └── payment.validator.js
│   ├── services/
│   │   ├── otp.service.js      # OTP generation/verification
│   │   ├── email.service.js    # Email sending
│   │   ├── sms.service.js      # SMS sending
│   │   ├── notification.service.js
│   │   └── payment.service.js  # Razorpay integration
│   ├── utils/
│   │   ├── jwt.utils.js        # Token generation
│   │   ├── response.utils.js   # Standardized responses
│   │   ├── logger.js           # Winston logger
│   │   └── helpers.js
│   └── app.js                  # Express app
├── uploads/                    # File uploads directory
│   ├── avatars/
│   ├── documents/
│   └── job-photos/
├── logs/                       # Application logs
├── tests/                      # Test files
├── .env
├── .env.example
├── package.json
├── server.js                   # Entry point
└── README.md
```

---

## Implementation Best Practices

### 1. Code Quality
- **TypeScript**: Use TypeScript for frontend with strict mode enabled
- **ESLint**: Enforce consistent code style
- **Prettier**: Auto-format code
- **Comments**: Document complex logic and business rules
- **Naming Conventions**: 
  - Components: PascalCase (UserProfile.tsx)
  - Functions: camelCase (getUserProfile)
  - Constants: UPPER_SNAKE_CASE (API_BASE_URL)
  - Files: kebab-case for utils (date-helpers.ts)

### 2. Component Design
- **Atomic Design**: Break UI into atoms, molecules, organisms
- **Single Responsibility**: Each component should do one thing well
- **Props Interface**: Define clear TypeScript interfaces for props
- **Default Props**: Provide sensible defaults
- **Prop Validation**: Use Zod for runtime validation when needed
- **Memoization**: Use React.memo for expensive renders
- **Custom Hooks**: Extract reusable logic into hooks

### 3. State Management
- **Context for Global**: Auth, User, Theme
- **Local State**: Component-specific state with useState
- **Derived State**: Calculate from existing state, don't store
- **Zustand for Complex**: Shopping cart, filters, multi-step forms
- **Immutability**: Never mutate state directly

### 4. API Integration
```typescript
// Axios instance with interceptors
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Token expired - refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        await SecureStore.setItemAsync('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // Navigate to login
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 5. Error Handling
```typescript
// Frontend - Centralized error handler
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 'Something went wrong';
    Alert.alert('Error', message);
    return message;
  } else if (error.request) {
    // Request made but no response
    Alert.alert('Network Error', 'Please check your internet connection');
    return 'Network error';
  } else {
    // Something else happened
    Alert.alert('Error', error.message);
    return error.message;
  }
};

// Backend - Global error middleware
export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}
```

### 6. Security Best Practices

**Backend**:
```javascript
// 1. JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// 2. Password Hashing
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// 3. Rate Limiting
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
});

app.use('/api/auth/login', authLimiter);

// 4. Input Sanitization
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize()); // Prevent NoSQL injection

// 5. CORS Configuration
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// 6. Helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// 7. File Upload Security
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type'));
};

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});
```

**Frontend**:
```typescript
// 1. Secure Storage
import * as SecureStore from 'expo-secure-store';

// Store sensitive data
await SecureStore.setItemAsync('accessToken', token);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// 2. Input Validation with Zod
import { z } from 'zod';

const loginSchema = z.object({
  phoneOrEmail: z.string().min(1, 'Required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// 3. Sanitize User Input
const sanitizeInput = (input: string) => {
  return input.trim().replace(/[<>]/g, '');
};

// 4. Deep Linking Security
import * as Linking from 'expo-linking';

// Validate deep links
const handleDeepLink = (url: string) => {
  const { hostname, path } = Linking.parse(url);
  if (hostname === 'yourapp.com' && allowedPaths.includes(path)) {
    // Process link
  }
};
```

### 7. Performance Optimization

**Frontend**:
```typescript
// 1. Image Optimization
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
  transition={1000}
  cachePolicy="memory-disk"
/>

// 2. List Virtualization
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>

// 3. Lazy Loading
import { lazy, Suspense } from 'react';

const ServiceDetail = lazy(() => import('./screens/ServiceDetailScreen'));

<Suspense fallback={<Loader />}>
  <ServiceDetail />
</Suspense>

// 4. Memoization
import { memo, useMemo, useCallback } from 'react';

const ServiceCard = memo(({ service }) => {
  return <Card>{service.name}</Card>;
});

// 5. Debouncing
import { useDebounce } from './hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchServices(debouncedSearch);
  }
}, [debouncedSearch]);
```

**Backend**:
```javascript
// 1. Database Indexing
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
bookingSchema.index({ residentId: 1, status: 1 });
bookingSchema.index({ sevakId: 1, scheduledDate: 1 });
serviceSchema.index({ category: 1, isActive: 1 });

// 2. Query Optimization
// Use lean() for read-only queries
const services = await Service.find({ isActive: true }).lean();

// Select only needed fields
const users = await User.find().select('name email phoneNumber');

// Populate sparingly
const booking = await Booking.findById(id)
  .populate('serviceId', 'name basePrice')
  .populate('residentId', 'fullName phoneNumber');

// 3. Caching Strategy
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
const getServices = async () => {
  const cached = await client.get('services:active');
  if (cached) return JSON.parse(cached);
  
  const services = await Service.find({ isActive: true });
  await client.setEx('services:active', 3600, JSON.stringify(services));
  return services;
};

// 4. Pagination
const getBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const bookings = await Booking.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Booking.countDocuments();
  
  res.json({
    bookings,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  });
};

// 5. Compression
const compression = require('compression');
app.use(compression());
```

### 8. Testing Strategy

**Frontend Testing**:
```typescript
// 1. Component Testing
import { render, screen, fireEvent } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';

describe('LoginScreen', () => {
  it('renders login form', () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText('Phone or Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });
  
  it('validates form inputs', async () => {
    render(<LoginScreen />);
    const loginButton = screen.getByText('Login');
    fireEvent.press(loginButton);
    
    expect(await screen.findByText('Required')).toBeTruthy();
  });
});

// 2. Hook Testing
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });
    
    expect(result.current.user).toBeTruthy();
  });
});
```

**Backend Testing**:
```javascript
// 1. API Testing
const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phoneNumber: '+919876543210',
        email: 'test@example.com',
        password: 'password123',
        role: 'resident',
        fullName: 'Test User',
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('userId');
  });
  
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        phoneOrEmail: 'test@example.com',
        password: 'password123',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });
});

// 2. Model Testing
describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = new User({
      phoneNumber: '+919876543210',
      email: 'test@example.com',
      password: 'password123',
      role: 'resident',
      fullName: 'Test User',
    });
    
    await user.save();
    expect(user.password).not.toBe('password123');
  });
});
```

---

## Environment Variables

### Frontend (.env)
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:5000

# Razorpay (Test Keys)
EXPO_PUBLIC_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxx

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX

# App Configuration
EXPO_PUBLIC_APP_NAME=Society Booking
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/society-booking
MONGODB_URI_TEST=mongodb://localhost:27017/society-booking-test

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

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
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Getting Started Instructions

### Prerequisites
- Node.js v20+ LTS installed
- MongoDB v7+ installed and running
- Expo CLI installed: `npm install -g expo-cli`
- Android Studio / Xcode (for emulators)
- Git installed

### Setup Steps

#### 1. Clone and Setup Backend
```bash
# Create backend directory
mkdir society-booking-api
cd society-booking-api

# Initialize Node project
npm init -y

# Install dependencies
npm install express mongoose dotenv bcryptjs jsonwebtoken cors helmet express-rate-limit express-validator multer razorpay winston morgan compression

# Install dev dependencies
npm install -D nodemon

# Create folder structure
mkdir -p src/{config,models,controllers,routes,middleware,validators,services,utils}
mkdir -p uploads/{avatars,documents,job-photos}
mkdir logs

# Create .env file and add environment variables
```

#### 2. Setup Frontend
```bash
# Create Expo app
npx create-expo-app society-booking-app --template blank-typescript

cd society-booking-app

# Install dependencies
npx expo install react-native-paper react-native-safe-area-context
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install expo-secure-store expo-image-picker expo-image
npx expo install axios react-hook-form zod
npx expo install @shopify/flash-list

# Install additional packages
npm install zustand date-fns

# Create folder structure
mkdir -p src/{components,screens,navigation,contexts,services,hooks,utils,types,theme}
```

#### 3. Database Setup
```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Create database (auto-created on first connection)
# Connect using MongoDB Compass or CLI
```

#### 4. Run the Application
```bash
# Terminal 1 - Backend
cd society-booking-api
npm run dev

# Terminal 2 - Frontend
cd society-booking-app
npx expo start

# Scan QR code with Expo Go app or press 'a' for Android, 'i' for iOS
```

---

## Development Guidelines

### Git Workflow
```bash
# Feature branch naming
feature/user-authentication
feature/booking-system
feature/payment-integration

# Commit message format
feat: Add user registration API
fix: Resolve booking date validation issue
docs: Update API documentation
refactor: Optimize service search query
```

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] TypeScript types defined
- [ ] Components are reusable
- [ ] API responses validated
- [ ] Security best practices followed
- [ ] Performance optimized
- [ ] Comments added for complex logic

### Documentation Requirements
- API documentation using Swagger
- Component documentation with props
- README for setup instructions
- Environment variables documented
- Database schema documented

---

## Deliverables

### Phase 1 POC Completion
1. **Functional Application**:
   - Working mobile app (Android/iOS via Expo)
   - Complete backend API
   - MongoDB database with test data

2. **Code Repository**:
   - Clean, well-organized code
   - Git repository with proper commits
   - README files for both frontend and backend

3. **Documentation**:
   - API documentation (Swagger/Postman)
   - Setup and installation guide
   - Architecture diagrams
   - Database schema documentation

4. **Testing**:
   - Postman collection for API testing
   - Basic unit tests for critical functions
   - Test user accounts for demo

5. **Deployment Ready**:
   - Environment configurations
   - Build scripts
   - Deployment documentation

---

## Success Criteria

✅ User can register and login successfully  
✅ Resident can browse and book services  
✅ Payment integration works (test mode)  
✅ Sevak can view assigned jobs  
✅ Check-in/out functionality works  
✅ Photo upload for job completion works  
✅ Rating and feedback system functional  
✅ Notifications are sent correctly  
✅ All API endpoints working as documented  
✅ Mobile app is responsive and performant  
✅ Error handling is robust  
✅ Code is production-ready quality  

---

## Additional Notes

### Mock Data for Testing
Create seed scripts to populate:
- 3 user roles (Resident, Sevak, Vendor)
- 10+ services across different categories
- Sample bookings in various states
- Sample ratings and reviews

### Razorpay Test Cards
- Success: 4111 1111 1111 1111
- Failure: 4111 1111 1111 1112
- Any CVV and future expiry date

### OTP for Testing
In development mode, use fixed OTP: `123456` or bypass OTP verification

### Performance Targets
- App launch time: < 3 seconds
- API response time: < 200ms (average)
- Image upload time: < 5 seconds
- Screen navigation: Smooth 60fps

---

## Build This POC With

**Priority**: Production-ready code quality, scalability, and maintainability  
**Focus**: Complete Phase 1 features with best practices  
**Timeline**: Build as a comprehensive POC demonstrating all features  
**Output**: Fully functional mobile app + backend API ready for further development

---

**Start building this application following all specifications, best practices, and implementation guidelines provided above. Create a scalable, production-ready POC that demonstrates all Phase 1 features.**
