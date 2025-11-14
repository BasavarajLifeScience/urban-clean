import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { sevakApi } from '../../services/api/sevak.api';
import { Earnings } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

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

  const totalJobs = breakdown.reduce((sum, item) => sum + (item.jobsCompleted || 0), 0);
  const averagePerJob = totalJobs > 0 ? (totalEarnings / totalJobs).toFixed(0) : '0';

  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading earnings...</Text>
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
            {/* Header */}
            <View style={styles.header}>
              <Text variant="headlineMedium" style={styles.title}>
                Earnings
              </Text>

              {/* Period Filter */}
              <View style={styles.filterContainer}>
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
            </View>

            {/* Total Earnings Card */}
            <View style={styles.totalCard}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.totalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.totalIconContainer}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={40}
                    color={colors.white}
                  />
                </View>
                <Text variant="titleMedium" style={styles.periodLabel}>
                  {getPeriodLabel()}
                </Text>
                <Text variant="displayLarge" style={styles.totalAmount}>
                  ₹{totalEarnings.toFixed(2)}
                </Text>
              </LinearGradient>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.statGradient}
                >
                  <LinearGradient
                    colors={[colors.success, '#047857']}
                    style={styles.statIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={colors.white}
                    />
                  </LinearGradient>
                  <Text variant="displaySmall" style={styles.statValue}>
                    {totalJobs}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Jobs Completed
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.statGradient}
                >
                  <LinearGradient
                    colors={[colors.warning, '#c2410c']}
                    style={styles.statIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name="chart-line"
                      size={24}
                      color={colors.white}
                    />
                  </LinearGradient>
                  <Text variant="displaySmall" style={styles.statValue}>
                    ₹{averagePerJob}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Average per Job
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Earnings Breakdown */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Breakdown
                </Text>
              </View>

              {breakdown.length > 0 ? (
                breakdown.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.earningCard}>
                    <LinearGradient
                      colors={[colors.white, colors.gray[50]]}
                      style={styles.earningGradient}
                    >
                      <View style={styles.earningContent}>
                        <LinearGradient
                          colors={[colors.info, '#1e40af']}
                          style={styles.earningIconBg}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <MaterialCommunityIcons
                            name="calendar"
                            size={24}
                            color={colors.white}
                          />
                        </LinearGradient>
                        <View style={styles.earningInfo}>
                          <Text variant="titleMedium" style={styles.earningDate}>
                            {new Date(item.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                          <View style={styles.jobsCompletedRow}>
                            <MaterialCommunityIcons
                              name="briefcase-check"
                              size={14}
                              color={colors.gray[600]}
                            />
                            <Text variant="bodySmall" style={styles.jobsCompleted}>
                              {item.jobsCompleted || 0} job{item.jobsCompleted !== 1 ? 's' : ''} completed
                            </Text>
                          </View>
                        </View>
                        <View style={styles.earningAmountContainer}>
                          <Text variant="displaySmall" style={styles.earningAmount}>
                            ₹{item.amount.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="cash-remove"
                    size={64}
                    color={colors.gray[400]}
                  />
                  <Text variant="titleLarge" style={styles.emptyText}>
                    No earnings yet
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptySubtext}>
                    Complete jobs to see your earnings here
                  </Text>
                </View>
              )}
            </View>

            {/* Tips Card */}
            <View style={styles.tipsCard}>
              <LinearGradient
                colors={[colors.secondary, colors.secondaryDark]}
                style={styles.tipsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.tipsIconContainer}>
                  <MaterialCommunityIcons
                    name="lightbulb-on"
                    size={32}
                    color={colors.white}
                  />
                </View>
                <Text variant="titleMedium" style={styles.tipsTitle}>
                  Earning Tips
                </Text>
                <Text variant="bodyMedium" style={styles.tipsText}>
                  Complete jobs on time, maintain quality service, and get good ratings to increase your earnings!
                </Text>
              </LinearGradient>
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
    paddingBottom: spacing.md,
  },
  title: {
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  filterContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    ...shadows.md,
  },
  segmentedButtons: {
    backgroundColor: colors.gray[50],
  },
  totalCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  totalGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  totalIconContainer: {
    marginBottom: spacing.md,
  },
  periodLabel: {
    color: colors.white,
    opacity: 0.95,
    marginBottom: spacing.sm,
  },
  totalAmount: {
    color: colors.white,
    fontWeight: '900',
    letterSpacing: -1,
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
    alignItems: 'center',
    ...shadows.md,
  },
  statIconBg: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    color: colors.gray[900],
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.gray[600],
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.gray[900],
    letterSpacing: -0.2,
  },
  earningCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  earningGradient: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  earningContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  earningIconBg: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  earningInfo: {
    flex: 1,
  },
  earningDate: {
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  jobsCompletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobsCompleted: {
    color: colors.gray[600],
  },
  earningAmountContainer: {
    alignItems: 'flex-end',
  },
  earningAmount: {
    color: colors.success,
    fontWeight: '800',
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
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tipsGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  tipsIconContainer: {
    marginBottom: spacing.md,
  },
  tipsTitle: {
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  tipsText: {
    color: colors.white,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 20,
  },
});
