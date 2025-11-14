import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Card, Button, FAB, Chip, ActivityIndicator, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ResidentStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { serviceApi } from '../../services/api/service.api';
import { bookingApi } from '../../services/api/booking.api';
import { Service, Booking } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type ResidentHomeScreenNavigationProp = NativeStackNavigationProp<ResidentStackParamList>;

export const ResidentHomeScreen = () => {
  const navigation = useNavigation<ResidentHomeScreenNavigationProp>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { name: 'Cleaning', icon: 'broom', gradient: [colors.primary, colors.primaryDark] },
    { name: 'Plumbing', icon: 'pipe-wrench', gradient: [colors.info, '#1e40af'] },
    { name: 'Electrical', icon: 'lightning-bolt', gradient: [colors.warning, '#c2410c'] },
    { name: 'Gardening', icon: 'flower', gradient: [colors.success, '#047857'] },
    { name: 'Painting', icon: 'format-paint', gradient: [colors.secondary, colors.secondaryDark] },
    { name: 'Carpentry', icon: 'hammer-wrench', gradient: [colors.accent, colors.accentDark] },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesResponse, bookingsResponse] = await Promise.all([
        serviceApi.getServices({ limit: 5 }),
        bookingApi.getMyBookings({ limit: 3 }),
      ]);

      if (servicesResponse.success) {
        setFeaturedServices(servicesResponse.data as Service[]);
      }

      if (bookingsResponse.success) {
        setRecentBookings(bookingsResponse.data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
        <Text style={styles.loadingText}>Loading...</Text>
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {/* Modern Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View>
                  <Text variant="bodyMedium" style={styles.greeting}>
                    Welcome back,
                  </Text>
                  <Text variant="headlineMedium" style={styles.userName}>
                    {user?.fullName || 'User'}
                  </Text>
                </View>
                <TouchableOpacity>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.avatarGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name="account"
                      size={28}
                      color={colors.white}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Modern Search Bar */}
              <View style={styles.searchContainer}>
                <Searchbar
                  placeholder="Search for services..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={styles.searchBar}
                  inputStyle={styles.searchInput}
                  iconColor={colors.primary}
                  placeholderTextColor={colors.gray[500]}
                  elevation={0}
                />
              </View>
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Categories
                </Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {categories.map((category, index) => (
                  <TouchableOpacity key={index} style={styles.categoryCard}>
                    <LinearGradient
                      colors={category.gradient}
                      style={styles.categoryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name={category.icon as any}
                        size={28}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <Text variant="bodyMedium" style={styles.categoryName}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Featured Services */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Featured Services
                </Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>

              {featuredServices.length > 0 ? (
                featuredServices.map((service) => (
                  <TouchableOpacity key={service._id} style={styles.serviceCard}>
                    <LinearGradient
                      colors={[colors.white, colors.gray[50]]}
                      style={styles.serviceCardGradient}
                    >
                      <View style={styles.serviceCardContent}>
                        <LinearGradient
                          colors={[colors.primary, colors.primaryDark]}
                          style={styles.serviceIcon}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <MaterialCommunityIcons
                            name="room-service-outline"
                            size={24}
                            color={colors.white}
                          />
                        </LinearGradient>
                        <View style={styles.serviceInfo}>
                          <Text variant="titleMedium" style={styles.serviceName}>
                            {service.name}
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={styles.serviceDescription}
                            numberOfLines={2}
                          >
                            {service.description}
                          </Text>
                          <View style={styles.serviceFooter}>
                            <View style={styles.priceContainer}>
                              <Text style={styles.priceLabel}>Starting at</Text>
                              <Text variant="titleMedium" style={styles.price}>
                                ₹{service.basePrice}
                              </Text>
                            </View>
                            {service.averageRating && (
                              <View style={styles.ratingContainer}>
                                <MaterialCommunityIcons
                                  name="star"
                                  size={16}
                                  color={colors.warning}
                                />
                                <Text variant="bodySmall" style={styles.rating}>
                                  {service.averageRating.toFixed(1)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.bookButton}
                          onPress={() => {
                            // Navigate to service detail
                          }}
                        >
                          <LinearGradient
                            colors={[colors.primary, colors.primaryDark]}
                            style={styles.bookButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <MaterialCommunityIcons
                              name="arrow-right"
                              size={20}
                              color={colors.white}
                            />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={48}
                    color={colors.gray[400]}
                  />
                  <Text style={styles.emptyText}>No services available</Text>
                </View>
              )}
            </View>

            {/* Recent Bookings */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Recent Bookings
                </Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>

              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <TouchableOpacity key={booking._id} style={styles.bookingCard}>
                    <LinearGradient
                      colors={[colors.white, colors.gray[50]]}
                      style={styles.bookingCardGradient}
                    >
                      <View style={styles.bookingCardContent}>
                        <View style={styles.bookingIconContainer}>
                          <LinearGradient
                            colors={[getStatusColor(booking.status), getStatusColor(booking.status) + 'CC']}
                            style={styles.bookingIconGradient}
                          >
                            <MaterialCommunityIcons
                              name={getStatusIcon(booking.status) as any}
                              size={24}
                              color={colors.white}
                            />
                          </LinearGradient>
                        </View>
                        <View style={styles.bookingInfo}>
                          <View style={styles.bookingHeader}>
                            <Text variant="titleMedium" style={styles.bookingNumber}>
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
                          <View style={styles.bookingDetails}>
                            <View style={styles.bookingDetailItem}>
                              <MaterialCommunityIcons
                                name="calendar"
                                size={14}
                                color={colors.gray[600]}
                              />
                              <Text variant="bodySmall" style={styles.bookingDate}>
                                {new Date(booking.scheduledDate).toLocaleDateString()}
                              </Text>
                            </View>
                            <View style={styles.bookingDetailItem}>
                              <MaterialCommunityIcons
                                name="currency-inr"
                                size={14}
                                color={colors.primary}
                              />
                              <Text variant="titleSmall" style={styles.bookingAmount}>
                                {booking.totalAmount}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="calendar-blank"
                    size={48}
                    color={colors.gray[400]}
                  />
                  <Text style={styles.emptyText}>No bookings yet</Text>
                  <Text style={styles.emptySubtext}>Start booking services to see them here</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Modern FAB */}
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.fab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.fabTouchable}
              onPress={() => {
                // Navigate to services screen
              }}
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
              <Text style={styles.fabLabel}>New Booking</Text>
            </TouchableOpacity>
          </LinearGradient>
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
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.gray[400],
    marginBottom: spacing.xs,
  },
  userName: {
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  searchContainer: {
    marginTop: spacing.md,
  },
  searchBar: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  searchInput: {
    color: colors.gray[900],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.gray[900],
    letterSpacing: -0.2,
  },
  viewAllLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  categoryGradient: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  categoryName: {
    color: colors.gray[700],
    fontWeight: '600',
    fontSize: 12,
  },
  serviceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  serviceCardGradient: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  serviceCardContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 10,
    color: colors.gray[500],
    marginBottom: 2,
  },
  price: {
    color: colors.primary,
    fontWeight: '800',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  rating: {
    color: colors.gray[700],
    marginLeft: 4,
    fontWeight: '600',
  },
  bookButton: {
    marginLeft: spacing.sm,
  },
  bookButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingCard: {
    marginHorizontal: spacing.lg,
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
    marginBottom: spacing.sm,
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
  bookingDetails: {
    flexDirection: 'row',
    gap: spacing.md,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.gray[600],
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.gray[500],
    marginTop: spacing.xs,
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  fabTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  fabLabel: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
