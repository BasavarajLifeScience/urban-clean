import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Searchbar, Card, Button, FAB, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResidentStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { serviceApi, bookingApi } from '../../services/api';
import { Service, Booking } from '../../types';

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
    { name: 'Cleaning', icon: 'broom', color: '#4CAF50' },
    { name: 'Plumbing', icon: 'pipe', color: '#2196F3' },
    { name: 'Electrical', icon: 'lightning-bolt', color: '#FF9800' },
    { name: 'Gardening', icon: 'flower', color: '#8BC34A' },
    { name: 'Painting', icon: 'format-paint', color: '#9C27B0' },
    { name: 'Carpentry', icon: 'hammer', color: '#795548' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load featured services and recent bookings in parallel
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
    const colors: Record<string, string> = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      'in-progress': '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#757575';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.greeting}>
            Welcome back,
          </Text>
          <Text variant="titleLarge" style={styles.userName}>
            {user?.fullName || 'User'}
          </Text>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search services..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Categories */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <Chip
                key={index}
                mode="flat"
                style={[styles.categoryChip, { backgroundColor: category.color + '20' }]}
                textStyle={{ color: category.color }}
                onPress={() => {
                  // Navigate to services screen with category filter
                }}
              >
                {category.name}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Featured Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Featured Services
            </Text>
            <Button mode="text" compact onPress={() => {}}>
              View All
            </Button>
          </View>

          {featuredServices.length > 0 ? (
            featuredServices.map((service) => (
              <Card key={service._id} style={styles.serviceCard}>
                <Card.Content>
                  <Text variant="titleMedium">{service.name}</Text>
                  <Text variant="bodyMedium" style={styles.serviceDescription}>
                    {service.description}
                  </Text>
                  <View style={styles.serviceFooter}>
                    <Text variant="titleSmall" style={styles.price}>
                      ₹{service.basePrice}
                    </Text>
                    {service.averageRating && (
                      <Text variant="bodySmall" style={styles.rating}>
                        ⭐ {service.averageRating.toFixed(1)}
                      </Text>
                    )}
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="contained"
                    onPress={() => {
                      // Navigate to service detail
                    }}
                  >
                    Book Now
                  </Button>
                </Card.Actions>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No services available</Text>
          )}
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Bookings
            </Text>
            <Button mode="text" compact onPress={() => {}}>
              View All
            </Button>
          </View>

          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <Card key={booking._id} style={styles.bookingCard}>
                <Card.Content>
                  <View style={styles.bookingHeader}>
                    <Text variant="titleMedium">Booking #{booking.bookingNumber}</Text>
                    <Chip
                      mode="flat"
                      style={{ backgroundColor: getStatusColor(booking.status) + '20' }}
                      textStyle={{ color: getStatusColor(booking.status) }}
                    >
                      {booking.status}
                    </Chip>
                  </View>
                  <Text variant="bodyMedium" style={styles.bookingDate}>
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </Text>
                  <Text variant="titleSmall" style={styles.bookingAmount}>
                    ₹{booking.totalAmount}
                  </Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No bookings yet</Text>
          )}
        </View>
      </ScrollView>

      {/* FAB for quick booking */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Navigate to services screen
        }}
        label="New Booking"
      />
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
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  greeting: {
    color: '#666666',
  },
  userName: {
    fontWeight: 'bold',
    color: '#333333',
  },
  searchBar: {
    marginHorizontal: 24,
    marginBottom: 16,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  serviceCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    elevation: 2,
  },
  serviceDescription: {
    color: '#666666',
    marginTop: 4,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  rating: {
    color: '#666666',
  },
  bookingCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingDate: {
    color: '#666666',
    marginBottom: 4,
  },
  bookingAmount: {
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});
