import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResidentStackParamList } from '../../navigation/types';
import { ratingApi } from '../../services/api';

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
          <Text
            key={star}
            style={styles.star}
            onPress={() => handleStarPress(star, setter)}
          >
            {star <= currentRating ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineSmall" style={styles.title}>
          Rate Your Experience
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Your feedback helps us improve our services
        </Text>

        {/* Overall Rating */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.ratingLabel}>
              Overall Rating *
            </Text>
            {renderStars(overallRating, setOverallRating)}
            <Text variant="bodySmall" style={styles.ratingHint}>
              {overallRating === 0
                ? 'Tap to rate'
                : overallRating === 1
                ? 'Poor'
                : overallRating === 2
                ? 'Fair'
                : overallRating === 3
                ? 'Good'
                : overallRating === 4
                ? 'Very Good'
                : 'Excellent'}
            </Text>
          </Card.Content>
        </Card>

        {/* Detailed Ratings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Detailed Ratings
            </Text>

            <View style={styles.detailedRating}>
              <Text variant="bodyLarge" style={styles.detailedLabel}>
                Quality of Work
              </Text>
              {renderStars(qualityRating, setQualityRating)}
            </View>

            <View style={styles.detailedRating}>
              <Text variant="bodyLarge" style={styles.detailedLabel}>
                Punctuality
              </Text>
              {renderStars(punctualityRating, setPunctualityRating)}
            </View>

            <View style={styles.detailedRating}>
              <Text variant="bodyLarge" style={styles.detailedLabel}>
                Professionalism
              </Text>
              {renderStars(professionalismRating, setProfessionalismRating)}
            </View>
          </Card.Content>
        </Card>

        {/* Written Review */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Write a Review (Optional)
            </Text>

            <TextInput
              mode="outlined"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={6}
              placeholder="Share details about your experience..."
              style={styles.textArea}
            />

            <Text variant="bodySmall" style={styles.reviewHint}>
              Your review will be visible to other users and help them make informed decisions.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={submitting || overallRating === 0}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : 'Submit Rating'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666666',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  ratingLabel: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  star: {
    fontSize: 40,
  },
  ratingHint: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 4,
  },
  detailedRating: {
    marginBottom: 20,
  },
  detailedLabel: {
    color: '#333333',
    marginBottom: 8,
  },
  textArea: {
    marginBottom: 12,
  },
  reviewHint: {
    color: '#999999',
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButton: {
    width: '100%',
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
