import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SevakStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { sevakApi } from '../../services/api';
import { Job, PerformanceMetrics } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type SevakDashboardScreenNavigationProp = NativeStackNavigationProp<SevakStackParamList>;

export const SevakDashboardScreen = () => {
  const navigation = useNavigation<SevakDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [earnings, setEarnings] = useState({ total: 0, today: 0, week: 0, month: 0 });
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load today's jobs
      const jobsResponse = await sevakApi.getJobs({
        date: new Date().toISOString().split('T')[0],
      });

      if (jobsResponse.success) {
        setTodayJobs(jobsResponse.data.jobs || []);
        setTodayCount(jobsResponse.data.todayCount || 0);
        setUpcomingCount(jobsResponse.data.upcomingCount || 0);
      }

      // Load earnings
      const earningsResponse = await sevakApi.getEarnings({ period: 'today' });
      if (earningsResponse.success) {
        setEarnings({
          total: earningsResponse.data.totalEarnings || 0,
          today: earningsResponse.data.totalEarnings || 0,
          week: 0,
          month: 0,
        });
      }

      // Load performance metrics
      const performanceResponse = await sevakApi.getPerformance();
      if (performanceResponse.success) {
        setPerformance(performanceResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getJobStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: colors.warning,
      confirmed: colors.info,
      'in-progress': colors.secondary,
      completed: colors.success,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.gray[500];
  };

  const getJobStatusIcon = (status: string) => {
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
                    Good day,
                  </Text>
                  <Text variant="headlineMedium" style={styles.userName}>
                    {user?.fullName || 'Sevak'}
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
                      name="account-hard-hat"
                      size={28}
                      color={colors.white}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statCard}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statIconContainer}>
                    <MaterialCommunityIcons
                      name="briefcase-clock"
                      size={32}
                      color={colors.white}
                    />
                  </View>
                  <Text variant="displaySmall" style={styles.statNumber}>
                    {todayCount}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Today's Jobs
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.statCard}>
                <LinearGradient
                  colors={[colors.success, '#047857']}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statIconContainer}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={32}
                      color={colors.white}
                    />
                  </View>
                  <Text variant="displaySmall" style={styles.statNumber}>
                    {upcomingCount}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Upcoming
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Earnings Summary Card */}
            <TouchableOpacity style={styles.earningsCard}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.earningsGradient}
              >
                <View style={styles.earningsContent}>
                  <View style={styles.earningsLeft}>
                    <LinearGradient
                      colors={[colors.warning, '#c2410c']}
                      style={styles.earningsIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="currency-inr"
                        size={32}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <View style={styles.earningsInfo}>
                      <Text variant="bodyMedium" style={styles.earningsLabel}>
                        Today's Earnings
                      </Text>
                      <Text variant="displaySmall" style={styles.earningsAmount}>
                        ₹{earnings.today.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={colors.gray[400]}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Performance Metrics */}
            {performance && (
              <View style={styles.performanceCard}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.performanceGradient}
                >
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Performance
                  </Text>

                  <View style={styles.metricsGrid}>
                    <View style={styles.metricItem}>
                      <LinearGradient
                        colors={[colors.warning, '#c2410c']}
                        style={styles.metricIconBg}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <MaterialCommunityIcons
                          name="star"
                          size={20}
                          color={colors.white}
                        />
                      </LinearGradient>
                      <Text variant="titleLarge" style={styles.metricValue}>
                        {performance.averageRating?.toFixed(1) || 'N/A'}
                      </Text>
                      <Text variant="bodySmall" style={styles.metricLabel}>
                        Rating
                      </Text>
                    </View>

                    <View style={styles.metricItem}>
                      <LinearGradient
                        colors={[colors.success, '#047857']}
                        style={styles.metricIconBg}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={colors.white}
                        />
                      </LinearGradient>
                      <Text variant="titleLarge" style={styles.metricValue}>
                        {performance.totalJobsCompleted || 0}
                      </Text>
                      <Text variant="bodySmall" style={styles.metricLabel}>
                        Completed
                      </Text>
                    </View>

                    <View style={styles.metricItem}>
                      <LinearGradient
                        colors={[colors.info, '#1e40af']}
                        style={styles.metricIconBg}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <MaterialCommunityIcons
                          name="clock-check"
                          size={20}
                          color={colors.white}
                        />
                      </LinearGradient>
                      <Text variant="titleLarge" style={styles.metricValue}>
                        {performance.onTimeCompletionRate || 0}%
                      </Text>
                      <Text variant="bodySmall" style={styles.metricLabel}>
                        On-time
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Today's Schedule */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Today's Schedule
                </Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>

              {todayJobs.length > 0 ? (
                todayJobs.map((job) => (
                  <TouchableOpacity key={job._id} style={styles.jobCard}>
                    <LinearGradient
                      colors={[colors.white, colors.gray[50]]}
                      style={styles.jobCardGradient}
                    >
                      <View style={styles.jobCardContent}>
                        <LinearGradient
                          colors={[getJobStatusColor(job.status), getJobStatusColor(job.status) + 'CC']}
                          style={styles.jobIconGradient}
                        >
                          <MaterialCommunityIcons
                            name={getJobStatusIcon(job.status) as any}
                            size={24}
                            color={colors.white}
                          />
                        </LinearGradient>
                        <View style={styles.jobInfo}>
                          <View style={styles.jobHeader}>
                            <Text variant="titleMedium" style={styles.jobNumber}>
                              Job #{job.bookingNumber}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: getJobStatusColor(job.status) + '20' },
                              ]}
                            >
                              <Text
                                style={[styles.statusText, { color: getJobStatusColor(job.status) }]}
                              >
                                {job.status}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.jobDetails}>
                            <View style={styles.jobDetailItem}>
                              <MaterialCommunityIcons
                                name="clock-outline"
                                size={14}
                                color={colors.gray[600]}
                              />
                              <Text variant="bodySmall" style={styles.jobTime}>
                                {new Date(job.scheduledDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            </View>
                            {job.address && (
                              <View style={styles.jobDetailItem}>
                                <MaterialCommunityIcons
                                  name="map-marker"
                                  size={14}
                                  color={colors.gray[600]}
                                />
                                <Text variant="bodySmall" style={styles.jobAddress}>
                                  {job.address.area}
                                </Text>
                              </View>
                            )}
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
                  <Text style={styles.emptyText}>No jobs scheduled for today</Text>
                  <Text style={styles.emptySubtext}>Check back later for new assignments</Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Quick Actions
              </Text>

              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.actionCard}>
                  <LinearGradient
                    colors={[colors.white, colors.gray[50]]}
                    style={styles.actionGradient}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.actionIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="calendar-clock"
                        size={24}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <Text variant="bodyMedium" style={styles.actionLabel}>
                      My Schedule
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <LinearGradient
                    colors={[colors.white, colors.gray[50]]}
                    style={styles.actionGradient}
                  >
                    <LinearGradient
                      colors={[colors.warning, '#c2410c']}
                      style={styles.actionIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="currency-inr"
                        size={24}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <Text variant="bodyMedium" style={styles.actionLabel}>
                      Earnings
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <LinearGradient
                    colors={[colors.white, colors.gray[50]]}
                    style={styles.actionGradient}
                  >
                    <LinearGradient
                      colors={[colors.success, '#047857']}
                      style={styles.actionIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="star"
                        size={24}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <Text variant="bodyMedium" style={styles.actionLabel}>
                      Feedback
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    paddingBottom: spacing.xxl,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
  },
  statGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.white,
    opacity: 0.95,
    textAlign: 'center',
  },
  earningsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  earningsGradient: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  earningsContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  earningsIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  earningsInfo: {
    flex: 1,
  },
  earningsLabel: {
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  earningsAmount: {
    color: colors.primary,
    fontWeight: '800',
  },
  performanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  performanceGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.lg,
    letterSpacing: -0.2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricIconBg: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontWeight: '800',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  metricLabel: {
    color: colors.gray[600],
    textAlign: 'center',
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
  jobCard: {
    marginHorizontal: spacing.lg,
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
    alignItems: 'center',
  },
  jobIconGradient: {
    width: 52,
    height: 52,
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
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  jobNumber: {
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
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobTime: {
    color: colors.gray[600],
  },
  jobAddress: {
    color: colors.gray[600],
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
  quickActionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
  },
  actionGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    color: colors.gray[700],
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
});
