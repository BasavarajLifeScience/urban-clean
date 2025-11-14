import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ResidentStackParamList } from '../../navigation/types';
import { bookingApi } from '../../services/api/booking.api';
import { Booking } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

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
    const statusColors: Record<string, string> = {
      pending: colors.warning,
      confirmed: colors.info,
      'in-progress': colors.secondary,
      completed: colors.success,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.gray[500];
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: Record<string, string> = {
      pending: 'clock-outline',
      confirmed: 'check-circle-outline',
      'in-progress': 'progress-clock',
      completed: 'check-all',
      cancelled: 'close-circle-outline',
    };
    return statusIcons[status] || 'information-outline';
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading details...</Text>
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

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canPay = booking.status === 'confirmed' && booking.payment?.status === 'pending';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium, colors.backgroundLight]}
        style={styles.gradient}
        locations={[0, 0.3, 1]}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.cardGradient}
              >
                <View style={styles.headerContent}>
                  <View style={styles.headerIconContainer}>
                    <LinearGradient
                      colors={[getStatusColor(booking.status), getStatusColor(booking.status) + 'CC']}
                      style={styles.headerIcon}
                    >
                      <MaterialCommunityIcons
                        name={getStatusIcon(booking.status) as any}
                        size={32}
                        color={colors.white}
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text variant="labelSmall" style={styles.bookingLabel}>
                      Booking ID
                    </Text>
                    <Text variant="headlineSmall" style={styles.bookingNumber}>
                      #{booking.bookingNumber}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(booking.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: getStatusColor(booking.status) }]}
                      >
                        {booking.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Service Card */}
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
                    <MaterialCommunityIcons name="room-service-outline" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Service Details
                  </Text>
                </View>
                <Text variant="titleLarge" style={styles.serviceName}>
                  {booking.service?.name || 'Service'}
                </Text>
              </LinearGradient>
            </View>

            {/* Schedule Card */}
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
                    <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Schedule
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text variant="labelSmall" style={styles.infoLabel}>
                      Date
                    </Text>
                    <Text variant="bodyLarge" style={styles.infoValue}>
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
                    <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
                    <View style={styles.infoContent}>
                      <Text variant="labelSmall" style={styles.infoLabel}>
                        Time
                      </Text>
                      <Text variant="bodyLarge" style={styles.infoValue}>
                        {booking.scheduledTime}
                      </Text>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Address Card */}
            {booking.address && (
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.secondary, colors.secondaryDark]}
                      style={styles.cardIcon}
                    >
                      <MaterialCommunityIcons name="map-marker" size={20} color={colors.white} />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Service Address
                    </Text>
                  </View>

                  <View style={styles.addressContent}>
                    <Text variant="bodyLarge" style={styles.addressLine}>
                      {booking.address.flatNumber}, {booking.address.building}
                    </Text>
                    <Text variant="bodyMedium" style={styles.addressLine}>
                      {booking.address.area}
                    </Text>
                    {booking.address.landmark && (
                      <Text variant="bodySmall" style={styles.landmarkText}>
                        Near {booking.address.landmark}
                      </Text>
                    )}
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Sevak Card */}
            {booking.sevak && (
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      style={styles.cardIcon}
                    >
                      <MaterialCommunityIcons name="account" size={20} color={colors.white} />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Service Provider
                    </Text>
                  </View>

                  <View style={styles.sevakInfo}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.sevakAvatar}
                    >
                      <MaterialCommunityIcons name="account" size={28} color={colors.white} />
                    </LinearGradient>
                    <View style={styles.sevakDetails}>
                      <Text variant="titleMedium" style={styles.sevakName}>
                        {booking.sevak.fullName}
                      </Text>
                      {booking.sevak.phoneNumber && (
                        <View style={styles.sevakContactRow}>
                          <MaterialCommunityIcons name="phone" size={14} color={colors.gray[600]} />
                          <Text variant="bodyMedium" style={styles.sevakContact}>
                            {booking.sevak.phoneNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Special Instructions */}
            {booking.specialInstructions && (
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.warning, colors.warning + 'CC']}
                      style={styles.cardIcon}
                    >
                      <MaterialCommunityIcons name="note-text" size={20} color={colors.white} />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Special Instructions
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.instructionsText}>
                    {booking.specialInstructions}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Payment Summary Card */}
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
                    Payment Summary
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text variant="bodyLarge" style={styles.paymentLabel}>Service Charge</Text>
                  <Text variant="bodyLarge" style={styles.paymentValue}>₹{booking.totalAmount}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text variant="titleLarge" style={styles.totalLabel}>
                    Total Amount
                  </Text>
                  <Text variant="titleLarge" style={styles.totalAmount}>
                    ₹{booking.totalAmount}
                  </Text>
                </View>

                {booking.payment && (
                  <View
                    style={[
                      styles.paymentStatusBadge,
                      {
                        backgroundColor:
                          booking.payment.status === 'completed'
                            ? colors.success + '20'
                            : colors.warning + '20',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={booking.payment.status === 'completed' ? 'check-circle' : 'clock-outline'}
                      size={16}
                      color={booking.payment.status === 'completed' ? colors.success : colors.warning}
                    />
                    <Text
                      style={[
                        styles.paymentStatusText,
                        {
                          color:
                            booking.payment.status === 'completed' ? colors.success : colors.warning,
                        },
                      ]}
                    >
                      Payment: {booking.payment.status}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Timeline Card */}
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
                    <MaterialCommunityIcons name="timeline-clock" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Timeline
                  </Text>
                </View>

                <View style={styles.timeline}>
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
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
                      <View style={[styles.timelineDot, { backgroundColor: colors.info }]} />
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
                      <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
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
              </LinearGradient>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Action Buttons */}
          {(canCancel || canPay) && (
            <View style={styles.bottomBar}>
              {canCancel && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCancelBooking}
                  disabled={actionLoading}
                >
                  <LinearGradient
                    colors={[colors.error, colors.error + 'CC']}
                    style={styles.actionButtonGradient}
                  >
                    <MaterialCommunityIcons name="close-circle" size={20} color={colors.white} />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {canPay && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    navigation.navigate('Payment', { bookingId: booking._id });
                  }}
                  disabled={actionLoading}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.actionButtonGradient}
                  >
                    <MaterialCommunityIcons name="cash" size={20} color={colors.white} />
                    <Text style={styles.actionButtonText}>Pay Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    marginRight: spacing.md,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  bookingLabel: {
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  bookingNumber: {
    fontWeight: '800',
    color: colors.gray[900],
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
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
  serviceName: {
    color: colors.gray[900],
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.gray[600],
    marginBottom: 2,
  },
  infoValue: {
    color: colors.gray[900],
  },
  addressContent: {
    gap: spacing.xs,
  },
  addressLine: {
    color: colors.gray[900],
  },
  landmarkText: {
    color: colors.gray[600],
  },
  sevakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sevakAvatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sevakDetails: {
    flex: 1,
  },
  sevakName: {
    color: colors.gray[900],
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sevakContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sevakContact: {
    color: colors.gray[700],
  },
  instructionsText: {
    color: colors.gray[700],
    lineHeight: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  paymentLabel: {
    color: colors.gray[700],
  },
  paymentValue: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontWeight: '800',
    color: colors.gray[900],
  },
  totalAmount: {
    fontWeight: '800',
    color: colors.primary,
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  paymentStatusText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  timelineDate: {
    color: colors.gray[600],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    ...shadows.lg,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
