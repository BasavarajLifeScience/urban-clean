import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ResidentStackParamList } from '../../navigation/types';
import { bookingApi } from '../../services/api/booking.api';
import { paymentApi } from '../../services/api/payment.api';
import { Booking } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type PaymentScreenRouteProp = RouteProp<ResidentStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = NativeStackNavigationProp<ResidentStackParamList, 'Payment'>;

export const PaymentScreen = () => {
  const route = useRoute<PaymentScreenRouteProp>();
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getBookingById(bookingId);

      if (response.success && response.data) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Unable to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    try {
      setProcessing(true);

      if (paymentMethod === 'online') {
        // Create Razorpay order
        const orderResponse = await paymentApi.createOrder({
          bookingId: booking._id,
          amount: booking.totalAmount,
        });

        if (orderResponse.success && orderResponse.data) {
          // In a real app, you would integrate Razorpay SDK here
          // For now, we'll simulate payment
          Alert.alert(
            'Payment Gateway',
            'In a production app, Razorpay payment gateway would open here.\n\nSimulating successful payment...',
            [
              {
                text: 'OK',
                onPress: async () => {
                  try {
                    // Simulate payment verification
                    await paymentApi.verifyPayment({
                      orderId: orderResponse.data.razorpayOrderId,
                      paymentId: 'simulated_payment_id',
                      signature: 'simulated_signature',
                    });

                    Alert.alert('Success', 'Payment completed successfully!', [
                      {
                        text: 'OK',
                        onPress: () => {
                          navigation.navigate('BookingDetail', { bookingId: booking._id });
                        },
                      },
                    ]);
                  } catch (error) {
                    Alert.alert('Error', 'Payment verification failed.');
                  }
                },
              },
            ]
          );
        }
      } else {
        // Cash on Delivery
        Alert.alert(
          'Cash on Delivery',
          'You have selected Cash on Delivery. Please pay the service provider in cash after service completion.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('BookingDetail', { bookingId: booking._id });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Payment Failed',
        error.response?.data?.message || 'Unable to process payment. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  if (!booking) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.gray[400]} />
        <Text variant="titleMedium" style={styles.errorText}>Booking not found</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium, colors.backgroundLight]}
        style={styles.gradient}
        locations={[0, 0.3, 1]}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Booking Summary Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.cardIcon}
                  >
                    <MaterialCommunityIcons name="receipt-text" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Booking Summary
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>Booking ID</Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    #{booking.bookingNumber}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>Service</Text>
                  <Text variant="bodyMedium" style={styles.summaryValue} numberOfLines={1}>
                    {booking.service?.name}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>Date</Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                {booking.scheduledTime && (
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium" style={styles.summaryLabel}>Time</Text>
                    <Text variant="bodyMedium" style={styles.summaryValue}>
                      {booking.scheduledTime}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Payment Method Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={[colors.info, colors.info + 'CC']}
                    style={styles.cardIcon}
                  >
                    <MaterialCommunityIcons name="credit-card" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Payment Method
                  </Text>
                </View>

                <RadioButton.Group
                  onValueChange={(value) => setPaymentMethod(value as 'online' | 'cod')}
                  value={paymentMethod}
                >
                  <TouchableOpacity
                    style={styles.radioItem}
                    onPress={() => setPaymentMethod('online')}
                  >
                    <View style={styles.radioContent}>
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.radioIcon}
                      >
                        <MaterialCommunityIcons name="credit-card-outline" size={20} color={colors.white} />
                      </LinearGradient>
                      <View style={styles.radioTextContent}>
                        <Text variant="titleSmall" style={styles.radioTitle}>
                          Online Payment (Razorpay)
                        </Text>
                        <Text variant="bodySmall" style={styles.radioDescription}>
                          Pay securely using UPI, Cards, Net Banking, or Wallets
                        </Text>
                      </View>
                    </View>
                    <RadioButton value="online" color={colors.primary} />
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <TouchableOpacity
                    style={styles.radioItem}
                    onPress={() => setPaymentMethod('cod')}
                  >
                    <View style={styles.radioContent}>
                      <LinearGradient
                        colors={[colors.success, colors.success + 'CC']}
                        style={styles.radioIcon}
                      >
                        <MaterialCommunityIcons name="cash" size={20} color={colors.white} />
                      </LinearGradient>
                      <View style={styles.radioTextContent}>
                        <Text variant="titleSmall" style={styles.radioTitle}>
                          Cash on Service
                        </Text>
                        <Text variant="bodySmall" style={styles.radioDescription}>
                          Pay the service provider in cash after completion
                        </Text>
                      </View>
                    </View>
                    <RadioButton value="cod" color={colors.primary} />
                  </TouchableOpacity>
                </RadioButton.Group>
              </LinearGradient>
            </View>

            {/* Payment Details Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={[colors.success, colors.success + 'CC']}
                    style={styles.cardIcon}
                  >
                    <MaterialCommunityIcons name="currency-inr" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Payment Details
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text variant="bodyLarge" style={styles.paymentLabel}>Service Charge</Text>
                  <Text variant="bodyLarge" style={styles.paymentValue}>
                    ₹{booking.totalAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.taxRow}>
                  <Text variant="bodySmall" style={styles.taxLabel}>
                    (Including all taxes)
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text variant="titleLarge" style={styles.totalLabel}>
                    Total Amount
                  </Text>
                  <Text variant="titleLarge" style={styles.totalAmount}>
                    ₹{booking.totalAmount.toFixed(2)}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Info Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.info + '15', colors.info + '10']}
                style={styles.infoCardGradient}
              >
                <View style={styles.infoContent}>
                  <MaterialCommunityIcons name="information" size={20} color={colors.info} />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    Your payment is secure and encrypted. We use Razorpay for processing all online payments.
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Bottom Action */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomLeft}>
              <Text variant="labelMedium" style={styles.bottomLabel}>
                Amount to Pay
              </Text>
              <Text variant="headlineSmall" style={styles.bottomAmount}>
                ₹{booking.totalAmount.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayment}
              disabled={processing}
            >
              <LinearGradient
                colors={processing ? [colors.gray[400], colors.gray[500]] : [colors.primary, colors.primaryDark]}
                style={styles.payButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {processing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={paymentMethod === 'online' ? 'credit-card' : 'cash'}
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.payButtonText}>
                      {paymentMethod === 'online' ? 'Pay Now' : 'Confirm'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.gray[300],
    fontSize: 16,
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.gray[400],
    fontSize: 16,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.gray[900],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.gray[600],
    flex: 1,
  },
  summaryValue: {
    color: colors.gray[900],
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  radioContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  radioIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  radioTextContent: {
    flex: 1,
  },
  radioTitle: {
    color: colors.gray[900],
    fontWeight: '700',
    marginBottom: 2,
  },
  radioDescription: {
    color: colors.gray[600],
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginVertical: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  paymentLabel: {
    color: colors.gray[700],
  },
  paymentValue: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  taxRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  taxLabel: {
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: '800',
    color: colors.gray[900],
  },
  totalAmount: {
    fontWeight: '800',
    color: colors.primary,
  },
  infoCardGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  infoContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    color: colors.info,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomLabel: {
    color: colors.gray[600],
    marginBottom: 2,
  },
  bottomAmount: {
    color: colors.primary,
    fontWeight: '800',
  },
  payButton: {
    marginLeft: spacing.md,
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  payButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
