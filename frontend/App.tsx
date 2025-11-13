import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { lightTheme, theme } from './src/theme';
import { RootStackParamList } from './src/navigation/types';

// Auth Screens
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  OTPVerificationScreen,
  ForgotPasswordScreen,
} from './src/screens/auth';

// Resident Screens
import {
  ResidentHomeScreen,
  ServicesListScreen,
  ServiceDetailScreen,
  CreateBookingScreen,
  MyBookingsScreen,
  BookingDetailScreen,
  PaymentScreen,
  RatingScreen,
} from './src/screens/resident';

// Sevak Screens
import {
  SevakDashboardScreen,
  SevakJobsListScreen,
  SevakJobDetailScreen,
  SevakEarningsScreen,
} from './src/screens/sevak';

// Profile Screen
import { ProfileScreen } from './src/screens/profile';

// Placeholder for other screens
import { Text, View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Placeholder components
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>
      This screen will be implemented with full functionality
    </Text>
  </View>
);

// Auth Navigator
const AuthNavigator = () => {
  const AuthStack = createStackNavigator();

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Resident Tab Navigator
const ResidentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.roles.resident.main,
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
        },
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ResidentHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="room-service" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Resident Navigator
const ResidentNavigator = () => {
  const ResidentStack = createStackNavigator();

  return (
    <ResidentStack.Navigator>
      <ResidentStack.Screen
        name="ResidentTabs"
        component={ResidentTabs}
        options={{ headerShown: false }}
      />
      <ResidentStack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{ title: 'Service Details' }}
      />
      <ResidentStack.Screen
        name="CreateBooking"
        component={CreateBookingScreen}
        options={{ title: 'Book Service' }}
      />
      <ResidentStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ title: 'Booking Details' }}
      />
      <ResidentStack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
      <ResidentStack.Screen
        name="Rating"
        component={RatingScreen}
        options={{ title: 'Rate Service' }}
      />
    </ResidentStack.Navigator>
  );
};

// Sevak Tab Navigator
const SevakTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.roles.sevak.main,
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
        },
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={SevakDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={SevakJobsListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={SevakEarningsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="currency-inr" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Sevak Navigator
const SevakNavigator = () => {
  const SevakStack = createStackNavigator();

  return (
    <SevakStack.Navigator>
      <SevakStack.Screen
        name="SevakTabs"
        component={SevakTabs}
        options={{ headerShown: false }}
      />
      <SevakStack.Screen
        name="JobDetail"
        component={SevakJobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <SevakStack.Screen
        name="CheckIn"
        options={{ title: 'Check In' }}
      >
        {() => <PlaceholderScreen title="Check In - Coming Soon" />}
      </SevakStack.Screen>
      <SevakStack.Screen
        name="CompleteJob"
        options={{ title: 'Complete Job' }}
      >
        {() => <PlaceholderScreen title="Complete Job - Coming Soon" />}
      </SevakStack.Screen>
    </SevakStack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.role === 'resident' ? (
        <Stack.Screen name="Resident" component={ResidentNavigator} />
      ) : user?.role === 'sevak' ? (
        <Stack.Screen name="Sevak" component={SevakNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Main App Component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={lightTheme}>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <StatusBar style="auto" />
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    marginTop: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[8],
  },
  placeholderText: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing[4],
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
