import { Colors } from '@/constants/theme';
import { useAuth, User } from '@/contexts/AuthContext';
import { deleteReview, getReviews, Review } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { Chip, IconButton, Searchbar, Switch, Text } from 'react-native-paper';

export default function AdminScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'reviews'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [liveStats, setLiveStats] = useState({
    activeUsers: 0,
    totalReviews: 0,
    spamWarnings: 0,
    recentActivity: 0
  });

  const load = async () => {
    const raw = await AsyncStorage.getItem('users');
    const usersData = raw ? JSON.parse(raw) : [];
    setUsers(usersData);
    setFilteredUsers(usersData);
    const reviewsData = await getReviews();
    setReviews(reviewsData);
    setFilteredReviews(reviewsData);
    
    // Calculate live statistics
    setTimeout(() => {
      calculateLiveStats();
    }, 100);
  };

  useEffect(() => {
    load();
  }, []);

  // Update live stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      calculateLiveStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [users, reviews]);

  useEffect(() => {
    if (activeTab === 'users') {
      const filtered = users.filter(
        u =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      const filtered = reviews.filter(
        r =>
          r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReviews(filtered);
    }
  }, [searchQuery, users, reviews, activeTab]);

  const toggleActive = async (target: User) => {
    const next = users.map(u => (u.id === target.id ? { ...u, active: !u.active } : u));
    setUsers(next);
    setFilteredUsers(next);
    await AsyncStorage.setItem('users', JSON.stringify(next));
  };

  const removeReview = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReview(id);
          Alert.alert('Review deleted');
          load();
        },
      },
    ]);
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  // Function to get user name from user ID
  const getUserName = (userId: string): string => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : `User ${userId.slice(-4)}`; // Show last 4 digits if user not found
  };

  // Function to calculate live statistics
  const calculateLiveStats = () => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    // Active users (users who have been active in the last hour)
    const activeUsers = users.filter(u => u.active).length;
    
    // Total reviews
    const totalReviews = reviews.length;
    
    // Recent activity (reviews in last hour)
    const recentActivity = reviews.filter(r => r.timestamp > oneHourAgo).length;
    
    // Spam detection logic
    const spamWarnings = detectSpamUsers();
    
    setLiveStats({
      activeUsers,
      totalReviews,
      spamWarnings,
      recentActivity
    });
  };

  // Function to detect potential spam users
  const detectSpamUsers = (): number => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Group reviews by user ID
    const userReviewCounts = reviews.reduce((acc, review) => {
      acc[review.userId] = (acc[review.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group recent reviews by user ID
    const recentUserReviewCounts = reviews
      .filter(r => r.timestamp > oneHourAgo)
      .reduce((acc, review) => {
        acc[review.userId] = (acc[review.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    let spamWarnings = 0;
    
    // Check for spam patterns
    Object.entries(recentUserReviewCounts).forEach(([userId, count]) => {
      // Flag users with more than 5 reviews in the last hour
      if (count > 5) {
        spamWarnings++;
      }
      
      // Flag users with very short reviews (potential spam)
      const userReviews = reviews.filter(r => r.userId === userId && r.timestamp > oneHourAgo);
      const shortReviews = userReviews.filter(r => r.reviewText.length < 10);
      if (shortReviews.length > 3) {
        spamWarnings++;
      }
    });

    return spamWarnings;
  };

  // Get spam users for display
  const getSpamUsers = (): Array<{userId: string, userName: string, reason: string}> => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const spamUsers: Array<{userId: string, userName: string, reason: string}> = [];
    
    // Group recent reviews by user ID
    const recentUserReviewCounts = reviews
      .filter(r => r.timestamp > oneHourAgo)
      .reduce((acc, review) => {
        acc[review.userId] = (acc[review.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(recentUserReviewCounts).forEach(([userId, count]) => {
      if (count > 5) {
        spamUsers.push({
          userId,
          userName: getUserName(userId),
          reason: `Posted ${count} reviews in the last hour`
        });
      }
      
      // Check for short reviews
      const userReviews = reviews.filter(r => r.userId === userId && r.timestamp > oneHourAgo);
      const shortReviews = userReviews.filter(r => r.reviewText.length < 10);
      if (shortReviews.length > 3) {
        spamUsers.push({
          userId,
          userName: getUserName(userId),
          reason: `Posted ${shortReviews.length} very short reviews`
        });
      }
    });

    return spamUsers;
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus':
        return '🚌';
      case 'train':
        return '🚆';
      case 'tram':
        return '🚋';
      case 'ferry':
        return '⛴️';
      default:
        return '🚗';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text variant="headlineMedium" style={styles.unauthorizedText}>
          Admin Access Required
        </Text>
        <Text variant="bodyLarge" style={styles.unauthorizedSubtext}>
          Only administrators can access this page.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Admin Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage users and reviews
        </Text>
      </View>

      {/* Live Statistics */}
      <View style={styles.statsContainer}>
        <Text variant="titleMedium" style={styles.statsTitle}>📊 Live Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text variant="headlineSmall" style={styles.statNumber}>{liveStats.activeUsers}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Active Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineSmall" style={styles.statNumber}>{liveStats.totalReviews}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineSmall" style={[styles.statNumber, styles.recentActivityNumber]}>{liveStats.recentActivity}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Recent Activity</Text>
          </View>
          <View style={[styles.statCard, liveStats.spamWarnings > 0 && styles.spamWarningCard]}>
            <Text variant="headlineSmall" style={[styles.statNumber, liveStats.spamWarnings > 0 && styles.spamWarningNumber]}>
              {liveStats.spamWarnings}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Spam Warnings</Text>
          </View>
        </View>
      </View>

      {/* Spam Warnings Section */}
      {liveStats.spamWarnings > 0 && (
        <View style={styles.spamWarningsContainer}>
          <Text variant="titleMedium" style={styles.spamWarningsTitle}>⚠️ Spam User Warnings</Text>
          {getSpamUsers().map((spamUser, index) => (
            <View key={index} style={styles.spamWarningItem}>
              <View style={styles.spamWarningHeader}>
                <Text variant="bodyLarge" style={styles.spamUserName}>{spamUser.userName}</Text>
                <Chip compact style={styles.spamWarningChip}>
                  <Text style={styles.spamWarningChipText}>SPAM</Text>
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.spamWarningReason}>{spamUser.reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}>
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users ({filteredUsers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}>
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Reviews ({filteredReviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <Searchbar
        placeholder={`Search ${activeTab}...`}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* USERS SECTION */}
      {activeTab === 'users' && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Users</Text>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery ? 'No users found matching your search.' : 'No users found.'}
              </Text>
            </View>
          ) : (
            filteredUsers.map(u => (
              <View key={u.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle}>{u.name}</Text>
                  <Switch
                    value={u.active !== false}
                    onValueChange={() => toggleActive(u)}
                    color={Colors.light.tint}
                  />
                </View>
                <Text style={styles.cardSub}>{u.email}</Text>
                <View style={styles.cardChipsRow}>
                  <Chip mode="outlined" compact style={[styles.roleChip, u.role === 'admin' && styles.adminChip]}>
                    <Text style={styles.chipText}>{u.role}</Text>
                  </Chip>
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.statusChip, u.active ? styles.activeChip : styles.inactiveChip]}>
                    <Text style={styles.chipText}>{u.active ? 'Active' : 'Inactive'}</Text>
                  </Chip>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* REVIEWS SECTION (Improved UI) */}
      {activeTab === 'reviews' && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Reviews</Text>
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery ? 'No reviews found matching your search.' : 'No reviews found.'}
              </Text>
            </View>
          ) : (
            filteredReviews.map(review => (
              <Animated.View
                key={review.id}
                style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.cityText}>{review.city}</Text>
                    <Text style={styles.dateText}>{formatDate(review.timestamp)}</Text>
                  </View>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => removeReview(review.id)}
                    iconColor="#ef4444"
                  />
                </View>

                <View style={styles.reviewDetails}>
                  <Chip style={styles.vehicleChip}>
                    <Text style={styles.vehicleText}>
                      {getVehicleIcon(review.vehicleType)} {review.vehicleType}
                    </Text>
                  </Chip>
                </View>

                <Text style={styles.reviewBody} numberOfLines={3}>
                  {review.reviewText}
                </Text>

                <View style={styles.reviewFooter}>
                  <Chip compact style={styles.userChip}>
                    <Text style={styles.userText}>{getUserName(review.userId)}</Text>
                  </Chip>
                </View>
              </Animated.View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingBottom: 40 },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { color: '#111827', fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#6b7280' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: { backgroundColor: Colors.light.tint },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  activeTabText: { color: '#fff' },
  searchBar: {
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  section: { paddingHorizontal: 16 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginLeft: 4,
  },

  /* ---------- REVIEW CARDS ---------- */
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    transform: [{ scale: 1 }],
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  dateText: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  reviewDetails: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  vehicleChip: { backgroundColor: '#dbeafe' },
  ratingChip: { backgroundColor: '#fef9c3' },
  vehicleText: { color: '#1e40af', fontWeight: '600' },
  ratingText: { color: '#f59e0b', fontWeight: '700' },
  reviewBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 4,
  },
  reviewFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  userChip: { backgroundColor: '#e0f2fe' },
  userText: { color: '#0369a1', fontWeight: '600' },

  /* ---------- USERS ---------- */
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  cardChipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  roleChip: { backgroundColor: '#f3f4f6' },
  adminChip: { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
  statusChip: { backgroundColor: '#d1fae5' },
  activeChip: { backgroundColor: '#d1fae5' },
  inactiveChip: { backgroundColor: '#fee2e2' },
  chipText: { fontSize: 12, fontWeight: '600' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6b7280', textAlign: 'center' },
  unauthorizedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  unauthorizedText: { color: '#ef4444', marginBottom: 8 },
  unauthorizedSubtext: { color: '#6b7280' },

  // Live Statistics Styles
  statsContainer: {
    backgroundColor: '#f8fafc',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statsTitle: {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '48%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: 24,
  },
  statLabel: {
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  recentActivityNumber: {
    color: '#059669',
  },
  spamWarningCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  spamWarningNumber: {
    color: '#dc2626',
  },
  // Spam Warnings Styles
  spamWarningsContainer: {
    backgroundColor: '#fef2f2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  spamWarningsTitle: {
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  spamWarningItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  spamWarningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  spamUserName: {
    fontWeight: '600',
    color: '#1e293b',
  },
  spamWarningChip: {
    backgroundColor: '#dc2626',
  },
  spamWarningChipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  spamWarningReason: {
    color: '#7f1d1d',
    fontStyle: 'italic',
  },
});
