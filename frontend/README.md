# Society Booking Mobile App - Frontend

React Native mobile application for the Society Service Booking platform, built with Expo and TypeScript.

## 🏗️ Architecture Overview

This is a **production-ready mobile app framework** with complete infrastructure for Phase 1 features. The architecture includes:

### Core Infrastructure (✅ Implemented)
- **React Native with Expo SDK 52+**
- **TypeScript** for type safety
- **React Navigation v7+** for routing
- **React Native Paper v5+** for Material Design UI
- **Axios** with interceptors for API calls
- **JWT authentication** with refresh token handling
- **Context API** for state management
- **Secure storage** for tokens
- **Form validation** with React Hook Form + Zod

### Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/        # Buttons, Cards, Inputs
│   │   ├── auth/          # Auth-specific components
│   │   ├── booking/       # Booking components
│   │   └── sevak/         # Sevak components
│   │
│   ├── screens/           # App screens
│   │   ├── auth/          # Welcome, Login, Register, OTP
│   │   ├── resident/      # Home, Services, Bookings
│   │   ├── sevak/         # Dashboard, Jobs, Earnings
│   │   └── profile/       # Profile management
│   │
│   ├── navigation/        # Navigation setup
│   │   └── types.ts       # Navigation type definitions
│   │
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   │
│   ├── services/          # API services
│   │   ├── api/
│   │   │   ├── axios.config.ts  # Axios setup with interceptors
│   │   │   ├── auth.api.ts      # Auth endpoints
│   │   │   ├── service.api.ts   # Service endpoints
│   │   │   └── booking.api.ts   # Booking endpoints
│   │   └── storage.service.ts   # Storage utilities
│   │
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useBooking.ts
│   │   └── useServices.ts
│   │
│   ├── utils/             # Utility functions
│   │   ├── validation.ts  # Zod schemas
│   │   └── helpers.ts     # Helper functions
│   │
│   ├── types/             # TypeScript types
│   │   └── index.ts       # All type definitions
│   │
│   └── theme/             # Theme configuration
│       └── index.ts       # Colors, spacing, typography
│
├── assets/                # Images, icons, fonts
├── App.tsx               # Root component
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🚀 Getting Started

### Prerequisites

- Node.js v20+ LTS
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio
- Backend API running on `http://localhost:5000`

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit EXPO_PUBLIC_API_URL if backend is not on localhost:5000
   ```

3. **Start the app**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## ✅ Implemented Features

### Infrastructure & Core Services

✅ **API Service Layer**
- Axios configuration with base URL
- Request/response interceptors
- Automatic token attachment
- Token refresh on 401 errors
- Error handling

✅ **Authentication Context**
- User state management
- Login/Register/Logout methods
- OTP verification
- Password reset
- Persistent auth state
- Secure token storage

✅ **Navigation Structure**
- Auth Stack (Welcome, Login, Register, OTP)
- Resident Stack (Home, Services, Bookings, Profile)
- Sevak Stack (Dashboard, Jobs, Earnings, Profile)
- Role-based navigation
- Type-safe navigation

✅ **Type Definitions**
- Complete TypeScript types for all data models
- User, Service, Booking, Payment, Rating types
- API request/response types
- Navigation param types

✅ **Theme System**
- Material Design 3 with React Native Paper
- Light/Dark theme support
- Color palette
- Typography system
- Spacing system
- Shadow utilities

✅ **Utilities**
- Form validation schemas (Zod)
- Date formatting
- Currency formatting
- Text helpers
- Booking status colors

## 📱 Screens to Implement

### Authentication Screens (auth/)

**WelcomeScreen.tsx** - Landing page
```typescript
- App logo and branding
- Role selection (Resident/Sevak/Vendor)
- "Get Started" button
- "Already have an account?" link
```

**LoginScreen.tsx** - User login
```typescript
- Phone/Email input
- Password input (with show/hide)
- "Remember me" checkbox
- "Login" button
- "Forgot Password?" link
- "Sign up" link
```

**RegisterScreen.tsx** - New user registration
```typescript
- Full name input
- Phone number input
- Email input
- Password input (with validation)
- Role selection dropdown
- Terms & conditions checkbox
- "Register" button
- Already registered? link
```

**OTPVerificationScreen.tsx** - OTP verification
```typescript
- OTP input (6 digits)
- "Verify" button
- "Resend OTP" button (with timer)
- Auto-submit on 6 digits
```

### Resident Screens (resident/)

**HomeScreen.tsx** - Dashboard
```typescript
- Search bar
- Service categories grid
- Featured services carousel
- Recent bookings list
- Quick actions
```

**ServicesListScreen.tsx** - Browse services
```typescript
- Search and filters
- Category filter chips
- Service cards with:
  - Image, name, price
  - Rating display
  - "Book Now" button
