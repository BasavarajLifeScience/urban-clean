import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, ActivityIndicator, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResidentStackParamList } from '../../navigation/types';
import { bookingApi } from '../../services/api';
import { Booking } from '../../types';

type MyBookingsScreenNavigationProp = NativeStackNavigationProp<ResidentStackParamList>;

export const MyBookingsScreen = () => {
  const navigation = useNavigation<MyBookingsScreenNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [selectedStatus, bookings]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getMyBookings({});

      if (response.success && response.data) {
        const bookingsList = response.data.bookings || [];
        setBookings(bookingsList);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
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

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <Card
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text variant="labelSmall" style={styles.bookingNumber}>
              #{item.bookingNumber}
            </Text>
            <Text variant="titleMedium" style={styles.serviceName}>
              {item.service?.name || 'Service'}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={{ backgroundColor: getStatusColor(item.status) + '20' }}
            textStyle={{ color: getStatusColor(item.status), fontWeight: '600' }}
          >
            {getStatusLabel(item.status)}
          </Chip>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>📅</Text>
          <Text variant="bodyMedium" style={styles.infoText}>
            {new Date(item.scheduledDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {item.scheduledTime && (
          <View style={styles.infoRow}>
            <Text style={styles.icon}>🕐</Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              {item.scheduledTime}
            </Text>
          </View>
        )}

        {item.address && (
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📍</Text>
            <Text variant="bodyMedium" style={styles.infoText} numberOfLines={1}>
              {item.address.flatNumber}, {item.address.building}, {item.address.area}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View>
            {item.sevak && (
              <Text variant="bodySmall" style={styles.sevakLabel}>
                Assigned to: {item.sevak.fullName}
              </Text>
            )}
          </View>
          <Text variant="titleMedium" style={styles.amount}>
            ₹{item.totalAmount}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          My Bookings
        </Text>

        <SegmentedButtons
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'completed', label: 'Completed' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="displaySmall" style={styles.emptyIcon}>
              📋
            </Text>
            <Text variant="titleLarge" style={styles.emptyText}>
              No bookings found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {selectedStatus === 'all'
                ? "You haven't made any bookings yet"
                : `No ${getStatusLabel(selectedStatus).toLowerCase()} bookings`}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="New Booking"
        style={styles.fab}
        onPress={() => {
          // Navigate to services screen to book
          navigation.navigate('ResidentTabs', { screen: 'Services' } as any);
        }}
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  bookingNumber: {
    color: '#999999',
    marginBottom: 4,
  },
  serviceName: {
    fontWeight: '600',
    color: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    flex: 1,
    color: '#666666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sevakLabel: {
    color: '#666666',
  },
  amount: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#666666',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#999999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});
