import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Text, Button, Chip, Divider, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResidentStackParamList } from '../../navigation/types';
import { serviceApi } from '../../services/api';
import { Service } from '../../types';

type ServiceDetailScreenRouteProp = RouteProp<ResidentStackParamList, 'ServiceDetail'>;
type ServiceDetailScreenNavigationProp = NativeStackNavigationProp<ResidentStackParamList, 'ServiceDetail'>;

export const ServiceDetailScreen = () => {
  const route = useRoute<ServiceDetailScreenRouteProp>();
  const navigation = useNavigation<ServiceDetailScreenNavigationProp>();
  const { serviceId } = route.params;

  const [service, setService] = useState<Service | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceDetail();
  }, [serviceId]);

  const loadServiceDetail = async () => {
    try {
      setLoading(true);
      const response = await serviceApi.getServiceById(serviceId);

      if (response.success && response.data) {
        setService(response.data);
      }
    } catch (error) {
      console.error('Error loading service detail:', error);
      Alert.alert('Error', 'Unable to load service details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await serviceApi.removeFromFavorites(serviceId);
        setIsFavorite(false);
      } else {
        await serviceApi.addToFavorites(serviceId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleBookService = () => {
    if (service) {
      navigation.navigate('CreateBooking', { serviceId: service._id });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium">Service not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {/* Service Image */}
        {service.imageUrl ? (
          <Image source={{ uri: service.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text variant="headlineLarge">📋</Text>
          </View>
        )}

        {/* Favorite Button */}
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          iconColor={isFavorite ? '#F44336' : '#666666'}
          size={28}
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text variant="headlineSmall" style={styles.title}>
                {service.name}
              </Text>
              {service.category && (
                <Chip mode="outlined" style={styles.categoryChip}>
                  {service.category}
                </Chip>
              )}
            </View>

            {service.averageRating !== undefined && service.averageRating > 0 && (
              <View style={styles.ratingRow}>
                <Text variant="titleMedium" style={styles.rating}>
                  ⭐ {service.averageRating.toFixed(1)}
                </Text>
                {service.totalRatings && (
                  <Text variant="bodyMedium" style={styles.ratingCount}>
                    ({service.totalRatings} reviews)
                  </Text>
                )}
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Price */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Price
            </Text>
            <View style={styles.priceContainer}>
              <Text variant="headlineMedium" style={styles.price}>
                ₹{service.basePrice}
              </Text>
              <Text variant="bodyMedium" style={styles.priceUnit}>
                {service.pricingModel || 'per service'}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Description
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {service.description}
            </Text>
          </View>

          {/* Features */}
          {service.features && service.features.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="labelLarge" style={styles.sectionLabel}>
                  What's Included
                </Text>
                {service.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>✓</Text>
                    <Text variant="bodyMedium" style={styles.featureText}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Duration */}
          {service.estimatedDuration && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="labelLarge" style={styles.sectionLabel}>
                  Duration
                </Text>
                <Text variant="bodyLarge" style={styles.infoText}>
                  Approximately {service.estimatedDuration} minutes
                </Text>
              </View>
            </>
          )}

          {/* Availability */}
          {service.isAvailable !== undefined && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="labelLarge" style={styles.sectionLabel}>
                  Availability
                </Text>
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor: service.isAvailable ? '#4CAF50' : '#F44336',
                    alignSelf: 'flex-start',
                  }}
                  textStyle={{ color: '#FFFFFF' }}
                >
                  {service.isAvailable ? 'Available' : 'Currently Unavailable'}
                </Chip>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceContainer}>
          <Text variant="labelMedium" style={styles.bottomPriceLabel}>
            Starting from
          </Text>
          <Text variant="headlineSmall" style={styles.bottomPrice}>
            ₹{service.basePrice}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleBookService}
          style={styles.bookButton}
          contentStyle={styles.bookButtonContent}
          disabled={!service.isAvailable}
        >
          Book Service
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#F5F5F5',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 200,
    right: 16,
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    color: '#FF9800',
    fontWeight: '600',
  },
  ratingCount: {
    color: '#999999',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#666666',
    marginBottom: 8,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#999999',
  },
  description: {
    color: '#333333',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  featureBullet: {
    color: '#4CAF50',
    fontSize: 18,
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    color: '#333333',
  },
  infoText: {
    color: '#333333',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    color: '#999999',
    marginBottom: 2,
  },
  bottomPrice: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  bookButton: {
    flex: 1,
    marginLeft: 16,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
});
