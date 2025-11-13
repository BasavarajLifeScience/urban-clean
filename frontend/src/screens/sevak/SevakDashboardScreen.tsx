import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SevakStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { sevakApi } from '../../services/api';
import { Job, PerformanceMetrics } from '../../types';

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
            Good day,
          </Text>
          <Text variant="titleLarge" style={styles.userName}>
            {user?.fullName || 'Sevak'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, styles.primaryCard]}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                {todayCount}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Today's Jobs
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.secondaryCard]}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                {upcomingCount}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Upcoming
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Earnings Summary */}
        <Card style={styles.earningsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Today's Earnings
            </Text>
            <Text variant="displaySmall" style={styles.earningsAmount}>
              ₹{earnings.today.toFixed(2)}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="text" onPress={() => {}}>
              View Details
            </Button>
          </Card.Actions>
        </Card>

        {/* Performance Metrics */}
        {performance && (
          <Card style={styles.performanceCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Performance
              </Text>

              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text variant="titleSmall" style={styles.metricLabel}>
                    Rating
                  </Text>
                  <Text variant="titleLarge" style={styles.metricValue}>
                    ⭐ {performance.averageRating?.toFixed(1) || 'N/A'}
                  </Text>
                </View>

                <View style={styles.metric}>
                  <Text variant="titleSmall" style={styles.metricLabel}>
                    Completed
                  </Text>
                  <Text variant="titleLarge" style={styles.metricValue}>
                    {performance.totalJobsCompleted || 0}
                  </Text>
                </View>

                <View style={styles.metric}>
                  <Text variant="titleSmall" style={styles.metricLabel}>
                    On-time
                  </Text>
                  <Text variant="titleLarge" style={styles.metricValue}>
                    {performance.onTimeCompletionRate || 0}%
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Today's Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Today's Schedule
            </Text>
            <Button mode="text" compact onPress={() => {}}>
              View All
            </Button>
          </View>

          {todayJobs.length > 0 ? (
            todayJobs.map((job) => (
              <Card key={job._id} style={styles.jobCard}>
                <Card.Content>
                  <View style={styles.jobHeader}>
                    <Text variant="titleMedium">Job #{job.bookingNumber}</Text>
                    <Chip
                      mode="flat"
                      style={{ backgroundColor: getJobStatusColor(job.status) + '20' }}
                      textStyle={{ color: getJobStatusColor(job.status) }}
                    >
                      {job.status}
                    </Chip>
                  </View>

                  <Text variant="bodyMedium" style={styles.jobTime}>
                    {new Date(job.scheduledDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>

                  <View style={styles.jobFooter}>
                    <Text variant="bodySmall" style={styles.jobAddress}>
                      📍 {job.address?.area || 'Location'}
                    </Text>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      // Navigate to job detail
                    }}
                  >
                    View Details
                  </Button>
                  {job.status === 'confirmed' && (
                    <Button mode="contained" onPress={() => {}}>
                      Start Job
                    </Button>
                  )}
                </Card.Actions>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No jobs scheduled for today</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <View style={styles.quickActions}>
            <Button
              mode="outlined"
              icon="calendar-clock"
              style={styles.actionButton}
              onPress={() => {}}
            >
              My Schedule
            </Button>
            <Button
              mode="outlined"
              icon="currency-inr"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Earnings
            </Button>
            <Button
              mode="outlined"
              icon="star"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Feedback
            </Button>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 24,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  primaryCard: {
    backgroundColor: '#2196F3',
  },
  secondaryCard: {
    backgroundColor: '#4CAF50',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 32,
  },
  statLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  earningsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  earningsAmount: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  performanceCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    elevation: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#666666',
    marginBottom: 4,
  },
  metricValue: {
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
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
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  jobCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTime: {
    color: '#666666',
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobAddress: {
    color: '#666666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
});
