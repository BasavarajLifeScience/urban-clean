import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Checkbox, ActivityIndicator, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema } from '../../utils/validation';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

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
    console.log('🎯 [RegisterScreen] Registration form submitted');
    console.log('📋 [RegisterScreen] Form data:', {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      role: selectedRole,
      hasPassword: !!data.password,
      passwordsMatch: data.password === data.confirmPassword,
      acceptedTerms,
    });

    if (!acceptedTerms) {
      console.log('❌ [RegisterScreen] Terms not accepted');
      Alert.alert('Terms Required', 'Please accept the Terms and Conditions to continue.');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 [RegisterScreen] Starting registration request...');

      const { confirmPassword, ...registerData } = data;
      const requestPayload = {
        ...registerData,
        role: selectedRole,
      };

      console.log('📤 [RegisterScreen] Request payload:', requestPayload);

      const result = await registerUser(requestPayload);

      console.log('✅ [RegisterScreen] Registration successful!');
      console.log('📥 [RegisterScreen] Response:', result);

      // Navigate to OTP screen
      console.log('🔄 [RegisterScreen] Navigating to OTP verification screen');
      console.log('📋 [RegisterScreen] Passing userId:', result.userId);
      navigation.navigate('OTPVerification', {
        userId: result.userId,
        phoneNumber: data.phoneNumber,
        email: data.email,
      });
    } catch (error: any) {
      console.error('❌ [RegisterScreen] Registration failed:', error);
      console.error('❌ [RegisterScreen] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || error.message || 'Unable to create account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      console.log('🏁 [RegisterScreen] Registration flow completed (loading stopped)');
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
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium, colors.backgroundMedium]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[colors.secondary, colors.secondaryDark]}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name="account-plus" size={32} color={colors.white} />
                </LinearGradient>
              </View>
              <Text variant="displaySmall" style={styles.title}>
                Create Account
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Sign up to get started
              </Text>
            </View>

            <View style={styles.formCard}>
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
                    outlineColor={colors.gray[300]}
                    activeOutlineColor={colors.primary}
                    textColor={colors.gray[900]}
                    left={<TextInput.Icon icon="account-outline" color={colors.gray[600]} />}
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
                    outlineColor={colors.gray[300]}
                    activeOutlineColor={colors.primary}
                    textColor={colors.gray[900]}
                    left={<TextInput.Icon icon="phone-outline" color={colors.gray[600]} />}
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
                    outlineColor={colors.gray[300]}
                    activeOutlineColor={colors.primary}
                    textColor={colors.gray[900]}
                    left={<TextInput.Icon icon="email-outline" color={colors.gray[600]} />}
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
                    right={<TextInput.Icon icon="chevron-down" color={colors.gray[600]} />}
                    onPressIn={() => setRoleMenuVisible(true)}
                    style={styles.input}
                    outlineColor={colors.gray[300]}
                    activeOutlineColor={colors.primary}
                    textColor={colors.gray[900]}
                    left={<TextInput.Icon icon="account-group-outline" color={colors.gray[600]} />}
                  />
                }
              >
                <Menu.Item onPress={() => { setSelectedRole('resident'); setRoleMenuVisible(false); }} title="Resident" />
                <Menu.Item onPress={() => { setSelectedRole('sevak'); setRoleMenuVisible(false); }} title="Service Provider (Sevak)" />
                <Menu.Item onPress={() => { setSelectedRole('vendor'); setRoleMenuVisible(false); }} title="Vendor" />
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
                        color={colors.gray[600]}
                      />
                    }
                    textContentType="newPassword"
                    autoComplete="password-new"
                    style={styles.input}
                    outlineColor={colors.gray[300]}
                    activeOutlineColor={colors.primary}
                    textColor={colors.gray[900]}
                    left={<TextInput.Icon icon="lock-outline" color={colors.gray[600]} />}
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
                        color={colors.gray[600]}
                      />
                    }
                    textContentType="newPassword"
                    autoComplete="password-new"
                    style={styles.input}
                    outlineColor={colors.gray[300]}
                    activeOutlineColor={colors.primary}
                    textColor={colors.gray[900]}
                    left={<TextInput.Icon icon="lock-check-outline" color={colors.gray[600]} />}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}

              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <Checkbox
                  status={acceptedTerms ? 'checked' : 'unchecked'}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  color={colors.primary}
                />
                <Text variant="bodyMedium" style={styles.termsText}>
                  I accept the{' '}
                  <Text style={styles.link}>Terms and Conditions</Text>
                  {' '}and{' '}
                  <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              <LinearGradient
                colors={[colors.secondary, colors.secondaryDark]}
                style={styles.registerButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Button
                  mode="text"
                  onPress={handleSubmit(onSubmit)}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color={colors.white} /> : 'Create Account'}
                </Button>
              </LinearGradient>

              <View style={styles.loginContainer}>
                <Text variant="bodyMedium" style={styles.loginText}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  title: {
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.gray[300],
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
  },
  input: {
    marginBottom: spacing.xs,
    backgroundColor: colors.white,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  termsText: {
    flex: 1,
    color: colors.gray[700],
    marginLeft: -8,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.gray[700],
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
