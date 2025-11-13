import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ResidentStackParamList } from '../../navigation/types';
import { serviceApi, bookingApi } from '../../services/api';
import { Service } from '../../types';

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Service Summary */}
        <Card style={styles.serviceCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.serviceName}>
              {service.name}
            </Text>
            <Text variant="headlineSmall" style={styles.price}>
              ₹{service.basePrice}
            </Text>
          </Card.Content>
        </Card>

        {/* Date & Time Selection */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Date & Time
          </Text>

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            icon="calendar"
            style={styles.dateButton}
            contentStyle={styles.dateButtonContent}
          >
            {selectedDate.toLocaleDateString('en-IN', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Button>

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
                  <Chip
                    key={slot}
                    mode={selectedTime === slot ? 'flat' : 'outlined'}
                    selected={selectedTime === slot}
                    onPress={() => setSelectedTime(slot)}
                    style={styles.slotChip}
                  >
                    {slot}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Service Address
          </Text>

          <TextInput
            label="Flat/House Number *"
            mode="outlined"
            value={flatNumber}
            onChangeText={setFlatNumber}
            style={styles.input}
          />

          <TextInput
            label="Building/Society Name *"
            mode="outlined"
            value={building}
            onChangeText={setBuilding}
            style={styles.input}
          />

          <TextInput
            label="Area/Locality *"
            mode="outlined"
            value={area}
            onChangeText={setArea}
            style={styles.input}
          />

          <TextInput
            label="Landmark (Optional)"
            mode="outlined"
            value={landmark}
            onChangeText={setLandmark}
            style={styles.input}
          />
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Special Instructions (Optional)
          </Text>

          <TextInput
            mode="outlined"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={4}
            placeholder="Any specific requirements or instructions..."
            style={styles.textArea}
          />
        </View>

        {/* Price Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text variant="titleMedium">Service Charge</Text>
              <Text variant="titleMedium">₹{service.basePrice}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Total Amount
              </Text>
              <Text variant="titleLarge" style={styles.totalAmount}>
                ₹{service.basePrice}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            'Confirm Booking'
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  serviceCard: {
    marginBottom: 16,
    elevation: 2,
  },
  serviceName: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  price: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  dateButtonContent: {
    paddingVertical: 8,
  },
  slotsContainer: {
    marginTop: 8,
  },
  slotsLabel: {
    color: '#666666',
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  textArea: {
    marginBottom: 12,
  },
  summaryCard: {
    elevation: 2,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#333333',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#2196F3',
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
