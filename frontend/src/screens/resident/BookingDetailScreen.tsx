import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Chip, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResidentStackParamList } from '../../navigation/types';
import { bookingApi } from '../../services/api';
import { Booking } from '../../types';

type BookingDetailScreenRouteProp = RouteProp<ResidentStackParamList, 'BookingDetail'>;
type BookingDetailScreenNavigationProp = NativeStackNavigationProp<ResidentStackParamList, 'BookingDetail'>;

export const BookingDetailScreen = () => {
  const route = useRoute<BookingDetailScreenRouteProp>();
  const navigation = useNavigation<BookingDetailScreenNavigationProp>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookingDetail();
  }, [bookingId]);

  const loadBookingDetail = async () => {
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

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await bookingApi.cancelBooking(bookingId, {
                reason: 'Cancelled by user',
              });
              Alert.alert('Success', 'Booking cancelled successfully');
              loadBookingDetail();
            } catch (error) {
              Alert.alert('Error', 'Unable to cancel booking');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      'in-progress': '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
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

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canPay = booking.status === 'confirmed' && booking.payment?.status === 'pending';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerTop}>
              <View>
                <Text variant="labelSmall" style={styles.bookingNumber}>
                  Booking #{booking.bookingNumber}
                </Text>
                <Text variant="headlineSmall" style={styles.serviceName}>
                  {booking.service?.name || 'Service'}
                </Text>
              </View>
              <Chip
                mode="flat"
                style={{ backgroundColor: getStatusColor(booking.status) + '20' }}
                textStyle={{ color: getStatusColor(booking.status), fontWeight: '600' }}
              >
                {getStatusLabel(booking.status)}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Schedule */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Schedule
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.icon}>📅</Text>
              <View style={styles.infoContent}>
                <Text variant="labelSmall" style={styles.infoLabel}>
                  Date
                </Text>
                <Text variant="bodyLarge">
                  {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            {booking.scheduledTime && (
              <View style={styles.infoRow}>
                <Text style={styles.icon}>🕐</Text>
                <View style={styles.infoContent}>
                  <Text variant="labelSmall" style={styles.infoLabel}>
                    Time
                  </Text>
                  <Text variant="bodyLarge">{booking.scheduledTime}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Address */}
        {booking.address && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Service Address
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.icon}>📍</Text>
                <View style={styles.infoContent}>
                  <Text variant="bodyLarge">
                    {booking.address.flatNumber}, {booking.address.building}
                  </Text>
                  <Text variant="bodyMedium" style={styles.addressText}>
                    {booking.address.area}
                  </Text>
                  {booking.address.landmark && (
                    <Text variant="bodySmall" style={styles.landmarkText}>
                      Near {booking.address.landmark}
                    </Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Sevak Info */}
        {booking.sevak && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Service Provider
              </Text>
              <View style={styles.sevakInfo}>
                <View style={styles.sevakAvatar}>
                  <Text variant="headlineSmall">👤</Text>
                </View>
                <View style={styles.sevakDetails}>
                  <Text variant="titleMedium">{booking.sevak.fullName}</Text>
                  {booking.sevak.phoneNumber && (
                    <Text variant="bodyMedium" style={styles.sevakContact}>
                      📞 {booking.sevak.phoneNumber}
                    </Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Special Instructions
              </Text>
              <Text variant="bodyMedium" style={styles.instructionsText}>
                {booking.specialInstructions}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Payment Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Payment Summary
            </Text>

            <View style={styles.paymentRow}>
              <Text variant="bodyLarge">Service Charge</Text>
              <Text variant="bodyLarge">₹{booking.totalAmount}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Total Amount
              </Text>
              <Text variant="titleLarge" style={styles.totalAmount}>
                ₹{booking.totalAmount}
              </Text>
            </View>

            {booking.payment && (
              <Chip
                mode="flat"
                style={{
                  backgroundColor:
                    booking.payment.status === 'completed' ? '#4CAF50' : '#FF9800',
                  alignSelf: 'flex-start',
                  marginTop: 12,
                }}
                textStyle={{ color: '#FFFFFF' }}
              >
                Payment: {booking.payment.status}
              </Chip>
            )}
          </Card.Content>
        </Card>

        {/* Timeline */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Timeline
            </Text>

            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text variant="bodyMedium" style={styles.timelineLabel}>
                    Booking Created
                  </Text>
                  <Text variant="bodySmall" style={styles.timelineDate}>
                    {new Date(booking.createdAt).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {booking.confirmedAt && (
                <View style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text variant="bodyMedium" style={styles.timelineLabel}>
                      Confirmed
                    </Text>
                    <Text variant="bodySmall" style={styles.timelineDate}>
                      {new Date(booking.confirmedAt).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              )}

              {booking.completedAt && (
                <View style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text variant="bodyMedium" style={styles.timelineLabel}>
                      Completed
                    </Text>
                    <Text variant="bodySmall" style={styles.timelineDate}>
                      {new Date(booking.completedAt).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      {(canCancel || canPay) && (
        <View style={styles.bottomBar}>
          {canCancel && (
            <Button
              mode="outlined"
              onPress={handleCancelBooking}
              style={styles.actionButton}
              disabled={actionLoading}
            >
              Cancel Booking
            </Button>
          )}
          {canPay && (
            <Button
              mode="contained"
              onPress={() => {
                navigation.navigate('Payment', { bookingId: booking._id });
              }}
              style={styles.actionButton}
              disabled={actionLoading}
            >
              Pay Now
            </Button>
          )}
        </View>
      )}
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
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingNumber: {
    color: '#999999',
    marginBottom: 4,
  },
  serviceName: {
    fontWeight: 'bold',
    color: '#333333',
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#999999',
    marginBottom: 4,
  },
  addressText: {
    color: '#666666',
    marginTop: 4,
  },
  landmarkText: {
    color: '#999999',
    marginTop: 2,
  },
  sevakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sevakAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sevakDetails: {
    flex: 1,
  },
  sevakContact: {
    color: '#666666',
    marginTop: 4,
  },
  instructionsText: {
    color: '#666666',
    lineHeight: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#333333',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  timelineDate: {
    color: '#999999',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flex: 1,
  },
});
