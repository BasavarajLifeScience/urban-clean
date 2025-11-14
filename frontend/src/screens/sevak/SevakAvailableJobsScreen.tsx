import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SevakStackParamList } from '../../navigation/types';
import { sevakApi } from '../../services/api/sevak.api';
import { Job } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type SevakAvailableJobsScreenNavigationProp = NativeStackNavigationProp<SevakStackParamList>;

export const SevakAvailableJobsScreen = () => {
  const navigation = useNavigation<SevakAvailableJobsScreenNavigationProp>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableJobs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [SevakAvailableJobsScreen] Screen focused - Reloading jobs');
      loadAvailableJobs();
    }, [])
  );

  const loadAvailableJobs = async () => {
    try {
      setLoading(true);
      console.log('📋 [SevakAvailableJobsScreen] Loading available jobs...');
      const response = await sevakApi.getAvailableJobs({ limit: 50 });
      console.log('📥 [SevakAvailableJobsScreen] Response:', response);

      if (response.success && response.data) {
        const jobsList = response.data.jobs || [];
        console.log('✅ [SevakAvailableJobsScreen] Jobs loaded:', jobsList.length);
        setJobs(jobsList);
      }
    } catch (error: any) {
      console.error('❌ [SevakAvailableJobsScreen] Error loading jobs:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Unable to load available jobs'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    Alert.alert(
      'Accept Job',
      'Are you sure you want to accept this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setAcceptingJobId(jobId);
              console.log('🎯 [SevakAvailableJobsScreen] Accepting job:', jobId);

              const response = await sevakApi.acceptJob(jobId);
              console.log('✅ [SevakAvailableJobsScreen] Job accepted:', response);

              Alert.alert('Success', 'Job accepted successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to JobDetail or refresh the list
                    loadAvailableJobs();
                  },
                },
              ]);
            } catch (error: any) {
              console.error('❌ [SevakAvailableJobsScreen] Accept failed:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || error.message || 'Unable to accept job'
              );
            } finally {
              setAcceptingJobId(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAvailableJobs();
  };

  const renderJobCard = ({ item }: { item: Job }) => {
    const isAccepting = acceptingJobId === item._id;
    const serviceData = typeof item.serviceId === 'object' ? item.serviceId : null;
    const residentData = typeof item.residentId === 'object' ? item.residentId : null;

    return (
      <View style={styles.jobCard}>
        <LinearGradient
          colors={[colors.white, colors.gray[50]]}
          style={styles.jobCardGradient}
        >
          <View style={styles.jobCardContent}>
            {/* Service Icon */}
            <View style={styles.jobIconContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.jobIconGradient}
              >
                <MaterialCommunityIcons
                  name="room-service-outline"
                  size={24}
                  color={colors.white}
                />
              </LinearGradient>
            </View>

            <View style={styles.jobInfo}>
              {/* Booking Number & Category */}
              <View style={styles.jobHeader}>
                <Text variant="titleMedium" style={styles.bookingNumber}>
                  #{item.bookingNumber}
                </Text>
                {serviceData?.category && (
                  <Chip mode="outlined" compact style={styles.categoryChip}>
                    {serviceData.category}
                  </Chip>
                )}
              </View>

              {/* Service Name */}
              <Text variant="titleSmall" style={styles.serviceName} numberOfLines={1}>
                {serviceData?.name || 'Service'}
              </Text>

              {/* Resident Name */}
              {residentData?.fullName && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="account" size={14} color={colors.gray[600]} />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {residentData.fullName}
                  </Text>
                </View>
              )}

              {/* Date & Time */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={14} color={colors.gray[600]} />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {new Date(item.scheduledDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                {item.scheduledTime && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={colors.gray[600]} />
                    <Text variant="bodySmall" style={styles.detailText}>
                      {item.scheduledTime}
                    </Text>
                  </View>
                )}
              </View>

              {/* Price & Accept Button */}
              <View style={styles.actionRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Earning</Text>
                  <Text variant="titleMedium" style={styles.price}>
                    ₹{item.totalAmount}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleAcceptJob(item._id)}
                  disabled={isAccepting}
                  style={styles.acceptButton}
                >
                  <LinearGradient
                    colors={isAccepting ? [colors.gray[400], colors.gray[500]] : [colors.success, '#047857']}
                    style={styles.acceptButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isAccepting ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-circle" size={18} color={colors.white} />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading available jobs...</Text>
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
              Available Jobs
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Browse and accept jobs to start earning
            </Text>
          </View>

          <FlatList
            data={jobs}
            renderItem={renderJobCard}
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
                  name="briefcase-search"
                  size={64}
                  color={colors.gray[400]}
                />
                <Text variant="titleLarge" style={styles.emptyText}>
                  No available jobs
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Check back later for new job opportunities
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.gray[300],
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
  jobIconContainer: {
    marginRight: spacing.md,
  },
  jobIconGradient: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bookingNumber: {
    fontWeight: '700',
    color: colors.gray[900],
  },
  categoryChip: {
    height: 24,
    backgroundColor: colors.primary + '20',
  },
  serviceName: {
    color: colors.gray[800],
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  detailText: {
    color: colors.gray[600],
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: 2,
  },
  price: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 18,
  },
  acceptButton: {
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 100,
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
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
});
