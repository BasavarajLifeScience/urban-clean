import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { lightTheme } from './src/theme';
import { RootStackParamList } from './src/navigation/types';

// Navigation placeholder screens (to be implemented)
import { Text, View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

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
      <AuthStack.Screen name="Welcome">
        {() => <PlaceholderScreen title="Welcome Screen" />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Login">
        {() => <PlaceholderScreen title="Login Screen" />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {() => <PlaceholderScreen title="Register Screen" />}
      </AuthStack.Screen>
      <AuthStack.Screen name="OTPVerification">
        {() => <PlaceholderScreen title="OTP Verification Screen" />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

// Resident Navigator
const ResidentNavigator = () => {
  const ResidentStack = createStackNavigator();

  return (
    <ResidentStack.Navigator screenOptions={{ headerShown: false }}>
      <ResidentStack.Screen name="ResidentTabs">
        {() => <PlaceholderScreen title="Resident App - Home, Services, Bookings" />}
      </ResidentStack.Screen>
    </ResidentStack.Navigator>
  );
};

// Sevak Navigator
const SevakNavigator = () => {
  const SevakStack = createStackNavigator();

  return (
    <SevakStack.Navigator screenOptions={{ headerShown: false }}>
      <SevakStack.Screen name="SevakTabs">
        {() => <PlaceholderScreen title="Sevak App - Jobs, Dashboard, Earnings" />}
      </SevakStack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 32,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
