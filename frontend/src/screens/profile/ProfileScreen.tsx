import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Avatar, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/api/user.api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface ListItemProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
  showChevron?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ icon, title, description, onPress, showChevron }) => (
  <TouchableOpacity
    style={styles.listItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.listItemLeft}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.listItemContent}>
        <Text variant="bodyMedium" style={styles.listItemTitle}>
          {title}
        </Text>
        <Text variant="bodySmall" style={styles.listItemDescription}>
          {description}
        </Text>
      </View>
    </View>
    {showChevron && (
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray[400]} />
    )}
  </TouchableOpacity>
);

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userApi.getProfile();

      if (response.success && response.data) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      resident: 'Resident',
      sevak: 'Service Provider',
      vendor: 'Vendor',
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundMedium]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Header with Gradient */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {user?.fullName?.substring(0, 2).toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              </View>
              <Text variant="headlineSmall" style={styles.name}>
                {user?.fullName}
              </Text>
              <Text variant="bodyMedium" style={styles.role}>
                {getRoleLabel(user?.role || '')}
              </Text>
            </View>

            {/* Contact Information Card */}
            <View style={styles.card}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Contact Information
              </Text>

              <ListItem
                icon="email"
                title="Email"
                description={user?.email || 'Not provided'}
              />

              <Divider style={styles.divider} />

              <ListItem
                icon="phone"
                title="Phone"
                description={user?.phoneNumber || 'Not provided'}
              />
            </View>

            {/* Profile Details Card */}
            {profile && (
              <View style={styles.card}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Profile Details
                </Text>

                {profile.address && (
                  <>
                    <ListItem
                      icon="map-marker"
                      title="Address"
                      description={profile.address.area || 'Not provided'}
                    />
                    <Divider style={styles.divider} />
                  </>
                )}

                {profile.dateOfBirth && (
                  <>
                    <ListItem
                      icon="cake"
                      title="Date of Birth"
                      description={new Date(profile.dateOfBirth).toLocaleDateString('en-IN')}
                    />
                    <Divider style={styles.divider} />
                  </>
                )}

                <ListItem
                  icon="calendar"
                  title="Member Since"
                  description={new Date(user?.createdAt || '').toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                />
              </View>
            )}

            {/* Sevak-specific details */}
            {user?.role === 'sevak' && profile && (
              <View style={styles.card}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Professional Details
                </Text>

                {profile.skills && profile.skills.length > 0 && (
                  <>
                    <ListItem
                      icon="account-hard-hat"
                      title="Skills"
                      description={profile.skills.join(', ')}
                    />
                    <Divider style={styles.divider} />
                  </>
                )}

                {profile.experience && (
                  <>
                    <ListItem
                      icon="briefcase"
                      title="Experience"
                      description={`${profile.experience} years`}
                    />
                    <Divider style={styles.divider} />
                  </>
                )}

                <ListItem
                  icon="check-circle"
                  title="Verification Status"
                  description={profile.verificationStatus || 'Pending'}
                />
              </View>
            )}

            {/* Settings Card */}
            <View style={styles.card}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Settings
              </Text>

              <ListItem
                icon="pencil"
                title="Edit Profile"
                description="Update your personal information"
                onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
                showChevron
              />

              <Divider style={styles.divider} />

              <ListItem
                icon="bell"
                title="Notifications"
                description="Manage your notification preferences"
                onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
                showChevron
              />

              <Divider style={styles.divider} />

              <ListItem
                icon="help-circle"
                title="Help & Support"
                description="Get help and support"
                onPress={() => Alert.alert('Coming Soon', 'Help & Support will be available soon')}
                showChevron
              />

              <Divider style={styles.divider} />

              <ListItem
                icon="information"
                title="About"
                description="Urban Clean v1.0.0"
                onPress={() => Alert.alert('Urban Clean', 'Society Service Booking App\nVersion 1.0.0')}
                showChevron
              />
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
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
    backgroundColor: colors.backgroundDark,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  name: {
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  role: {
    color: colors.gray[300],
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...shadows.xl,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: colors.gray[900],
    fontWeight: '600',
    marginBottom: 2,
  },
  listItemDescription: {
    color: colors.gray[600],
    lineHeight: 18,
  },
  divider: {
    marginVertical: spacing.xs,
    backgroundColor: colors.gray[200],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: colors.error,
    ...shadows.sm,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: spacing.sm,
  },
});
