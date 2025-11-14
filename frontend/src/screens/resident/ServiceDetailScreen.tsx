import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ResidentStackParamList } from '../../navigation/types';
import { serviceApi } from '../../services/api/service.api';
import { Service } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

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
      console.log('📋 [ServiceDetailScreen] Loading service:', serviceId);
      const response = await serviceApi.getServiceById(serviceId);
      console.log('📥 [ServiceDetailScreen] API Response:', response);

      if (response.success && response.data) {
        // Extract service from response.data.service
        const serviceData = response.data.service || response.data;
        console.log('✅ [ServiceDetailScreen] Service data:', serviceData);
        setService(serviceData);
      }
    } catch (error: any) {
      console.error('❌ [ServiceDetailScreen] Error loading service:', error);
      console.error('❌ [ServiceDetailScreen] Error details:', {
        message: error.message,
        response: error.response?.data,
      });
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Unable to load service details. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      console.log(`🔖 [ServiceDetailScreen] Toggling favorite for service: ${serviceId}`);
      if (isFavorite) {
        await serviceApi.removeFromFavorites(serviceId);
        setIsFavorite(false);
        console.log('✅ [ServiceDetailScreen] Removed from favorites');
        Alert.alert('Success', 'Removed from favorites');
      } else {
        await serviceApi.addToFavorites(serviceId);
        setIsFavorite(true);
        console.log('✅ [ServiceDetailScreen] Added to favorites');
        Alert.alert('Success', 'Added to favorites');
      }
    } catch (error: any) {
      console.error('❌ [ServiceDetailScreen] Error toggling favorite:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Unable to update favorites',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBookService = () => {
    if (service) {
      console.log('🎫 [ServiceDetailScreen] Navigating to CreateBooking:', service._id);
      navigation.navigate('CreateBooking', { serviceId: service._id });
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading details...</Text>
      </LinearGradient>
    );
  }

  if (!service) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.gray[400]} />
        <Text variant="titleMedium" style={styles.errorText}>Service not found</Text>
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
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Service Image */}
            {service.imageUrl ? (
              <Image source={{ uri: service.imageUrl }} style={styles.image} />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.placeholderImage}
              >
                <MaterialCommunityIcons name="room-service-outline" size={64} color={colors.white} />
              </LinearGradient>
            )}

            {/* Favorite Button */}
            <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
              <LinearGradient
                colors={isFavorite ? [colors.error, colors.error] : [colors.white, colors.white]}
                style={styles.favoriteGradient}
              >
                <MaterialCommunityIcons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? colors.white : colors.error}
                />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.content}>
              {/* Header Card */}
              <View style={styles.headerCard}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.headerCardGradient}
                >
                  <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                      <Text variant="headlineSmall" style={styles.title}>
                        {service.name}
                      </Text>
                      {service.category && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{service.category}</Text>
                        </View>
                      )}
                    </View>
                    {service.averageRating !== undefined && service.averageRating > 0 && (
                      <View style={styles.ratingContainer}>
                        <MaterialCommunityIcons name="star" size={20} color={colors.warning} />
                        <Text variant="titleMedium" style={styles.rating}>
                          {service.averageRating.toFixed(1)}
                        </Text>
                        {service.totalRatings && (
                          <Text variant="bodySmall" style={styles.ratingCount}>
                            ({service.totalRatings})
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </View>

              {/* Price Card */}
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.success, colors.success + 'CC']}
                      style={styles.cardIcon}
                    >
                      <MaterialCommunityIcons name="currency-inr" size={20} color={colors.white} />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Pricing
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text variant="headlineMedium" style={styles.price}>
                      ₹{service.basePrice}
                    </Text>
                    <Text variant="bodyMedium" style={styles.priceUnit}>
                      {service.priceUnit || 'per service'}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Description Card */}
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.info, colors.info + 'CC']}
                      style={styles.cardIcon}
                    >
                      <MaterialCommunityIcons name="information" size={20} color={colors.white} />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Description
                    </Text>
                  </View>
                  <Text variant="bodyLarge" style={styles.description}>
                    {service.description}
                  </Text>
                </LinearGradient>
              </View>

              {/* Features Card */}
              {service.features && service.features.length > 0 && (
                <View style={styles.card}>
                  <LinearGradient
                    colors={[colors.white, colors.gray[50]]}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <LinearGradient
                        colors={[colors.secondary, colors.secondaryDark]}
                        style={styles.cardIcon}
                      >
                        <MaterialCommunityIcons name="check-all" size={20} color={colors.white} />
                      </LinearGradient>
                      <Text variant="titleMedium" style={styles.cardTitle}>
                        What's Included
                      </Text>
                    </View>
                    {service.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={18}
                          color={colors.success}
                        />
                        <Text variant="bodyMedium" style={styles.featureText}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </LinearGradient>
                </View>
              )}

              {/* FAQs Card */}
              {service.faqs && service.faqs.length > 0 && (
                <View style={styles.card}>
                  <LinearGradient
                    colors={[colors.white, colors.gray[50]]}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.cardIcon}
                      >
                        <MaterialCommunityIcons name="help-circle" size={20} color={colors.white} />
                      </LinearGradient>
                      <Text variant="titleMedium" style={styles.cardTitle}>
                        Frequently Asked Questions
                      </Text>
                    </View>
                    {service.faqs.map((faq: any, index: number) => (
                      <View key={index} style={styles.faqItem}>
                        <Text variant="titleSmall" style={styles.faqQuestion}>
                          Q: {faq.question}
                        </Text>
                        <Text variant="bodyMedium" style={styles.faqAnswer}>
                          A: {faq.answer}
                        </Text>
                      </View>
                    ))}
                  </LinearGradient>
                </View>
              )}

              {/* Duration Card */}
              {service.duration && (
                <View style={styles.card}>
                  <LinearGradient
                    colors={[colors.white, colors.gray[50]]}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <LinearGradient
                        colors={[colors.warning, colors.warning + 'CC']}
                        style={styles.cardIcon}
                      >
                        <MaterialCommunityIcons name="clock-outline" size={20} color={colors.white} />
                      </LinearGradient>
                      <Text variant="titleMedium" style={styles.cardTitle}>
                        Duration
                      </Text>
                    </View>
                    <Text variant="bodyLarge" style={styles.infoText}>
                      Approximately {service.duration} minutes
                    </Text>
                  </LinearGradient>
                </View>
              )}

              {/* Availability Card */}
              {service.isActive !== undefined && (
                <View style={styles.card}>
                  <LinearGradient
                    colors={[colors.white, colors.gray[50]]}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <LinearGradient
                        colors={service.isActive ? [colors.success, colors.success + 'CC'] : [colors.error, colors.error + 'CC']}
                        style={styles.cardIcon}
                      >
                        <MaterialCommunityIcons
                          name={service.isActive ? 'check-circle' : 'close-circle'}
                          size={20}
                          color={colors.white}
                        />
                      </LinearGradient>
                      <Text variant="titleMedium" style={styles.cardTitle}>
                        Availability
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.availabilityBadge,
                        { backgroundColor: service.isActive ? colors.success + '20' : colors.error + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.availabilityText,
                          { color: service.isActive ? colors.success : colors.error },
                        ]}
                      >
                        {service.isActive ? 'Available Now' : 'Currently Unavailable'}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              )}

              <View style={{ height: 100 }} />
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
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBookService}
              disabled={!service.isActive}
            >
              <LinearGradient
                colors={service.isActive ? [colors.primary, colors.primaryDark] : [colors.gray[400], colors.gray[500]]}
                style={styles.bookButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="calendar-check" size={20} color={colors.white} />
                <Text style={styles.bookButtonText}>Book Service</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  errorText: {
    marginTop: spacing.md,
    color: colors.gray[400],
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: colors.gray[200],
  },
  placeholderImage: {
    width: '100%',
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 230,
    right: spacing.lg,
  },
  favoriteGradient: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  content: {
    padding: spacing.lg,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  headerCardGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontWeight: '800',
    color: colors.gray[900],
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  rating: {
    color: colors.gray[900],
    fontWeight: '700',
  },
  ratingCount: {
    color: colors.gray[600],
  },
  card: {
    marginBottom: spacing.md,
  },
  cardGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.gray[900],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    color: colors.primary,
    fontWeight: '800',
  },
  priceUnit: {
    color: colors.gray[600],
  },
  description: {
    color: colors.gray[700],
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    color: colors.gray[700],
    lineHeight: 20,
  },
  infoText: {
    color: colors.gray[700],
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  availabilityText: {
    fontWeight: '700',
    fontSize: 14,
  },
  faqItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  faqQuestion: {
    color: colors.gray[900],
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    color: colors.gray[600],
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    color: colors.gray[600],
    marginBottom: 2,
  },
  bottomPrice: {
    color: colors.primary,
    fontWeight: '800',
  },
  bookButton: {
    marginLeft: spacing.md,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  bookButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
