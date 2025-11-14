import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SevakStackParamList } from '../../navigation/types';
import { sevakApi } from '../../services/api';
import { Job } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

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
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
    >
      <LinearGradient
        colors={[colors.white, colors.gray[50]]}
        style={styles.jobCardGradient}
      >
        <View style={styles.jobCardContent}>
          <LinearGradient
            colors={[getStatusColor(item.status), getStatusColor(item.status) + 'CC']}
            style={styles.jobIconGradient}
          >
            <MaterialCommunityIcons
              name={getStatusIcon(item.status) as any}
              size={28}
              color={colors.white}
            />
          </LinearGradient>
          <View style={styles.jobInfo}>
            <View style={styles.jobHeader}>
              <View style={styles.jobHeaderLeft}>
                <Text variant="labelSmall" style={styles.jobNumber}>
                  #{item.bookingNumber}
                </Text>
                <Text variant="titleMedium" style={styles.serviceName}>
                  {item.service?.name || 'Service'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <View style={styles.jobDetails}>
              <View style={styles.jobDetailItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={colors.gray[600]}
                />
                <Text variant="bodySmall" style={styles.detailText}>
                  {new Date(item.scheduledDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              {item.scheduledTime && (
                <View style={styles.jobDetailItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={colors.gray[600]}
                  />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {item.scheduledTime}
                  </Text>
                </View>
              )}
            </View>

            {item.address && (
              <View style={styles.addressRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color={colors.gray[600]}
                />
                <Text variant="bodySmall" style={styles.addressText} numberOfLines={1}>
                  {item.address.area}
                </Text>
              </View>
            )}

            {item.resident && (
              <View style={styles.residentRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={14}
                  color={colors.gray[600]}
                />
                <Text variant="bodySmall" style={styles.residentText}>
                  {item.resident.fullName}
                </Text>
              </View>
            )}

            <View style={styles.jobFooter}>
              <Text variant="titleLarge" style={styles.amount}>
                ₹{item.totalAmount}
              </Text>
              {item.status === 'confirmed' && (
                <View style={styles.readyChip}>
                  <MaterialCommunityIcons
                    name="play-circle"
                    size={14}
                    color={colors.success}
                  />
                  <Text style={styles.readyText}>Ready to Start</Text>
                </View>
              )}
            </View>
          </View>
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
        <Text style={styles.loadingText}>Loading jobs...</Text>
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
          {/* Header with Filters */}
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              My Jobs
            </Text>

            {/* Date Filter */}
            <View style={styles.filterContainer}>
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
            </View>

            {/* Status Filter */}
            <View style={styles.filterContainer}>
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
          </View>

          <FlatList
            data={filteredJobs}
            renderItem={renderJobCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
                  name="briefcase-outline"
                  size={64}
                  color={colors.gray[400]}
                />
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
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.md,
  },
  title: {
    fontWeight: '800',
    color: colors.gray[900],
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  filterContainer: {
    marginBottom: spacing.sm,
  },
  segmentedButtons: {
    backgroundColor: colors.gray[50],
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  jobCard: {
    marginBottom: spacing.md,
  },
  jobCardGradient: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  jobCardContent: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  jobIconGradient: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  jobInfo: {
    flex: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  jobHeaderLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  jobNumber: {
    color: colors.gray[500],
    marginBottom: 2,
  },
  serviceName: {
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
  jobDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: colors.gray[600],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  addressText: {
    flex: 1,
    color: colors.gray[600],
  },
  residentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  residentText: {
    color: colors.gray[600],
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  amount: {
    color: colors.primary,
    fontWeight: '800',
  },
  readyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  readyText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.gray[600],
    marginTop: spacing.lg,
    fontWeight: '700',
  },
  emptySubtext: {
    color: colors.gray[500],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
