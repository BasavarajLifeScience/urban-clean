// User types
export type UserRole = 'resident' | 'sevak' | 'vendor';

export interface User {
  _id: string;
  phoneNumber: string;
  email: string;
  role: UserRole;
  fullName: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Profile {
  _id: string;
  userId: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  skills?: string[];
  experience?: number;
  bio?: string;
  documents?: Document[];
  availability?: Availability;
  businessName?: string;
  businessType?: string;
  servicesOffered?: string[];
  profileCompletionPercentage: number;
}

export interface Address {
  flatNumber?: string;
  building?: string;
  society?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface Document {
  _id?: string;
  type: 'aadhaar' | 'pan' | 'certificate' | 'other';
  url: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

export interface Availability {
  days: string[];
  timeSlots: string[];
}

// Service types
export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  images?: string[];
  basePrice: number;
  priceUnit: string;
  duration: number;
  isActive: boolean;
  tags: string[];
  features: string[];
  faqs: FAQ[];
  averageRating: number;
  totalRatings: number;
  bookingCount: number;
}

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

// Booking types
export interface Booking {
  _id: string;
  bookingNumber: string;
  residentId: string | User;
  serviceId: string | Service;
  sevakId?: string | User;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  status: BookingStatus;
  address: Address;
  specialInstructions?: string;
  basePrice: number;
  additionalCharges: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInOTP?: string;
  beforeImages?: string[];
  afterImages?: string[];
  completionNotes?: string;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface TimelineEntry {
  status: string;
  timestamp: string;
  notes?: string;
}

// Payment types
export interface Payment {
  _id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  status: 'created' | 'pending' | 'success' | 'failed' | 'refunded';
  failureReason?: string;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  bookingId: string;
  paymentId: string;
  userId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  issuedAt: string;
  paidAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Rating types
export interface Rating {
  _id: string;
  bookingId: string;
  ratedTo: string;
  ratedBy: string;
  rating: number;
  comment?: string;
  isReported: boolean;
  createdAt: string;
}

// Notification types
export interface Notification {
  _id: string;
  userId: string;
  type: 'booking' | 'payment' | 'rating' | 'offer' | 'system';
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Auth types
export interface LoginRequest {
  phoneOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OTPVerifyRequest {
  userId: string;
  otp: string;
}

// Sevak types
export interface Job extends Booking {
  resident?: User;
  service?: Service;
}

export interface Earnings {
  _id: string;
  sevakId: string;
  bookingId: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: 'pending' | 'processed' | 'paid';
  paidAt?: string;
  createdAt: string;
}

export interface PerformanceMetrics {
  averageRating: number;
  totalRatings: number;
  completionRate: number;
  onTimePercentage: number;
  totalJobs: number;
}
