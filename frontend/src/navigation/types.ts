import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { role?: 'resident' | 'sevak' } | undefined;
  OTPVerification: { userId: string; phoneNumber?: string; email?: string };
  ForgotPassword: undefined;
  ResetPassword: { userId: string; otp?: string };
};

// Resident Stack
export type ResidentTabParamList = {
  Home: undefined;
  Services: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type ResidentStackParamList = {
  ResidentTabs: NavigatorScreenParams<ResidentTabParamList>;
  ServiceDetail: { serviceId: string };
  BookingDetail: { bookingId: string };
  CreateBooking: { serviceId: string };
  Payment: { bookingId: string };
  Rating: { bookingId: string; sevakId: string };
};

// Sevak Stack
export type SevakTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Available: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type SevakStackParamList = {
  SevakTabs: NavigatorScreenParams<SevakTabParamList>;
  JobDetail: { jobId: string };
  CheckIn: { jobId: string };
  CompleteJob: { jobId: string };
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Resident: NavigatorScreenParams<ResidentStackParamList>;
  Sevak: NavigatorScreenParams<SevakStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
