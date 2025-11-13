import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [selectedRole, setSelectedRole] = useState<'resident' | 'sevak' | 'vendor'>('resident');

  const handleGetStarted = () => {
    navigation.navigate('Register', { role: selectedRole });
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Urban Clean
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Society Service Booking Platform
          </Text>
        </View>

        <View style={styles.content}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            I am a...
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <RadioButton.Group
                onValueChange={(value) => setSelectedRole(value as 'resident' | 'sevak' | 'vendor')}
                value={selectedRole}
              >
                <View style={styles.radioItem}>
                  <View style={styles.radioContent}>
                    <Text variant="titleMedium">Resident</Text>
                    <Text variant="bodyMedium" style={styles.roleDescription}>
                      Book services for my home
                    </Text>
                  </View>
                  <RadioButton value="resident" />
                </View>

                <View style={styles.divider} />

                <View style={styles.radioItem}>
                  <View style={styles.radioContent}>
                    <Text variant="titleMedium">Service Provider (Sevak)</Text>
                    <Text variant="bodyMedium" style={styles.roleDescription}>
                      Provide services to residents
                    </Text>
                  </View>
                  <RadioButton value="sevak" />
                </View>

                <View style={styles.divider} />

                <View style={styles.radioItem}>
                  <View style={styles.radioContent}>
                    <Text variant="titleMedium">Vendor</Text>
                    <Text variant="bodyMedium" style={styles.roleDescription}>
                      Manage my service business
                    </Text>
                  </View>
                  <RadioButton value="vendor" />
                </View>
              </RadioButton.Group>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>

          <Button
            mode="text"
            onPress={handleLogin}
            style={styles.textButton}
          >
            Already have an account? Login
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    color: '#333333',
  },
  card: {
    marginBottom: 24,
    elevation: 2,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  radioContent: {
    flex: 1,
  },
  roleDescription: {
    color: '#666666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  primaryButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  textButton: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#999999',
    textAlign: 'center',
  },
});
