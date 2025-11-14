import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { Text, Button, Card, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [selectedRole, setSelectedRole] = useState<'resident' | 'sevak'>('resident');

  const handleGetStarted = () => {
    navigation.navigate('Register', { role: selectedRole });
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'resident':
        return 'home-account';
      case 'sevak':
        return 'account-hard-hat';
      default:
        return 'account';
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
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name="home-city" size={48} color={colors.white} />
                </LinearGradient>
              </View>
              <Text variant="displaySmall" style={styles.title}>
                Urban Clean
              </Text>
              <Text variant="titleMedium" style={styles.subtitle}>
                Your Society Service Platform
              </Text>
            </View>

            <View style={styles.content}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Choose Your Role
              </Text>

              <RadioButton.Group
                onValueChange={(value) => setSelectedRole(value as 'resident' | 'sevak')}
                value={selectedRole}
              >
                {[
                  { value: 'resident', title: 'Resident', description: 'Book services for your home' },
                  { value: 'sevak', title: 'Service Provider', description: 'Provide services to residents' },
                ].map((role, index) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[styles.roleCard, selectedRole === role.value && styles.selectedCard]}
                    onPress={() => setSelectedRole(role.value as 'resident' | 'sevak')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.roleCardContent}>
                      <View style={styles.roleIconContainer}>
                        <LinearGradient
                          colors={
                            selectedRole === role.value
                              ? [colors.primary, colors.primaryDark]
                              : [colors.gray[700], colors.gray[600]]
                          }
                          style={styles.roleIconGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <MaterialCommunityIcons
                            name={getRoleIcon(role.value) as any}
                            size={32}
                            color={colors.white}
                          />
                        </LinearGradient>
                      </View>
                      <View style={styles.roleTextContainer}>
                        <Text variant="titleMedium" style={styles.roleTitle}>
                          {role.title}
                        </Text>
                        <Text variant="bodyMedium" style={styles.roleDescription}>
                          {role.description}
                        </Text>
                      </View>
                      <RadioButton
                        value={role.value}
                        color={colors.primary}
                        uncheckedColor={colors.gray[500]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>

              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Button
                  mode="text"
                  onPress={handleGetStarted}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.primaryButtonLabel}
                >
                  Get Started
                </Button>
              </LinearGradient>

              <Button
                mode="text"
                onPress={handleLogin}
                style={styles.textButton}
                labelStyle={styles.textButtonLabel}
              >
                Already have an account? <Text style={styles.loginLink}>Sign In</Text>
              </Button>
            </View>

            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Text>
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
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
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
  },
  content: {
    flex: 1,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.2,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    ...shadows.colored.primary,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconContainer: {
    marginRight: spacing.md,
  },
  roleIconGradient: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  roleDescription: {
    color: colors.gray[600],
    fontSize: 13,
  },
  primaryButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  primaryButtonLabel: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textButton: {
    marginBottom: spacing.md,
  },
  textButtonLabel: {
    color: colors.gray[300],
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    color: colors.gray[500],
    textAlign: 'center',
    fontSize: 12,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
