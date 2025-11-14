import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ResidentStackParamList } from '../../navigation/types';
import { serviceApi, bookingApi } from '../../services/api';
import { Service } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

type CreateBookingScreenRouteProp = RouteProp<ResidentStackParamList, 'CreateBooking'>;
type CreateBookingScreenNavigationProp = NativeStackNavigationProp<ResidentStackParamList, 'CreateBooking'>;

export const CreateBookingScreen = () => {
  const route = useRoute<CreateBookingScreenRouteProp>();
  const navigation = useNavigation<CreateBookingScreenNavigationProp>();
  const { serviceId } = route.params;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Address fields
  const [flatNumber, setFlatNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    loadServiceAndSlots();
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadServiceAndSlots = async () => {
    try {
      setLoading(true);
      const response = await serviceApi.getServiceById(serviceId);

      if (response.success && response.data) {
        setService(response.data);
      }

      await loadAvailableSlots();
    } catch (error) {
      console.error('Error loading service:', error);
      Alert.alert('Error', 'Unable to load service details.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await bookingApi.getAvailableSlots({
        serviceId,
        date: dateStr,
      });

      if (response.success && response.data) {
        setAvailableSlots(response.data.availableSlots || []);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      // Set default slots if API fails
      setAvailableSlots([
        '09:00', '10:00', '11:00', '12:00',
        '14:00', '15:00', '16:00', '17:00',
      ]);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      setSelectedTime(''); // Reset time when date changes
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedDate) {
      Alert.alert('Required', 'Please select a date');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Required', 'Please select a time slot');
      return;
    }

    if (!flatNumber || !building || !area) {
      Alert.alert('Required', 'Please fill in all address fields');
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        serviceId,
        scheduledDate: selectedDate.toISOString().split('T')[0],
        scheduledTime: selectedTime,
        address: {
          flatNumber,
          building,
          area,
          landmark,
        },
        specialInstructions,
      };

      const response = await bookingApi.createBooking(bookingData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Booking created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('BookingDetail', {
                  bookingId: response.data._id,
                });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'Unable to create booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
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
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Service Summary Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.cardGradient}
              >
                <View style={styles.serviceHeader}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.serviceIcon}
                  >
                    <MaterialCommunityIcons name="room-service-outline" size={24} color={colors.white} />
                  </LinearGradient>
                  <View style={styles.serviceInfo}>
                    <Text variant="titleMedium" style={styles.serviceName}>
                      {service.name}
                    </Text>
                    <Text variant="headlineSmall" style={styles.price}>
                      ₹{service.basePrice}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Date & Time Selection Card */}
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
                    <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Select Date & Time
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <View style={styles.dateButton}>
                    <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                    <Text variant="bodyLarge" style={styles.dateButtonText}>
                      {selectedDate.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {availableSlots.length > 0 && (
                  <View style={styles.slotsContainer}>
                    <Text variant="labelLarge" style={styles.slotsLabel}>
                      Available Time Slots
                    </Text>
                    <View style={styles.slotsGrid}>
                      {availableSlots.map((slot) => (
                        <TouchableOpacity
                          key={slot}
                          onPress={() => setSelectedTime(slot)}
                        >
                          <LinearGradient
                            colors={
                              selectedTime === slot
                                ? [colors.primary, colors.primaryDark]
                                : [colors.white, colors.gray[100]]
                            }
                            style={styles.slotChip}
                          >
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={16}
                              color={selectedTime === slot ? colors.white : colors.gray[600]}
                            />
                            <Text
                              style={[
                                styles.slotText,
                                selectedTime === slot && styles.slotTextSelected,
                              ]}
                            >
                              {slot}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Address Card */}
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
                    <MaterialCommunityIcons name="map-marker" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Service Address
                  </Text>
                </View>

                <TextInput
                  label="Flat/House Number *"
                  mode="outlined"
                  value={flatNumber}
                  onChangeText={setFlatNumber}
                  style={styles.input}
                  outlineColor={colors.gray[300]}
                  activeOutlineColor={colors.primary}
                />

                <TextInput
                  label="Building/Society Name *"
                  mode="outlined"
                  value={building}
                  onChangeText={setBuilding}
                  style={styles.input}
                  outlineColor={colors.gray[300]}
                  activeOutlineColor={colors.primary}
                />

                <TextInput
                  label="Area/Locality *"
                  mode="outlined"
                  value={area}
                  onChangeText={setArea}
                  style={styles.input}
                  outlineColor={colors.gray[300]}
                  activeOutlineColor={colors.primary}
                />

                <TextInput
                  label="Landmark (Optional)"
                  mode="outlined"
                  value={landmark}
                  onChangeText={setLandmark}
                  style={styles.input}
                  outlineColor={colors.gray[300]}
                  activeOutlineColor={colors.primary}
                />
              </LinearGradient>
            </View>

            {/* Special Instructions Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={[colors.accent, colors.accentDark]}
                    style={styles.cardIcon}
                  >
                    <MaterialCommunityIcons name="note-text" size={20} color={colors.white} />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Special Instructions (Optional)
                  </Text>
                </View>

                <TextInput
                  mode="outlined"
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  multiline
                  numberOfLines={4}
                  placeholder="Any specific requirements or instructions..."
                  style={styles.textArea}
                  outlineColor={colors.gray[300]}
                  activeOutlineColor={colors.primary}
                />
              </LinearGradient>
            </View>

            {/* Price Summary Card */}
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
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Price Summary
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyLarge" style={styles.summaryLabel}>Service Charge</Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>₹{service.basePrice}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text variant="titleLarge" style={styles.totalLabel}>
                    Total Amount
                  </Text>
                  <Text variant="titleLarge" style={styles.totalAmount}>
                    ₹{service.basePrice}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Bottom Action */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <LinearGradient
                colors={submitting ? [colors.gray[400], colors.gray[500]] : [colors.primary, colors.primaryDark]}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.white} />
                    <Text style={styles.submitButtonText}>Confirm Booking</Text>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  serviceHeader: {
    flexDirection: 'row',
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
  price: {
    color: colors.primary,
    fontWeight: '800',
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
  sectionTitle: {
    fontWeight: '700',
    color: colors.gray[900],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dateButtonText: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  slotsContainer: {
    marginTop: spacing.sm,
  },
  slotsLabel: {
    color: colors.gray[700],
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
  slotTextSelected: {
    color: colors.white,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  textArea: {
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.gray[700],
  },
  summaryValue: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: '800',
    color: colors.gray[900],
  },
  totalAmount: {
    fontWeight: '800',
    color: colors.primary,
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
