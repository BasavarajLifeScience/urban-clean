import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { forgotPassword } = useAuth();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phoneOrEmail.trim()) {
      Alert.alert('Required', 'Please enter your phone number or email.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword({ phoneOrEmail });
      Alert.alert(
        'Success',
        'A password reset OTP has been sent to your phone/email.',
        [
          {
            text: 'OK',
            onPress: () => {
              // In a real app, navigate to reset password screen with OTP
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Failed',
        error.response?.data?.message || 'Unable to send reset link. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
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
                  <MaterialCommunityIcons name="lock-reset" size={32} color={colors.white} />
                </LinearGradient>
              </View>
              <Text variant="displaySmall" style={styles.title}>
                Forgot Password?
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Enter your phone number or email to receive a password reset OTP
              </Text>
            </View>

            <View style={styles.formCard}>
              <TextInput
                label="Phone or Email"
                mode="outlined"
                value={phoneOrEmail}
                onChangeText={setPhoneOrEmail}
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

              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Button
                  mode="text"
                  onPress={handleSubmit}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color={colors.white} /> : 'Send Reset OTP'}
                </Button>
              </LinearGradient>

              <View style={styles.backToLoginContainer}>
                <Text variant="bodyMedium" style={styles.backToLoginText}>
                  Remember your password?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.backToLoginLink}>Back to Login</Text>
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
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
  },
  input: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  submitButton: {
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
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    color: colors.gray[700],
  },
  backToLoginLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
