import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ResidentStackParamList, ResidentTabParamList } from '../../navigation/types';
import { bookingApi } from '../../services/api/booking.api';
import { Booking } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type MyBookingsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ResidentTabParamList, 'Bookings'>,
  NativeStackNavigationProp<ResidentStackParamList>
>;

export const MyBookingsScreen = () => {
  const navigation = useNavigation<MyBookingsScreenNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const statusFilters = [
    { value: 'all', label: 'All', icon: 'format-list-bulleted' },
    { value: 'pending', label: 'Pending', icon: 'clock-outline' },
    { value: 'confirmed', label: 'Confirmed', icon: 'check-circle-outline' },
    { value: 'completed', label: 'Completed', icon: 'check-all' },
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  // Reload bookings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [MyBookingsScreen] Screen focused - Reloading bookings');
      loadBookings();
    }, [])
  );

  useEffect(() => {
    filterBookings();
  }, [selectedStatus, bookings]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log('📋 [MyBookingsScreen] Loading bookings...');
      const response = await bookingApi.getMyBookings({});
      console.log('📥 [MyBookingsScreen] Response:', response);

      if (response.success && response.data) {
        const bookingsList = response.data.bookings || response.data.data || response.data || [];
        console.log('✅ [MyBookingsScreen] Bookings loaded:', bookingsList.length);
        console.log('📋 [MyBookingsScreen] First booking:', bookingsList[0]);
        setBookings(bookingsList);
      }
    } catch (error: any) {
      console.error('❌ [MyBookingsScreen] Error loading bookings:', error);
      console.error('❌ [MyBookingsScreen] Error details:', {
        message: error.message,
        response: error.response?.data,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterBookings = () => {
    if (selectedStatus === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === selectedStatus));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
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

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}
    >
      <LinearGradient
        colors={[colors.white, colors.gray[50]]}
        style={styles.bookingCardGradient}
      >
        <View style={styles.bookingCardContent}>
          <View style={styles.bookingIconContainer}>
            <LinearGradient
              colors={[getStatusColor(item.status), getStatusColor(item.status) + 'CC']}
              style={styles.bookingIconGradient}
            >
              <MaterialCommunityIcons
                name={getStatusIcon(item.status) as any}
                size={24}
                color={colors.white}
              />
            </LinearGradient>
          </View>

          <View style={styles.bookingInfo}>
            <View style={styles.bookingHeader}>
              <Text variant="titleMedium" style={styles.bookingNumber}>
                #{item.bookingNumber}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '20' },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: getStatusColor(item.status) }]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.serviceName} numberOfLines={1}>
              {typeof item.serviceId === 'object' ? item.serviceId.name : 'Service'}
            </Text>

            <View style={styles.bookingDetails}>
              <View style={styles.bookingDetailItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={colors.gray[600]}
                />
                <Text variant="bodySmall" style={styles.bookingDate}>
                  {new Date(item.scheduledDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              {item.scheduledTime && (
                <View style={styles.bookingDetailItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={colors.gray[600]}
                  />
                  <Text variant="bodySmall" style={styles.bookingDate}>
                    {item.scheduledTime}
                  </Text>
                </View>
              )}

              <View style={styles.bookingDetailItem}>
                <MaterialCommunityIcons
                  name="currency-inr"
                  size={14}
                  color={colors.primary}
                />
                <Text variant="titleSmall" style={styles.bookingAmount}>
                  {item.totalAmount}
                </Text>
              </View>
            </View>

            {item.address && (
              <View style={styles.addressRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color={colors.gray[500]}
                />
                <Text variant="bodySmall" style={styles.addressText} numberOfLines={1}>
                  {item.address.flatNumber}, {item.address.building}, {item.address.area}
                </Text>
              </View>
            )}
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.gray[400]}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
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
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              My Bookings
            </Text>

            {/* Status Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContainer}
            >
              {statusFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  onPress={() => setSelectedStatus(filter.value)}
                  style={styles.filterPillTouchable}
                >
                  <LinearGradient
                    colors={
                      selectedStatus === filter.value
                        ? [colors.primary, colors.primaryDark]
                        : [colors.white, colors.gray[100]]
                    }
                    style={styles.filterPill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name={filter.icon as any}
                      size={16}
                      color={selectedStatus === filter.value ? colors.white : colors.gray[600]}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        selectedStatus === filter.value && styles.filterTextSelected,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredBookings}
            renderItem={renderBookingCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={64}
                  color={colors.gray[400]}
                />
                <Text variant="titleLarge" style={styles.emptyText}>
                  No bookings found
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  {selectedStatus === 'all'
                    ? "You haven't made any bookings yet"
                    : `No ${selectedStatus} bookings`}
                </Text>
              </View>
            }
          />

          {/* FAB */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              console.log('➕ [MyBookingsScreen] FAB clicked - Navigating to Services');
              navigation.navigate('Services');
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
              <Text style={styles.fabLabel}>New Booking</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterPillTouchable: {
    marginRight: spacing.xs,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.sm,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
  },
  filterTextSelected: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  bookingCardGradient: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  bookingCardContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  bookingIconContainer: {
    marginRight: spacing.md,
  },
  bookingIconGradient: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bookingNumber: {
    fontWeight: '700',
    color: colors.gray[900],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  serviceName: {
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  bookingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingDate: {
    color: colors.gray[600],
  },
  bookingAmount: {
    color: colors.primary,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    flex: 1,
    color: colors.gray[500],
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.gray[600],
    marginTop: spacing.md,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.gray[500],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.lg,
  },
  fabLabel: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
