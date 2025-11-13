import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Text, Card, Chip, Button, Divider, ActivityIndicator, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SevakStackParamList } from '../../navigation/types';
import { sevakApi } from '../../services/api';
import { Job } from '../../types';

type SevakJobDetailScreenRouteProp = RouteProp<SevakStackParamList, 'JobDetail'>;
type SevakJobDetailScreenNavigationProp = NativeStackNavigationProp<SevakStackParamList, 'JobDetail'>;

export const SevakJobDetailScreen = () => {
  const route = useRoute<SevakJobDetailScreenRouteProp>();
  const navigation = useNavigation<SevakJobDetailScreenNavigationProp>();
  const { jobId } = route.params;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkInOTP, setCheckInOTP] = useState('');

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const response = await sevakApi.getJobDetails(jobId);

      if (response.success && response.data) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Error loading job:', error);
      Alert.alert('Error', 'Unable to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInOTP || checkInOTP.length !== 6) {
      Alert.alert('Required', 'Please enter the 6-digit check-in OTP');
      return;
    }

    try {
      setActionLoading(true);
      await sevakApi.checkIn({
        bookingId: jobId,
        otp: checkInOTP,
      });

      Alert.alert('Success', 'Checked in successfully!');
      loadJobDetail();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    Alert.alert(
      'Check Out',
      'Are you sure you want to check out? Make sure you have completed the job.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          onPress: async () => {
            try {
              setActionLoading(true);
              await sevakApi.checkOut({ bookingId: jobId });

              Alert.alert('Success', 'Checked out successfully!');
              loadJobDetail();
            } catch (error: any) {
              Alert.alert('Error', 'Unable to check out. Please try again.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleNavigate = () => {
    if (job?.address) {
      const address = `${job.address.flatNumber}, ${job.address.building}, ${job.address.area}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    }
  };

  const handleCallResident = () => {
    if (job?.resident?.phoneNumber) {
      Linking.openURL(`tel:${job.resident.phoneNumber}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      'in-progress': '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium">Job not found</Text>
      </View>
    );
  }

  const canCheckIn = job.status === 'confirmed';
  const canCheckOut = job.status === 'in-progress';
  const isCompleted = job.status === 'completed';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerTop}>
              <View>
                <Text variant="labelSmall" style={styles.jobNumber}>
                  Job #{job.bookingNumber}
                </Text>
                <Text variant="headlineSmall" style={styles.serviceName}>
                  {job.service?.name || 'Service'}
                </Text>
              </View>
              <Chip
                mode="flat"
                style={{ backgroundColor: getStatusColor(job.status) + '20' }}
                textStyle={{ color: getStatusColor(job.status), fontWeight: '600' }}
              >
                {getStatusLabel(job.status)}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Schedule */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Schedule
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.icon}>📅</Text>
              <View style={styles.infoContent}>
                <Text variant="bodyLarge">
                  {new Date(job.scheduledDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            {job.scheduledTime && (
              <View style={styles.infoRow}>
                <Text style={styles.icon}>🕐</Text>
                <View style={styles.infoContent}>
                  <Text variant="bodyLarge">{job.scheduledTime}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Resident Info */}
        {job.resident && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Resident Information
              </Text>
              <View style={styles.residentInfo}>
                <View style={styles.residentAvatar}>
                  <Text variant="headlineSmall">👤</Text>
                </View>
                <View style={styles.residentDetails}>
                  <Text variant="titleMedium">{job.resident.fullName}</Text>
                  {job.resident.phoneNumber && (
                    <Text variant="bodyMedium" style={styles.residentContact}>
                      📞 {job.resident.phoneNumber}
                    </Text>
                  )}
                </View>
              </View>
              {job.resident.phoneNumber && (
                <Button
                  mode="outlined"
                  icon="phone"
                  onPress={handleCallResident}
                  style={styles.actionButton}
                >
                  Call Resident
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Address */}
        {job.address && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Service Address
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.icon}>📍</Text>
                <View style={styles.infoContent}>
                  <Text variant="bodyLarge">
                    {job.address.flatNumber}, {job.address.building}
                  </Text>
                  <Text variant="bodyMedium" style={styles.addressText}>
                    {job.address.area}
                  </Text>
                  {job.address.landmark && (
                    <Text variant="bodySmall" style={styles.landmarkText}>
                      Near {job.address.landmark}
                    </Text>
                  )}
                </View>
              </View>
              <Button
                mode="outlined"
                icon="navigation"
                onPress={handleNavigate}
                style={styles.actionButton}
              >
                Start Navigation
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Special Instructions */}
        {job.specialInstructions && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Special Instructions
              </Text>
              <Text variant="bodyMedium" style={styles.instructionsText}>
                {job.specialInstructions}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Check-in OTP */}
        {canCheckIn && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Check-In
              </Text>
              <Text variant="bodyMedium" style={styles.otpHelpText}>
                Ask the resident for the check-in OTP to start the job
              </Text>
              <TextInput
                label="Enter OTP"
                mode="outlined"
                value={checkInOTP}
                onChangeText={setCheckInOTP}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.otpInput}
              />
            </Card.Content>
          </Card>
        )}

        {/* Payment */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Payment
            </Text>
            <View style={styles.paymentRow}>
              <Text variant="bodyLarge">Service Charge</Text>
              <Text variant="titleLarge" style={styles.amount}>
                ₹{job.totalAmount}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      {(canCheckIn || canCheckOut) && (
        <View style={styles.bottomBar}>
          {canCheckIn && (
            <Button
              mode="contained"
              onPress={handleCheckIn}
              disabled={actionLoading || !checkInOTP}
              style={styles.bottomButton}
              contentStyle={styles.bottomButtonContent}
            >
              {actionLoading ? <ActivityIndicator color="#FFFFFF" /> : 'Check In'}
            </Button>
          )}
          {canCheckOut && (
            <Button
              mode="contained"
              onPress={handleCheckOut}
              disabled={actionLoading}
              style={styles.bottomButton}
              contentStyle={styles.bottomButtonContent}
            >
              {actionLoading ? <ActivityIndicator color="#FFFFFF" /> : 'Check Out'}
            </Button>
          )}
        </View>
      )}
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
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobNumber: {
    color: '#999999',
    marginBottom: 4,
  },
  serviceName: {
    fontWeight: 'bold',
    color: '#333333',
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  infoContent: {
    flex: 1,
  },
  residentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  residentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  residentDetails: {
    flex: 1,
  },
  residentContact: {
    color: '#666666',
    marginTop: 4,
  },
  addressText: {
    color: '#666666',
    marginTop: 4,
  },
  landmarkText: {
    color: '#999999',
    marginTop: 2,
  },
  instructionsText: {
    color: '#666666',
    lineHeight: 20,
  },
  otpHelpText: {
    color: '#666666',
    marginBottom: 12,
  },
  otpInput: {
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  actionButton: {
    marginTop: 12,
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
  bottomButton: {
    width: '100%',
  },
  bottomButtonContent: {
    paddingVertical: 8,
  },
});
