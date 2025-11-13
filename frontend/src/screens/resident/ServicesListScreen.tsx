import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, Searchbar, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResidentStackParamList } from '../../navigation/types';
import { serviceApi } from '../../services/api';
import { Service } from '../../types';

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
      const response = await serviceApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.map((cat: any) => cat.name));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
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

      const response = await serviceApi.getServices(params);

      if (response.success && response.data) {
        const newServices = Array.isArray(response.data) ? response.data : response.data.services || [];

        if (reset) {
          setServices(newServices);
        } else {
          setServices([...services, ...newServices]);
        }

        setHasMore(newServices.length === 10);
      }
    } catch (error) {
      console.error('Error loading services:', error);
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
    <Card style={styles.serviceCard} onPress={() => navigation.navigate('ServiceDetail', { serviceId: item._id })}>
      {item.imageUrl && (
        <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardImage} />
      )}
      <Card.Content>
        <Text variant="titleMedium" style={styles.serviceName}>
          {item.name}
        </Text>
        <Text variant="bodyMedium" numberOfLines={2} style={styles.serviceDescription}>
          {item.description}
        </Text>

        <View style={styles.serviceFooter}>
          <View>
            <Text variant="labelSmall" style={styles.priceLabel}>
              Starting from
            </Text>
            <Text variant="titleLarge" style={styles.price}>
              ₹{item.basePrice}
            </Text>
          </View>

          {item.averageRating !== undefined && item.averageRating > 0 && (
            <View style={styles.ratingContainer}>
              <Text variant="titleMedium" style={styles.rating}>
                ⭐ {item.averageRating.toFixed(1)}
              </Text>
              {item.totalRatings && (
                <Text variant="bodySmall" style={styles.ratingCount}>
                  ({item.totalRatings} reviews)
                </Text>
              )}
            </View>
          )}
        </View>

        {item.category && (
          <Chip mode="outlined" style={styles.categoryChip} compact>
            {item.category}
          </Chip>
        )}
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => navigation.navigate('ServiceDetail', { serviceId: item._id })}>
          View Details
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading && services.length === 0) {
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
          Services
        </Text>

        <Searchbar
          placeholder="Search services..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <Chip
                key={index}
                mode={selectedCategory === category ? 'flat' : 'outlined'}
                selected={selectedCategory === category}
                onPress={() => handleCategorySelect(category)}
                style={styles.filterChip}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={services}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
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
              <ActivityIndicator size="small" color="#2196F3" />
            </View>
          ) : null
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
    paddingTop: 16,
    paddingBottom: 12,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  serviceCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardImage: {
    height: 180,
  },
  serviceName: {
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },
  serviceDescription: {
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  priceLabel: {
    color: '#999999',
    marginBottom: 2,
  },
  price: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    color: '#FF9800',
    fontWeight: '600',
  },
  ratingCount: {
    color: '#999999',
    marginTop: 2,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999999',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