- Pagination
```

**ServiceDetailScreen.tsx** - Service details
```typescript
- Service images carousel
- Name, description, price
- Rating and reviews
- Features list
- FAQs
- "Add to Favorites" button
- "Book Service" button
```

**CreateBookingScreen.tsx** - Book a service
```typescript
- Date picker
- Time slot selection
- Address form
- Special instructions
- Price summary
- "Confirm Booking" button
```

**MyBookingsScreen.tsx** - Booking history
```typescript
- Status filter tabs
- Booking cards with:
  - Service name, date, time
  - Status badge
  - Total amount
- Tap to view details
```

**BookingDetailScreen.tsx** - Booking details
```typescript
- Booking number and status
- Service details
- Sevak information (if assigned)
- Timeline
- "Reschedule" button
- "Cancel" button
- "Pay Now" button (if unpaid)
- "Rate Service" button (if completed)
```

**PaymentScreen.tsx** - Payment
```typescript
- Amount breakdown
- Razorpay integration
- Payment method selection
- "Pay Now" button
```

### Sevak Screens (sevak/)

**SevakDashboardScreen.tsx** - Overview
```typescript
- Today's jobs count
- Upcoming jobs list
- Earnings summary
- Performance metrics
- Quick actions
```

**JobsListScreen.tsx** - All jobs
```typescript
- Date filter
- Status filter
- Job cards with:
  - Service name
  - Resident info
  - Date, time, location
  - Status
- Tap to view details
```

**JobDetailScreen.tsx** - Job details
```typescript
- Job information
- Resident contact
- Address with map
- Check-in OTP display
- "Start Navigation" button
- "Check In" button
- "Report Issue" button
```

**CheckInScreen.tsx** - Check-in
```typescript
- OTP input
- Location capture
- "Check In" button
- Job timer starts
```

**CompleteJobScreen.tsx** - Mark complete
```typescript
- Before/After photo upload
- Completion notes
- Checklist (if applicable)
- "Mark Complete" button
```

**EarningsScreen.tsx** - Earnings tracking
```typescript
- Period selector (Day/Week/Month)
- Total earnings
- Earnings chart
- Detailed breakdown list
- Payment status
```

### Profile Screens (profile/)

**ProfileScreen.tsx** - User profile
```typescript
- Avatar
- Personal information
- Edit button
- Documents (for Sevak)
- Settings
- Logout button
```

## 🔧 Implementation Guide

### Creating a New Screen

1. **Create screen file** in appropriate directory:
```typescript
// src/screens/resident/ServiceDetailScreen.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export const ServiceDetailScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium">Service Detail</Text>
      {/* Implement screen UI */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

2. **Add to navigation** in App.tsx:
```typescript
<Stack.Screen
  name="ServiceDetail"
  component={ServiceDetailScreen}
/>
```

3. **Update navigation types**:
```typescript
// src/navigation/types.ts
export type ResidentStackParamList = {
  ServiceDetail: { serviceId: string };
  // ...
};
```

### Creating a Reusable Component

```typescript
// src/components/common/ServiceCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Cover source={{ uri: service.imageUrl }} />
      <Card.Content>
        <Text variant="titleMedium">{service.name}</Text>
        <Text variant="bodyMedium">₹{service.basePrice}</Text>
        <Text variant="bodySmall">⭐ {service.averageRating}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={onPress}>Book Now</Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});
```

### Using API Services

```typescript
import { serviceApi } from '../services/api';
import { useState, useEffect } from 'react';

const [services, setServices] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadServices();
}, []);

const loadServices = async () => {
  try {
    setLoading(true);
    const response = await serviceApi.getServices({ category: 'Cleaning' });
    if (response.success) {
      setServices(response.data);
    }
  } catch (error) {
    console.error('Error loading services:', error);
  } finally {
    setLoading(false);
  }
};
```

### Form Handling

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../utils/validation';

const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});

