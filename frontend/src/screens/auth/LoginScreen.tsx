import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Checkbox, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema } from '../../utils/validation';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginFormData {
  phoneOrEmail: string;
  password: string;
}

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneOrEmail: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await login(data);
      // Navigation will be handled automatically by AuthContext
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid credentials. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
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
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name="shield-account" size={32} color={colors.white} />
                </LinearGradient>
              </View>
              <Text variant="displaySmall" style={styles.title}>
                Welcome Back
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Sign in to continue
              </Text>
            </View>

            <View style={styles.formCard}>
              <Controller
                control={control}
                name="phoneOrEmail"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Phone or Email"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.phoneOrEmail}
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
              {errors.phoneOrEmail && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {errors.phoneOrEmail.message}
                </Text>
              )}

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
                    textContentType="password"
                    autoComplete="password"
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

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => setRememberMe(!rememberMe)}
                    color={colors.primary}
                  />
                  <Text variant="bodyMedium" style={styles.rememberText}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.loginButton}
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
                  {loading ? <ActivityIndicator color={colors.white} /> : 'Sign In'}
                </Button>
              </LinearGradient>

              <View style={styles.signupContainer}>
                <Text variant="bodyMedium" style={styles.signupText}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signupLink}>Sign Up</Text>
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
    marginBottom: spacing.xl,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: colors.gray[700],
    marginLeft: -8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: colors.gray[700],
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
