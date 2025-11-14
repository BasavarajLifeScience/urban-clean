import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { vendorApi, VendorDashboard } from '../../services/api/vendor.api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export const VendorDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<VendorDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setError(null);
      const response = await vendorApi.getDashboard();

      if (response.success && response.data) {
        setDashboard(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('❌ [VendorDashboard] Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadDashboard} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { statistics, recentBookings, activeServices } = dashboard;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineSmall" style={styles.greeting}>
              Vendor Dashboard
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Manage your services and orders
            </Text>
          </View>
          <MaterialCommunityIcons name="storefront" size={40} color={colors.white} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Card.Content>
              <MaterialCommunityIcons name="room-service" size={32} color={colors.white} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {statistics.totalServices}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Services
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.success }]}>
            <Card.Content>
              <MaterialCommunityIcons name="calendar-check" size={32} color={colors.white} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {statistics.totalBookings}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Bookings
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.warning }]}>
            <Card.Content>
              <MaterialCommunityIcons name="clock-outline" size={32} color={colors.white} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {statistics.pendingBookings}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pending Orders
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.info }]}>
            <Card.Content>
              <MaterialCommunityIcons name="calendar-today" size={32} color={colors.white} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {statistics.todayBookings}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Today's Orders
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Revenue Cards */}
        <Card style={styles.revenueCard}>
          <Card.Content>
            <View style={styles.revenueHeader}>
              <MaterialCommunityIcons name="currency-inr" size={24} color={colors.primary} />
              <Text variant="titleMedium" style={styles.revenueTitle}>
                Total Revenue
              </Text>
            </View>
            <Text variant="displaySmall" style={styles.revenueAmount}>
              ₹{statistics.totalRevenue.toLocaleString()}
            </Text>
            <View style={styles.revenueDivider} />
            <View style={styles.monthRevenueRow}>
              <Text variant="bodyMedium" style={styles.monthRevenueLabel}>
                This Month
              </Text>
              <Text variant="titleLarge" style={styles.monthRevenueAmount}>
                ₹{statistics.monthRevenue.toLocaleString()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Rating Card */}
        <Card style={styles.ratingCard}>
          <Card.Content>
            <View style={styles.ratingHeader}>
              <MaterialCommunityIcons name="star" size={24} color={colors.warning} />
              <Text variant="titleMedium" style={styles.ratingTitle}>
                Average Rating
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Text variant="displaySmall" style={styles.ratingValue}>
                {statistics.averageRating.toFixed(1)}
              </Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialCommunityIcons
                    key={star}
                    name={star <= Math.round(statistics.averageRating) ? 'star' : 'star-outline'}
                    size={24}
                    color={colors.warning}
                  />
                ))}
              </View>
            </View>
            <Text variant="bodySmall" style={styles.ratingCount}>
              Based on {statistics.totalRatings} ratings
            </Text>
          </Card.Content>
        </Card>

        {/* Recent Bookings */}
        {recentBookings && recentBookings.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Recent Bookings
              </Text>
            </View>

            {recentBookings.map((booking) => (
              <Card key={booking._id} style={styles.bookingCard}>
                <Card.Content>
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingInfo}>
                      <Text variant="titleMedium" style={styles.bookingService}>
                        {booking.serviceId?.name || 'Service'}
                      </Text>
                      <Text variant="bodySmall" style={styles.bookingNumber}>
                        #{booking.bookingNumber}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(booking.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingDetails}>
                    <View style={styles.bookingDetailRow}>
                      <MaterialCommunityIcons name="account" size={16} color={colors.gray[600]} />
                      <Text variant="bodySmall" style={styles.bookingDetailText}>
                        {booking.residentId?.fullName || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.bookingDetailRow}>
                      <MaterialCommunityIcons name="calendar" size={16} color={colors.gray[600]} />
                      <Text variant="bodySmall" style={styles.bookingDetailText}>
                        {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                      </Text>
                    </View>
                    <View style={styles.bookingDetailRow}>
                      <MaterialCommunityIcons name="currency-inr" size={16} color={colors.gray[600]} />
                      <Text variant="bodySmall" style={styles.bookingDetailText}>
                        ₹{booking.totalAmount}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'assigned':
      return colors.info;
    case 'in-progress':
      return colors.primary;
    case 'completed':
      return colors.success;
    case 'cancelled':
      return colors.error;
    default:
      return colors.gray[500];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.gray[600],
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: colors.white,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.gray[300],
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  statValue: {
    color: colors.white,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  statLabel: {
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xxs,
  },
  revenueCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  revenueTitle: {
    marginLeft: spacing.sm,
    color: colors.gray[800],
    fontWeight: '600',
  },
  revenueAmount: {
    color: colors.primary,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  revenueDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginBottom: spacing.md,
  },
  monthRevenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthRevenueLabel: {
    color: colors.gray[600],
  },
  monthRevenueAmount: {
    color: colors.gray[800],
    fontWeight: '700',
  },
  ratingCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingTitle: {
    marginLeft: spacing.sm,
    color: colors.gray[800],
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingValue: {
    color: colors.gray[900],
    fontWeight: '800',
    marginRight: spacing.md,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingCount: {
    color: colors.gray[600],
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.gray[800],
    fontWeight: '700',
  },
  bookingCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingService: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  bookingNumber: {
    color: colors.gray[600],
    marginTop: spacing.xxs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    gap: spacing.xs,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDetailText: {
    marginLeft: spacing.xs,
    color: colors.gray[700],
  },
});
