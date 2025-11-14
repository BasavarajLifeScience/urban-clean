import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Switch, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { vendorApi, VendorService } from '../../services/api/vendor.api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export const VendorServicesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<VendorService[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      setError(null);
      const response = await vendorApi.getServices();

      if (response.success && response.data) {
        setServices(response.data.services);
      } else {
        setError('Failed to load services');
      }
    } catch (err: any) {
      console.error('❌ [VendorServices] Error loading services:', err);
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadServices();
  }, []);

  const toggleServiceActive = async (service: VendorService) => {
    try {
      const newStatus = !service.isActive;

      // Optimistically update UI
      setServices(prevServices =>
        prevServices.map(s =>
          s._id === service._id ? { ...s, isActive: newStatus } : s
        )
      );

      const response = await vendorApi.updateService(service._id, {
        isActive: newStatus,
      });

      if (!response.success) {
        // Revert on failure
        setServices(prevServices =>
          prevServices.map(s =>
            s._id === service._id ? { ...s, isActive: !newStatus } : s
          )
        );
        Alert.alert('Error', 'Failed to update service status');
      }
    } catch (err: any) {
      console.error('❌ [VendorServices] Error toggling service:', err);
      // Revert on error
      setServices(prevServices =>
        prevServices.map(s =>
          s._id === service._id ? service : s
        )
      );
      Alert.alert('Error', err.message || 'Failed to update service');
    }
  };

  const renderServiceCard = ({ item }: { item: VendorService }) => (
    <Card style={styles.serviceCard}>
      <Card.Content>
        <View style={styles.serviceHeader}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
          ) : (
            <View style={[styles.serviceImage, styles.placeholderImage]}>
              <MaterialCommunityIcons name="room-service" size={32} color={colors.gray[400]} />
            </View>
          )}

          <View style={styles.serviceInfo}>
            <Text variant="titleMedium" style={styles.serviceName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.serviceCategory}>
              {item.category}
            </Text>
            <Text variant="titleSmall" style={styles.servicePrice}>
              ₹{item.basePrice}
            </Text>
          </View>

          <View style={styles.serviceActions}>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleServiceActive(item)}
              color={colors.primary}
            />
          </View>
        </View>

        <Text variant="bodySmall" style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.stats && (
          <View style={styles.serviceStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-check" size={16} color={colors.primary} />
              <Text variant="bodySmall" style={styles.statText}>
                {item.stats.totalBookings} bookings
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="currency-inr" size={16} color={colors.success} />
              <Text variant="bodySmall" style={styles.statText}>
                ₹{item.stats.revenue.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.serviceFooter}>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? colors.success : colors.gray[400] }]}>
            <Text style={styles.statusText}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadServices} style={styles.retryButton}>
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
              My Services
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {services.length} {services.length === 1 ? 'service' : 'services'}
            </Text>
          </View>
          <MaterialCommunityIcons name="room-service" size={40} color={colors.white} />
        </View>
      </LinearGradient>

      <FlatList
        data={services}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="room-service-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>
              Contact admin to add services to your account
            </Text>
          </View>
        }
      />

      {/* Future: Add Service FAB */}
      {/* <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => Alert.alert('Coming Soon', 'Add service functionality will be available soon')}
      /> */}
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
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: colors.white,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.gray[300],
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
  },
  serviceCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  placeholderImage: {
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: colors.gray[900],
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  serviceCategory: {
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  servicePrice: {
    color: colors.primary,
    fontWeight: '700',
  },
  serviceActions: {
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  serviceDescription: {
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  serviceStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: spacing.xs,
    color: colors.gray[700],
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
  },
});
