import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Checkbox, ActivityIndicator, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema } from '../../utils/validation';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
type RegisterScreenRouteProp = RouteProp<AuthStackParamList, 'Register'>;

interface RegisterFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const route = useRoute<RegisterScreenRouteProp>();
  const { register: registerUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'resident' | 'sevak' | 'vendor'>(
    route.params?.role || 'resident'
  );
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'Please accept the Terms and Conditions to continue.');
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...registerData } = data;
      await registerUser({
        ...registerData,
        role: selectedRole,
      });
      // Navigate to OTP screen
      navigation.navigate('OTPVerification', {
        phoneNumber: data.phoneNumber,
        email: data.email,
      });
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Unable to create account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const getRoleLabel = () => {
    const labels = {
      resident: 'Resident',
      sevak: 'Service Provider (Sevak)',
      vendor: 'Vendor',
    };
    return labels[selectedRole];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign up to get started
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Full Name"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.fullName}
                autoCapitalize="words"
                textContentType="name"
                autoComplete="name"
                style={styles.input}
              />
            )}
          />
          {errors.fullName && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.fullName.message}
            </Text>
          )}

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Phone Number"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.phoneNumber}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                style={styles.input}
              />
            )}
          />
          {errors.phoneNumber && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.phoneNumber.message}
            </Text>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.email}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                style={styles.input}
              />
            )}
          />
          {errors.email && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.email.message}
            </Text>
          )}

          <Menu
            visible={roleMenuVisible}
            onDismiss={() => setRoleMenuVisible(false)}
            anchor={
              <TextInput
                label="I am a..."
                mode="outlined"
                value={getRoleLabel()}
                editable={false}
                right={<TextInput.Icon icon="chevron-down" />}
                onPressIn={() => setRoleMenuVisible(true)}
                style={styles.input}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedRole('resident');
                setRoleMenuVisible(false);
              }}
              title="Resident"
            />
            <Menu.Item
              onPress={() => {
                setSelectedRole('sevak');
                setRoleMenuVisible(false);
              }}
              title="Service Provider (Sevak)"
            />
            <Menu.Item
              onPress={() => {
                setSelectedRole('vendor');
                setRoleMenuVisible(false);
              }}
              title="Vendor"
            />
          </Menu>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.password}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                textContentType="newPassword"
                autoComplete="password-new"
                style={styles.input}
              />
            )}
          />
          {errors.password && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.password.message}
            </Text>
          )}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                textContentType="newPassword"
                autoComplete="password-new"
                style={styles.input}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.confirmPassword.message}
            </Text>
          )}

          <View style={styles.termsContainer}>
            <Checkbox
              status={acceptedTerms ? 'checked' : 'unchecked'}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            />
            <Text variant="bodyMedium" style={styles.termsText}>
              I accept the{' '}
              <Text style={styles.link}>Terms and Conditions</Text>
              {' '}and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.registerButton}
            contentStyle={styles.buttonContent}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : 'Register'}
          </Button>

          <View style={styles.loginContainer}>
            <Text variant="bodyMedium" style={styles.loginText}>
              Already have an account?{' '}
            </Text>
            <Button mode="text" onPress={handleLogin} compact>
              Login
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666666',
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#B00020',
    marginBottom: 12,
    marginLeft: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  termsText: {
    flex: 1,
    color: '#666666',
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666666',
  },
});
