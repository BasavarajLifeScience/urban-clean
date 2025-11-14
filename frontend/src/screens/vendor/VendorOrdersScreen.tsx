import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { vendorApi, VendorOrder } from '../../services/api/vendor.api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export const VendorOrdersScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadOrders = async (status?: string) => {
    try {
      setError(null);
      const params = status && status !== 'all' ? { status } : undefined;
      const response = await vendorApi.getOrders(params);

      if (response.success && response.data) {
        setOrders(response.data.orders);
        setStatusCounts(response.data.statusCounts);
      } else {
        setError('Failed to load orders');
      }
    } catch (err: any) {
      console.error('❌ [VendorOrders] Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders(filterStatus === 'all' ? undefined : filterStatus);
  }, [filterStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(filterStatus === 'all' ? undefined : filterStatus);
  }, [filterStatus]);

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'assigned':
        return colors.info;
      case 'in-progress':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      case 'refunded':
        return colors.gray[600];
      default:
        return colors.gray[500];
    }
  };

  const renderOrderCard = ({ item }: { item: VendorOrder }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text variant="titleMedium" style={styles.orderService}>
              {item.serviceId?.name || 'Service'}
            </Text>
            <Text variant="bodySmall" style={styles.orderNumber}>
              #{item.bookingNumber}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account" size={16} color={colors.gray[600]} />
            <Text variant="bodySmall" style={styles.detailText}>
              {item.residentId?.fullName || 'N/A'}
            </Text>
          </View>

          {item.sevakId && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account-hard-hat" size={16} color={colors.gray[600]} />
              <Text variant="bodySmall" style={styles.detailText}>
                {item.sevakId?.fullName || 'N/A'}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={16} color={colors.gray[600]} />
            <Text variant="bodySmall" style={styles.detailText}>
              {new Date(item.scheduledDate).toLocaleDateString()} at {item.scheduledTime}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="currency-inr" size={16} color={colors.gray[600]} />
            <Text variant="bodySmall" style={styles.detailText}>
              ₹{item.totalAmount}
            </Text>
            <View
              style={[
                styles.paymentBadge,
                { backgroundColor: getPaymentStatusColor(item.paymentStatus) },
              ]}
            >
              <Text style={styles.paymentText}>{item.paymentStatus}</Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => loadOrders()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineSmall" style={styles.greeting}>
              Orders
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </Text>
          </View>
          <MaterialCommunityIcons name="clipboard-list" size={40} color={colors.white} />
        </View>

        {/* Status Counts */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statusCounts.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statusCounts['in-progress'] || 0}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statusCounts.completed || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filterStatus}
          onValueChange={handleFilterChange}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'Active' },
            { value: 'completed', label: 'Done' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              Orders for your services will appear here
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
    backgroundColor: colors.backgroundLight,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.gray[600],
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    color: colors.white,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.gray[300],
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[300],
    marginTop: spacing.xxs,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  segmentedButtons: {
    backgroundColor: colors.backgroundLight,
  },
  listContent: {
    padding: spacing.lg,
  },
  orderCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderService: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  orderNumber: {
    color: colors.gray[600],
    marginTop: spacing.xxs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: spacing.xs,
    color: colors.gray[700],
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginLeft: spacing.sm,
  },
  paymentText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
