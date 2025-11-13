import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, RadioButton, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResidentStackParamList } from '../../navigation/types';
import { bookingApi, paymentApi } from '../../services/api';
import { Booking } from '../../types';

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium">Booking not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Booking Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Booking Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">Booking ID</Text>
              <Text variant="bodyLarge" style={styles.summaryValue}>
                #{booking.bookingNumber}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">Service</Text>
              <Text variant="bodyLarge" style={styles.summaryValue}>
                {booking.service?.name}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">Date</Text>
              <Text variant="bodyLarge" style={styles.summaryValue}>
                {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>

            {booking.scheduledTime && (
              <View style={styles.summaryRow}>
                <Text variant="bodyLarge">Time</Text>
                <Text variant="bodyLarge" style={styles.summaryValue}>
                  {booking.scheduledTime}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Payment Method */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Payment Method
            </Text>

            <RadioButton.Group onValueChange={(value) => setPaymentMethod(value as 'online' | 'cod')} value={paymentMethod}>
              <View style={styles.radioItem}>
                <View style={styles.radioContent}>
                  <Text variant="titleSmall">💳 Online Payment (Razorpay)</Text>
                  <Text variant="bodySmall" style={styles.radioDescription}>
                    Pay securely using UPI, Cards, Net Banking, or Wallets
                  </Text>
                </View>
                <RadioButton value="online" />
              </View>

              <Divider style={styles.divider} />

              <View style={styles.radioItem}>
                <View style={styles.radioContent}>
                  <Text variant="titleSmall">💵 Cash on Service</Text>
                  <Text variant="bodySmall" style={styles.radioDescription}>
                    Pay the service provider in cash after completion
                  </Text>
                </View>
                <RadioButton value="cod" />
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Payment Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Payment Details
            </Text>

            <View style={styles.paymentRow}>
              <Text variant="bodyLarge">Service Charge</Text>
              <Text variant="bodyLarge">₹{booking.totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text variant="bodyMedium" style={styles.taxLabel}>
                (Including all taxes)
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Total Amount
              </Text>
              <Text variant="titleLarge" style={styles.totalAmount}>
                ₹{booking.totalAmount.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.infoText}>
              ℹ️ Your payment is secure and encrypted. We use Razorpay for processing all online payments.
            </Text>
          </Card.Content>
        </Card>
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
        <Button
          mode="contained"
          onPress={handlePayment}
          disabled={processing}
          style={styles.payButton}
          contentStyle={styles.payButtonContent}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : paymentMethod === 'online' ? (
            'Pay Now'
          ) : (
            'Confirm'
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#333333',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  radioContent: {
    flex: 1,
    marginRight: 12,
  },
  radioDescription: {
    color: '#666666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taxLabel: {
    color: '#999999',
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#333333',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    elevation: 0,
  },
  infoText: {
    color: '#1565C0',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomLabel: {
    color: '#666666',
    marginBottom: 4,
  },
  bottomAmount: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  payButton: {
    marginLeft: 16,
  },
  payButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
});
