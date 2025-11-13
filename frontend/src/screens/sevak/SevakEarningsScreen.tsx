import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sevakApi } from '../../services/api';
import { Earnings } from '../../types';

export const SevakEarningsScreen = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [breakdown, setBreakdown] = useState<Earnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, [period]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const response = await sevakApi.getEarnings({ period });

      if (response.success && response.data) {
        setTotalEarnings(response.data.totalEarnings || 0);
        setBreakdown(response.data.breakdown || []);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEarnings();
  };

  const getPeriodLabel = () => {
    const labels = {
      today: "Today's Earnings",
      week: 'This Week',
      month: 'This Month',
    };
    return labels[period];
  };

  if (loading && !refreshing) {
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Earnings
          </Text>

          <SegmentedButtons
            value={period}
            onValueChange={(value) => setPeriod(value as 'today' | 'week' | 'month')}
            buttons={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Total Earnings */}
        <Card style={styles.totalCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.periodLabel}>
              {getPeriodLabel()}
            </Text>
            <Text variant="displayMedium" style={styles.totalAmount}>
              ₹{totalEarnings.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Breakdown
          </Text>

          {breakdown.length > 0 ? (
            breakdown.map((item, index) => (
              <Card key={index} style={styles.earningCard}>
                <Card.Content>
                  <View style={styles.earningRow}>
                    <View style={styles.earningLeft}>
                      <Text variant="titleMedium" style={styles.earningDate}>
                        {new Date(item.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text variant="bodyMedium" style={styles.earningJobs}>
                        {item.jobsCompleted || 0} job{item.jobsCompleted !== 1 ? 's' : ''} completed
                      </Text>
                    </View>
                    <Text variant="titleLarge" style={styles.earningAmount}>
                      ₹{item.amount.toFixed(2)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No earnings for this period
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Jobs Completed
              </Text>
              <Text variant="headlineMedium" style={styles.statValue}>
                {breakdown.reduce((sum, item) => sum + (item.jobsCompleted || 0), 0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Average per Job
              </Text>
              <Text variant="headlineMedium" style={styles.statValue}>
                ₹
                {breakdown.reduce((sum, item) => sum + (item.jobsCompleted || 0), 0) > 0
                  ? (
                      totalEarnings /
                      breakdown.reduce((sum, item) => sum + (item.jobsCompleted || 0), 0)
                    ).toFixed(0)
                  : '0'}
              </Text>
            </Card.Content>
          </Card>
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
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  totalCard: {
    backgroundColor: '#2196F3',
    marginBottom: 24,
    elevation: 4,
  },
  periodLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  earningCard: {
    marginBottom: 12,
    elevation: 2,
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningLeft: {
    flex: 1,
  },
  earningDate: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  earningJobs: {
    color: '#666666',
  },
  earningAmount: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyCard: {
    elevation: 2,
  },
  emptyText: {
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statLabel: {
    color: '#666666',
    marginBottom: 8,
  },
  statValue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
