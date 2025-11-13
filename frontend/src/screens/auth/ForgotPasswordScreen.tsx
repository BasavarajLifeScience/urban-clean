import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Forgot Password?
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your phone number or email to receive a password reset OTP
          </Text>
        </View>

        <View style={styles.form}>
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
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            contentStyle={styles.buttonContent}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : 'Send Reset OTP'}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Back to Login
          </Button>
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
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  subtitle: {
    color: '#666666',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 24,
  },
  submitButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
});
