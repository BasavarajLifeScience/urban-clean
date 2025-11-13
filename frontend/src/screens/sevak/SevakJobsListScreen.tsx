import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, ActivityIndicator, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SevakStackParamList } from '../../navigation/types';
import { sevakApi } from '../../services/api';
import { Job } from '../../types';

type SevakJobsListScreenNavigationProp = NativeStackNavigationProp<SevakStackParamList>;

export const SevakJobsListScreen = () => {
  const navigation = useNavigation<SevakJobsListScreenNavigationProp>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [selectedStatus, selectedDate, jobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await sevakApi.getJobs({});

      if (response.success && response.data) {
        const jobsList = response.data.jobs || [];
        setJobs(jobsList);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((j) => j.status === selectedStatus);
    }

    // Filter by date
    if (selectedDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter((j) => j.scheduledDate.split('T')[0] === today);
    } else if (selectedDate === 'upcoming') {
      const today = new Date();
      filtered = filtered.filter((j) => new Date(j.scheduledDate) > today);
    }

    setFilteredJobs(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
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

  const renderJobCard = ({ item }: { item: Job }) => (
    <Card
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text variant="labelSmall" style={styles.jobNumber}>
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
              {item.address.area}
            </Text>
          </View>
        )}

        {item.resident && (
          <View style={styles.infoRow}>
            <Text style={styles.icon}>👤</Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              {item.resident.fullName}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text variant="titleMedium" style={styles.amount}>
            ₹{item.totalAmount}
          </Text>
          {item.status === 'confirmed' && (
            <Chip mode="flat" style={styles.actionChip} textStyle={{ color: '#FFFFFF' }}>
              Ready to Start
            </Chip>
          )}
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
          My Jobs
        </Text>

        {/* Date Filter */}
        <SegmentedButtons
          value={selectedDate}
          onValueChange={setSelectedDate}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'today', label: 'Today' },
            { value: 'upcoming', label: 'Upcoming' },
          ]}
          style={styles.segmentedButtons}
        />

        {/* Status Filter */}
        <SegmentedButtons
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'confirmed', label: 'Active' },
            { value: 'completed', label: 'Done' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={filteredJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="displaySmall" style={styles.emptyIcon}>
              📋
            </Text>
            <Text variant="titleLarge" style={styles.emptyText}>
              No jobs found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {selectedStatus === 'all'
                ? 'No jobs assigned yet'
                : `No ${getStatusLabel(selectedStatus).toLowerCase()} jobs`}
            </Text>
          </View>
        }
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
    marginBottom: 12,
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
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
  jobNumber: {
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
  amount: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  actionChip: {
    backgroundColor: '#4CAF50',
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
});
