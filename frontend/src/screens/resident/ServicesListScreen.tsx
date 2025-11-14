import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ResidentStackParamList } from '../../navigation/types';
import { serviceApi } from '../../services/api/service.api';
import { Service } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type ServicesListScreenNavigationProp = NativeStackNavigationProp<ResidentStackParamList>;

export const ServicesListScreen = () => {
  const navigation = useNavigation<ServicesListScreenNavigationProp>();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  useEffect(() => {
    loadServices(true);
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      console.log('📋 [ServicesListScreen] Loading categories...');
      const response = await serviceApi.getCategories();
      console.log('📥 [ServicesListScreen] Categories response:', response);

      if (response.success && response.data) {
        const categoryNames = response.data.categories?.map((cat: any) => cat.name) || [];
        setCategories(categoryNames);
        console.log('✅ [ServicesListScreen] Categories loaded:', categoryNames);
      }
    } catch (error: any) {
      console.error('❌ [ServicesListScreen] Error loading categories:', error);
      console.error('❌ [ServicesListScreen] Error details:', {
        message: error.message,
        response: error.response?.data,
      });
      Alert.alert(
        'Error Loading Categories',
        error.response?.data?.message || error.message || 'Unable to load categories',
        [{ text: 'OK' }]
      );
    }
  };

  const loadServices = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const params: any = {
        page: reset ? 1 : page,
        limit: 10,
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      console.log('📋 [ServicesListScreen] Loading services with params:', params);
      const response = await serviceApi.getServices(params);
      console.log('📥 [ServicesListScreen] Services response:', response);

      if (response.success && response.data) {
        const newServices = Array.isArray(response.data) ? response.data : response.data.services || [];
        console.log('✅ [ServicesListScreen] Services loaded:', newServices.length);

        if (reset) {
          setServices(newServices);
        } else {
          setServices([...services, ...newServices]);
        }

        setHasMore(newServices.length === 10);
      }
    } catch (error: any) {
      console.error('❌ [ServicesListScreen] Error loading services:', error);
      console.error('❌ [ServicesListScreen] Error details:', {
        message: error.message,
        response: error.response?.data,
      });
      Alert.alert(
        'Error Loading Services',
        error.response?.data?.message || error.message || 'Unable to load services',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadServices(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(page + 1);
      loadServices();
    }
  };

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetail', { serviceId: item._id })}
    >
      <LinearGradient
        colors={[colors.white, colors.gray[50]]}
        style={styles.serviceCardGradient}
      >
        <View style={styles.serviceCardContent}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.serviceIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="room-service-outline"
              size={28}
              color={colors.white}
            />
          </LinearGradient>

          <View style={styles.serviceInfo}>
            <Text variant="titleMedium" style={styles.serviceName}>
              {item.name}
            </Text>
            <Text
              variant="bodySmall"
              style={styles.serviceDescription}
              numberOfLines={2}
            >
              {item.description}
            </Text>

            <View style={styles.serviceFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Starting at</Text>
                <Text variant="titleMedium" style={styles.price}>
                  ₹{item.basePrice}
                </Text>
              </View>

              {item.averageRating !== undefined && item.averageRating > 0 && (
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color={colors.warning}
                  />
                  <Text variant="bodySmall" style={styles.rating}>
                    {item.averageRating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => navigation.navigate('ServiceDetail', { serviceId: item._id })}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.arrowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={colors.white}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading && services.length === 0) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading services...</Text>
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
              All Services
            </Text>

            <Searchbar
              placeholder="Search services..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor={colors.primary}
              placeholderTextColor={colors.gray[500]}
              elevation={0}
            />

            {categories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <LinearGradient
                      colors={
                        selectedCategory === category
                          ? [colors.primary, colors.primaryDark]
                          : [colors.white, colors.gray[100]]
                      }
                      style={styles.categoryChip}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategory === category && styles.categoryChipTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <FlatList
            data={services}
            renderItem={renderServiceCard}
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
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={64}
                  color={colors.gray[400]}
                />
                <Text variant="titleLarge" style={styles.emptyText}>
                  No services found
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Try adjusting your filters or search query
                </Text>
              </View>
            }
            ListFooterComponent={
              hasMore && services.length > 0 ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
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
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  searchBar: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  searchInput: {
    color: colors.gray[900],
  },
  categoriesContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
  categoryChipTextSelected: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  serviceCard: {
    marginBottom: spacing.md,
  },
  serviceCardGradient: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  serviceCardContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    color: colors.gray[600],
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 10,
    color: colors.gray[500],
    marginBottom: 2,
  },
  price: {
    color: colors.primary,
    fontWeight: '800',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  rating: {
    color: colors.gray[700],
    marginLeft: 4,
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  arrowButton: {
    marginLeft: spacing.sm,
  },
  arrowGradient: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
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
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
