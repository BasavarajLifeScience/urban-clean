import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ResidentStackParamList } from '../../navigation/types';
import { ratingApi } from '../../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type RatingScreenRouteProp = RouteProp<ResidentStackParamList, 'Rating'>;
type RatingScreenNavigationProp = NativeStackNavigationProp<ResidentStackParamList, 'Rating'>;

export const RatingScreen = () => {
  const route = useRoute<RatingScreenRouteProp>();
  const navigation = useNavigation<RatingScreenNavigationProp>();
  const { bookingId, sevakId } = route.params;

  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStarPress = (
    rating: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setter(rating);
  };

  const renderStars = (
    currentRating: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleStarPress(star, setter)}>
            <LinearGradient
              colors={
                star <= currentRating
                  ? [colors.warning, colors.warning + 'CC']
                  : [colors.gray[200], colors.gray[300]]
              }
              style={styles.starGradient}
            >
              <MaterialCommunityIcons
                name={star <= currentRating ? 'star' : 'star-outline'}
                size={32}
                color={star <= currentRating ? colors.white : colors.gray[500]}
              />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[rating] || 'Tap to rate';
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert('Required', 'Please provide an overall rating');
      return;
    }

    try {
      setSubmitting(true);

      await ratingApi.createRating({
        bookingId,
        sevakId,
        overallRating,
        qualityRating,
        punctualityRating,
        professionalismRating,
        review,
      });

      Alert.alert('Success', 'Thank you for your feedback!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Submission Failed',
        error.response?.data?.message || 'Unable to submit rating. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium, colors.backgroundLight]}
        style={styles.gradient}
        locations={[0, 0.3, 1]}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="headlineMedium" style={styles.title}>
                Rate Your Experience
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Your feedback helps us improve our services
              </Text>
            </View>

            {/* Overall Rating Card */}
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
                    <MaterialCommunityIcons name="star" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Overall Rating *
                  </Text>
                </View>

                {renderStars(overallRating, setOverallRating)}

                <View style={styles.ratingLabelContainer}>
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.ratingLabel,
                      overallRating > 0 && { color: colors.warning },
                    ]}
                  >
                    {getRatingLabel(overallRating)}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Detailed Ratings Card */}
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
                    <MaterialCommunityIcons name="star-half-full" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Detailed Ratings
                  </Text>
                </View>

                <View style={styles.detailedRating}>
                  <View style={styles.detailedHeader}>
                    <MaterialCommunityIcons name="quality-high" size={18} color={colors.primary} />
                    <Text variant="bodyLarge" style={styles.detailedLabel}>
                      Quality of Work
                    </Text>
                  </View>
                  {renderStars(qualityRating, setQualityRating)}
                </View>

                <View style={styles.divider} />

                <View style={styles.detailedRating}>
                  <View style={styles.detailedHeader}>
                    <MaterialCommunityIcons name="clock-check" size={18} color={colors.primary} />
                    <Text variant="bodyLarge" style={styles.detailedLabel}>
                      Punctuality
                    </Text>
                  </View>
                  {renderStars(punctualityRating, setPunctualityRating)}
                </View>

                <View style={styles.divider} />

                <View style={styles.detailedRating}>
                  <View style={styles.detailedHeader}>
                    <MaterialCommunityIcons name="account-tie" size={18} color={colors.primary} />
                    <Text variant="bodyLarge" style={styles.detailedLabel}>
                      Professionalism
                    </Text>
                  </View>
                  {renderStars(professionalismRating, setProfessionalismRating)}
                </View>
              </LinearGradient>
            </View>

            {/* Written Review Card */}
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
                    <MaterialCommunityIcons name="text-box" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Write a Review (Optional)
                  </Text>
                </View>

                <TextInput
                  mode="outlined"
                  value={review}
                  onChangeText={setReview}
                  multiline
                  numberOfLines={6}
                  placeholder="Share details about your experience..."
                  style={styles.textArea}
                  outlineColor={colors.gray[300]}
                  activeOutlineColor={colors.primary}
                />

                <View style={styles.reviewHintContainer}>
                  <MaterialCommunityIcons name="information-outline" size={16} color={colors.gray[500]} />
                  <Text variant="bodySmall" style={styles.reviewHint}>
                    Your review will be visible to other users and help them make informed decisions.
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting || overallRating === 0}
            >
              <LinearGradient
                colors={
                  submitting || overallRating === 0
                    ? [colors.gray[400], colors.gray[500]]
                    : [colors.primary, colors.primaryDark]
                }
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="send" size={20} color={colors.white} />
                    <Text style={styles.submitButtonText}>Submit Rating</Text>
                  </>
                )}
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.gray[300],
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
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  starGradient: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  ratingLabelContainer: {
    alignItems: 'center',
  },
  ratingLabel: {
    color: colors.gray[600],
    fontWeight: '600',
  },
  detailedRating: {
    marginBottom: spacing.md,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailedLabel: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginVertical: spacing.md,
  },
  textArea: {
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    minHeight: 120,
  },
  reviewHintContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  reviewHint: {
    flex: 1,
    color: colors.gray[500],
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.lg,
    ...shadows.lg,
  },
  submitButton: {
    width: '100%',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
