import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';

type OTPVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

export const OTPVerificationScreen = () => {
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const { verifyOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  const { phoneNumber, email } = route.params || {};

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Start resend timer
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-submit when all 6 digits are entered
    if (otp.every((digit) => digit !== '')) {
      handleVerify();
    }
  }, [otp]);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits.');
      return;
    }

    try {
      setLoading(true);
      await verifyOTP({
        phoneNumber: phoneNumber || '',
        otp: otpCode,
      });
      // Navigation will be handled automatically by AuthContext
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error.response?.data?.message || 'Invalid OTP. Please try again.',
        [{ text: 'OK' }]
      );
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      // Call resend OTP API here
      Alert.alert('Success', 'OTP has been resent to your phone.');
      setResendTimer(60);
    } catch (error: any) {
      Alert.alert(
        'Resend Failed',
        error.response?.data?.message || 'Unable to resend OTP. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Verify OTP
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter the 6-digit code sent to
          </Text>
          <Text variant="titleMedium" style={styles.contact}>
            {phoneNumber || email}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleVerify}
          style={styles.verifyButton}
          contentStyle={styles.buttonContent}
          disabled={loading || otp.some((digit) => !digit)}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : 'Verify'}
        </Button>

        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text variant="bodyMedium" style={styles.timerText}>
              Resend OTP in {resendTimer}s
            </Text>
          ) : (
            <Button mode="text" onPress={handleResend} disabled={loading}>
              Resend OTP
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  subtitle: {
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  contact: {
    color: '#333333',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    backgroundColor: '#F5F5F5',
  },
  otpInputFilled: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  verifyButton: {
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    color: '#999999',
  },
});
