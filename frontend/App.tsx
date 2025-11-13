import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from './src/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Premium Gradient Header */}
      <LinearGradient
        colors={[theme.colors.primary[600], theme.colors.primary[500]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Urban Clean</Text>
          <Text style={styles.headerSubtitle}>Premium Service Booking</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Urban Clean</Text>
          <Text style={styles.welcomeText}>
            Your trusted platform for professional cleaning and maintenance services
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresGrid}>
          {/* Resident Card */}
          <View style={[styles.featureCard, { borderLeftColor: theme.colors.roles.resident.main }]}>
            <View style={[styles.iconBadge, { backgroundColor: theme.colors.roles.resident.light }]}>
              <Text style={[styles.iconText, { color: theme.colors.roles.resident.main }]}>🏠</Text>
            </View>
            <Text style={styles.featureTitle}>For Residents</Text>
            <Text style={styles.featureDescription}>
              Browse, book, and manage services with ease
            </Text>
          </View>

          {/* Sevak Card */}
          <View style={[styles.featureCard, { borderLeftColor: theme.colors.roles.sevak.main }]}>
            <View style={[styles.iconBadge, { backgroundColor: theme.colors.roles.sevak.light }]}>
              <Text style={[styles.iconText, { color: theme.colors.roles.sevak.main }]}>👨‍🔧</Text>
            </View>
            <Text style={styles.featureTitle}>For Sevaks</Text>
            <Text style={styles.featureDescription}>
              Manage jobs, track earnings, and grow your career
            </Text>
          </View>

          {/* Vendor Card */}
          <View style={[styles.featureCard, { borderLeftColor: theme.colors.roles.vendor.main }]}>
            <View style={[styles.iconBadge, { backgroundColor: theme.colors.roles.vendor.light }]}>
              <Text style={[styles.iconText, { color: theme.colors.roles.vendor.main }]}>🏢</Text>
            </View>
            <Text style={styles.featureTitle}>For Vendors</Text>
            <Text style={styles.featureDescription}>
              Expand your business and reach more customers
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1000+</Text>
            <Text style={styles.statLabel}>Happy Customers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>500+</Text>
            <Text style={styles.statLabel}>Skilled Sevaks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.8★</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>Ready to get started?</Text>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Launch Mobile App</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing[6],
    ...theme.shadows.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[2],
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[50],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[6],
  },
  welcomeSection: {
    marginBottom: theme.spacing[8],
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    paddingHorizontal: theme.spacing[4],
  },
  featuresGrid: {
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  },
  featureCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    borderLeftWidth: 4,
    ...theme.shadows.md,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  iconText: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[8],
    gap: theme.spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: theme.spacing[4],
  },
  ctaText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[5],
  },
  ctaButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing[8],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
  ctaButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.inverse,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});