<Controller
  control={control}
  name="phoneOrEmail"
  render={({ field: { onChange, value } }) => (
    <TextInput
      label="Phone or Email"
      value={value}
      onChangeText={onChange}
      error={!!errors.phoneOrEmail}
    />
  )}
/>

{errors.phoneOrEmail && (
  <Text style={{ color: 'red' }}>{errors.phoneOrEmail.message}</Text>
)}
```

## 🎨 UI Components (React Native Paper)

Available components:
- `Button` - Material button
- `TextInput` - Text input fields
- `Card` - Card container
- `List.Item` - List items
- `Chip` - Filter chips
- `Badge` - Notification badges
- `Avatar` - User avatars
- `Divider` - Section dividers
- `Dialog` - Modal dialogs
- `Snackbar` - Toast messages
- `FAB` - Floating action button

## 🔐 Authentication Flow

1. User opens app
2. AuthContext checks for saved tokens
3. If authenticated, navigate to role-based stack (Resident/Sevak)
4. If not authenticated, show Auth stack
5. After login/register, tokens saved to SecureStore
6. User navigated to appropriate stack
7. On 401 error, token automatically refreshed
8. If refresh fails, user logged out

## 📡 API Integration

All API endpoints are ready to use:

```typescript
import { authApi, serviceApi, bookingApi } from '../services/api';

// Auth
await authApi.login({ phoneOrEmail, password });
await authApi.register({ fullName, phoneNumber, email, password, role });

// Services
await serviceApi.getServices({ category: 'Cleaning' });
await serviceApi.getServiceById(serviceId);

// Bookings
await bookingApi.createBooking({ serviceId, scheduledDate, scheduledTime, address });
await bookingApi.getMyBookings();
```

## 🧪 Testing

### Manual Testing

1. Start backend: `cd backend && npm run dev`
2. Run seed script: `npm run seed`
3. Start frontend: `cd frontend && npm start`
4. Test auth flow with credentials:
   - resident@example.com / password123
   - sevak@example.com / password123

### Test Scenarios

- User registration and OTP verification
- Login with different roles
- Token refresh on expiry
- Service browsing
- Booking creation
- Payment flow
- Sevak job management

## 📦 Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

### OTA Updates

```bash
expo publish
```

## 🚀 Next Steps

1. **Implement remaining screens** following the patterns in App.tsx
2. **Add image picker** for profile photos and job images
3. **Integrate Razorpay SDK** for payments
4. **Add push notifications** with Expo Notifications
5. **Implement offline support** with AsyncStorage
6. **Add analytics** with Expo Analytics
7. **Performance optimization** with React.memo and useMemo
8. **Accessibility improvements** with accessibilityLabel props
9. **Add unit tests** with Jest
10. **Add E2E tests** with Detox

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

## 🐛 Troubleshooting

**Metro bundler not starting:**
```bash
expo start -c  # Clear cache
```

**Dependencies issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**iOS pods issues:**
```bash
cd ios && pod install && cd ..
```

## 📄 License

MIT

---

**Note**: This is a production-ready framework with complete infrastructure. All API services, authentication, navigation, and type definitions are implemented. Implement the screens following the provided patterns and examples.
