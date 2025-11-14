import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SevakStackParamList } from '../../navigation/types';
import { sevakApi } from '../../services/api/sevak.api';
import { Job } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

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

  const handleCompleteJob = () => {
    setShowCompleteModal(true);
  };

  const handleSubmitCompletion = async () => {
    if (!completionNotes.trim()) {
      Alert.alert('Required', 'Please add completion notes');
      return;
    }

    Alert.alert(
      'Complete Job',
      'Are you sure you want to mark this job as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setActionLoading(true);

              const formData = new FormData();
              formData.append('completionNotes', completionNotes);

              await sevakApi.completeJob(jobId, formData);

              Alert.alert('Success', 'Job marked as completed!', [
                {
                  text: 'OK',
                  onPress: () => {
                    setShowCompleteModal(false);
                    loadJobDetail();
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Unable to complete job. Please try again.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: colors.warning,
      confirmed: colors.info,
      'in-progress': colors.secondary,
      completed: colors.success,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.gray[500];
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
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </LinearGradient>
    );
  }

  if (!job) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.centered}
      >
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.gray[400]} />
        <Text variant="titleMedium" style={styles.errorText}>
          Job not found
        </Text>
      </LinearGradient>
    );
  }

  const canCheckIn = job.status === 'assigned' || job.status === 'confirmed';
  const canCheckOut = job.status === 'in-progress';
  const canComplete = job.status === 'in-progress' && job.checkOutTime; // Can complete after checkout
  const isCompleted = job.status === 'completed';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium, colors.backgroundLight]}
        style={styles.gradient}
        locations={[0, 0.3, 1]}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Card */}
            <View style={styles.headerCard}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <View style={styles.headerLeft}>
                    <Text variant="labelSmall" style={styles.jobNumber}>
                      Job #{job.bookingNumber}
                    </Text>
                    <Text variant="headlineSmall" style={styles.serviceName}>
                      {job.service?.name || 'Service'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(job.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                      {getStatusLabel(job.status)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Schedule Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.cardIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={20}
                      color={colors.white}
                    />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Schedule
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color={colors.primary}
                  />
                  <Text variant="bodyLarge" style={styles.infoText}>
                    {new Date(job.scheduledDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                {job.scheduledTime && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text variant="bodyLarge" style={styles.infoText}>
                      {job.scheduledTime}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Resident Info Card */}
            {job.resident && (
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.info, '#1e40af']}
                      style={styles.cardIconBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={20}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Resident Information
                    </Text>
                  </View>
                  <View style={styles.residentInfo}>
                    <LinearGradient
                      colors={[colors.info, '#1e40af']}
                      style={styles.residentAvatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={32}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <View style={styles.residentDetails}>
                      <Text variant="titleMedium" style={styles.residentName}>
                        {job.resident.fullName}
                      </Text>
                      {job.resident.phoneNumber && (
                        <View style={styles.phoneRow}>
                          <MaterialCommunityIcons
                            name="phone"
                            size={14}
                            color={colors.gray[600]}
                          />
                          <Text variant="bodyMedium" style={styles.phoneText}>
                            {job.resident.phoneNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {job.resident.phoneNumber && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleCallResident}>
                      <LinearGradient
                        colors={[colors.success, '#047857']}
                        style={styles.actionButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <MaterialCommunityIcons
                          name="phone"
                          size={20}
                          color={colors.white}
                        />
                        <Text style={styles.actionButtonText}>Call Resident</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </View>
            )}

            {/* Address Card */}
            {job.address && (
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.error, '#b91c1c']}
                      style={styles.cardIconBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={20}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Service Address
                    </Text>
                  </View>
                  <View style={styles.addressContent}>
                    <Text variant="bodyLarge" style={styles.addressLine}>
                      {job.address.flatNumber}, {job.address.building}
                    </Text>
                    <Text variant="bodyMedium" style={styles.addressArea}>
                      {job.address.area}
                    </Text>
                    {job.address.landmark && (
                      <Text variant="bodySmall" style={styles.landmark}>
                        Near {job.address.landmark}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
                    <LinearGradient
                      colors={[colors.error, '#b91c1c']}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="navigation"
                        size={20}
                        color={colors.white}
                      />
                      <Text style={styles.actionButtonText}>Start Navigation</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* Special Instructions */}
            {job.specialInstructions && (
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.secondary, colors.secondaryDark]}
                      style={styles.cardIconBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="note-text"
                        size={20}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Special Instructions
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.instructionsText}>
                    {job.specialInstructions}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Check-in OTP */}
            {canCheckIn && (
              <View style={styles.card}>
                <LinearGradient
                  colors={[colors.white, colors.gray[50]]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={[colors.warning, '#c2410c']}
                      style={styles.cardIconBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="login"
                        size={20}
                        color={colors.white}
                      />
                    </LinearGradient>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Check-In
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.otpHelpText}>
                    Ask the resident for the 6-digit check-in OTP to start the job
                  </Text>
                  <TextInput
                    label="Enter OTP"
                    mode="outlined"
                    value={checkInOTP}
                    onChangeText={setCheckInOTP}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.otpInput}
                    outlineColor={colors.gray[300]}
                    activeOutlineColor={colors.primary}
                  />
                </LinearGradient>
              </View>
            )}

            {/* Payment Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={[colors.white, colors.gray[50]]}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={[colors.success, '#047857']}
                    style={styles.cardIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name="currency-inr"
                      size={20}
                      color={colors.white}
                    />
                  </LinearGradient>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Payment
                  </Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text variant="bodyLarge" style={styles.paymentLabel}>
                    Service Charge
                  </Text>
                  <Text variant="displaySmall" style={styles.paymentAmount}>
                    ₹{job.totalAmount}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          {(canCheckIn || canCheckOut || canComplete) && (
            <View style={styles.bottomBar}>
              {canCheckIn && (
                <TouchableOpacity
                  style={[styles.bottomButton, (!checkInOTP || actionLoading) && styles.buttonDisabled]}
                  onPress={handleCheckIn}
                  disabled={actionLoading || !checkInOTP}
                >
                  <LinearGradient
                    colors={(!checkInOTP || actionLoading) ? [colors.gray[400], colors.gray[500]] : [colors.primary, colors.primaryDark]}
                    style={styles.bottomButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="login"
                          size={20}
                          color={colors.white}
                        />
                        <Text style={styles.bottomButtonText}>Check In</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {canCheckOut && (
                <TouchableOpacity
                  style={[styles.bottomButton, actionLoading && styles.buttonDisabled]}
                  onPress={handleCheckOut}
                  disabled={actionLoading}
                >
                  <LinearGradient
                    colors={actionLoading ? [colors.gray[400], colors.gray[500]] : [colors.success, '#047857']}
                    style={styles.bottomButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="logout"
                          size={20}
                          color={colors.white}
                        />
                        <Text style={styles.bottomButtonText}>Check Out</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {canComplete && (
                <TouchableOpacity
                  style={[styles.bottomButton, actionLoading && styles.buttonDisabled]}
                  onPress={handleCompleteJob}
                  disabled={actionLoading}
                >
                  <LinearGradient
                    colors={actionLoading ? [colors.gray[400], colors.gray[500]] : [colors.primary, colors.primaryDark]}
                    style={styles.bottomButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={colors.white}
                        />
                        <Text style={styles.bottomButtonText}>Complete Job</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* Complete Job Modal */}
      {showCompleteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Complete Job
              </Text>
              <TouchableOpacity onPress={() => setShowCompleteModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text variant="bodyMedium" style={styles.modalLabel}>
                Completion Notes <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                label="Add notes about the work completed"
                mode="outlined"
                value={completionNotes}
                onChangeText={setCompletionNotes}
                multiline
                numberOfLines={4}
                style={styles.notesInput}
                outlineColor={colors.gray[300]}
                activeOutlineColor={colors.primary}
                placeholder="Describe what was done, any issues encountered, etc."
              />

              <Text variant="bodySmall" style={styles.helpText}>
                Provide a brief summary of the work completed. You can add photos later if needed.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowCompleteModal(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, (!completionNotes.trim() || actionLoading) && styles.buttonDisabled]}
                onPress={handleSubmitCompletion}
                disabled={!completionNotes.trim() || actionLoading}
              >
                <LinearGradient
                  colors={(!completionNotes.trim() || actionLoading) ? [colors.gray[400], colors.gray[500]] : [colors.primary, colors.primaryDark]}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.modalButtonPrimaryText}>Mark Complete</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  jobNumber: {
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  serviceName: {
    fontWeight: '800',
    color: colors.gray[900],
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
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
  cardIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.gray[900],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    color: colors.gray[700],
  },
  residentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  residentAvatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  residentDetails: {
    flex: 1,
  },
  residentName: {
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    color: colors.gray[600],
  },
  addressContent: {
    marginBottom: spacing.md,
  },
  addressLine: {
    color: colors.gray[900],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  addressArea: {
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  landmark: {
    color: colors.gray[500],
  },
  instructionsText: {
    color: colors.gray[700],
    lineHeight: 22,
  },
  otpHelpText: {
    color: colors.gray[600],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  otpInput: {
    backgroundColor: colors.white,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    color: colors.gray[700],
  },
  paymentAmount: {
    color: colors.primary,
    fontWeight: '800',
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  bottomButton: {
    marginBottom: spacing.sm,
  },
  bottomButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.lg,
  },
  bottomButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontWeight: '700',
    color: colors.gray[900],
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalLabel: {
    color: colors.gray[700],
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  required: {
    color: colors.error,
  },
  notesInput: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  helpText: {
    color: colors.gray[500],
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  modalButtonSecondary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  modalButtonSecondaryText: {
    color: colors.gray[700],
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonPrimary: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  modalButtonPrimaryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
