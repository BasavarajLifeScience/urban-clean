import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Avatar, List, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/api';

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
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text
              size={80}
              label={user?.fullName?.substring(0, 2).toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <Text variant="headlineSmall" style={styles.name}>
              {user?.fullName}
            </Text>
            <Text variant="bodyMedium" style={styles.role}>
              {getRoleLabel(user?.role || '')}
            </Text>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Contact Information
            </Text>

            <List.Item
              title="Email"
              description={user?.email}
              left={(props) => <List.Icon {...props} icon="email" />}
              style={styles.listItem}
            />

            <Divider />

            <List.Item
              title="Phone"
              description={user?.phoneNumber || 'Not provided'}
              left={(props) => <List.Icon {...props} icon="phone" />}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Profile Details */}
        {profile && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Profile Details
              </Text>

              {profile.address && (
                <>
                  <List.Item
                    title="Address"
                    description={`${profile.address.area || 'Not provided'}`}
                    left={(props) => <List.Icon {...props} icon="map-marker" />}
                    style={styles.listItem}
                  />
                  <Divider />
                </>
              )}

              {profile.dateOfBirth && (
                <>
                  <List.Item
                    title="Date of Birth"
                    description={new Date(profile.dateOfBirth).toLocaleDateString('en-IN')}
                    left={(props) => <List.Icon {...props} icon="cake" />}
                    style={styles.listItem}
                  />
                  <Divider />
                </>
              )}

              <List.Item
                title="Member Since"
                description={new Date(user?.createdAt || '').toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
                left={(props) => <List.Icon {...props} icon="calendar" />}
                style={styles.listItem}
              />
            </Card.Content>
          </Card>
        )}

        {/* Sevak-specific details */}
        {user?.role === 'sevak' && profile && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Professional Details
              </Text>

              {profile.skills && profile.skills.length > 0 && (
                <>
                  <List.Item
                    title="Skills"
                    description={profile.skills.join(', ')}
                    left={(props) => <List.Icon {...props} icon="account-hard-hat" />}
                    style={styles.listItem}
                  />
                  <Divider />
                </>
              )}

              {profile.experience && (
                <>
                  <List.Item
                    title="Experience"
                    description={`${profile.experience} years`}
                    left={(props) => <List.Icon {...props} icon="briefcase" />}
                    style={styles.listItem}
                  />
                  <Divider />
                </>
              )}

              <List.Item
                title="Verification Status"
                description={profile.verificationStatus || 'Pending'}
                left={(props) => <List.Icon {...props} icon="check-circle" />}
                style={styles.listItem}
              />
            </Card.Content>
          </Card>
        )}

        {/* Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Settings
            </Text>

            <List.Item
              title="Edit Profile"
              left={(props) => <List.Icon {...props} icon="pencil" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Coming Soon', 'Profile editing will be available soon');
              }}
              style={styles.listItem}
            />

            <Divider />

            <List.Item
              title="Notifications"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Coming Soon', 'Notification settings will be available soon');
              }}
              style={styles.listItem}
            />

            <Divider />

            <List.Item
              title="Help & Support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Coming Soon', 'Help & Support will be available soon');
              }}
              style={styles.listItem}
            />

            <Divider />

            <List.Item
              title="About"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Urban Clean', 'Society Service Booking App\nVersion 1.0.0');
              }}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#F44336"
        >
          Logout
        </Button>
      </ScrollView>
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
    paddingBottom: 32,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  role: {
    color: '#666666',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: '#F44336',
  },
});
