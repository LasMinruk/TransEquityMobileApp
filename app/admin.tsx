import { Colors } from '@/constants/theme';
import { useAuth, User } from '@/contexts/AuthContext';
import { deleteReview, getReviews, Review } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, IconButton, Searchbar, Switch, Text } from 'react-native-paper';

export default function AdminScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'reviews'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);

  const load = async () => {
    const raw = await AsyncStorage.getItem('users');
    const usersData = raw ? JSON.parse(raw) : [];
    setUsers(usersData);
    setFilteredUsers(usersData);
    const reviewsData = await getReviews();
    setReviews(reviewsData);
    setFilteredReviews(reviewsData);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      const filtered = reviews.filter(review => 
        review.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReviews(filtered);
    }
  }, [searchQuery, users, reviews, activeTab]);

  const toggleActive = async (target: User) => {
    const next = users.map((u) => (u.id === target.id ? { ...u, active: !u.active } : u));
    setUsers(next);
    setFilteredUsers(next);
    await AsyncStorage.setItem('users', JSON.stringify(next));
  };

  const removeReview = async (id: string) => {
    await deleteReview(id);
    Alert.alert('Review deleted');
    load();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus': return '🚌';
      case 'train': return '🚆';
      case 'tram': return '🚋';
      case 'ferry': return '⛴️';
      default: return '🚗';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text variant="headlineMedium" style={styles.unauthorizedText}>Admin Access Required</Text>
        <Text variant="bodyLarge" style={styles.unauthorizedSubtext}>Only administrators can access this page.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Admin Dashboard</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage users and reviews
        </Text>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users ({filteredUsers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Reviews ({filteredReviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder={`Search ${activeTab}...`}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      {/* Section: Users */}
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
            filteredUsers.map((user) => (
              <View key={user.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle}>{user.name}</Text>
                  <Switch 
                    value={user.active !== false} 
                    onValueChange={() => toggleActive(user)}
                    color={Colors.light.tint}
                  />
                </View>
                <Text style={styles.cardSub}>{user.email}</Text>
                <View style={styles.cardChipsRow}>
                  <Chip 
                    mode="outlined" 
                    compact 
                    style={[styles.roleChip, user.role === 'admin' && styles.adminChip]}
                  >
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.chipText}>
                      {user.role}
                    </Text>
                  </Chip>
                  <Chip 
                    mode="flat" 
                    compact 
                    style={[
                      styles.statusChip, 
                      user.active ? styles.activeChip : styles.inactiveChip
                    ]}
                  >
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.chipText}>
                      {user.active ? 'Active' : 'Inactive'}
                    </Text>
                  </Chip>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Section: Reviews */}
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
            filteredReviews.map((review) => (
              <View key={review.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle}>{review.city}</Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => removeReview(review.id)}
                    iconColor="#ef4444"
                  />
                </View>
                {/* Chips Row 1 */}
                <View style={styles.cardChipsRow}>
                  <Chip compact style={styles.vehicleChip}>
                    {getVehicleIcon(review.vehicleType)} {review.vehicleType}
                  </Chip>
                  <Chip compact style={styles.ratingChip}>
                    {'★'.repeat(review.rating)}
                  </Chip>
                </View>
                {/* Chips Row 2 */}
                <View style={styles.cardChipsRow}>
                  <Chip compact style={styles.userChip}>
                    {review.userId}
                  </Chip>
                  <Chip compact style={styles.dateChip}>
                    {formatDate(review.timestamp)}
                  </Chip>
                </View>
                <Text style={styles.cardReviewText} numberOfLines={2}>{review.reviewText}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  unauthorizedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  unauthorizedText: {
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  unauthorizedSubtext: {
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6b7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  searchBar: {
    marginHorizontal: 20,
    marginTop: 16,
    elevation: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#fafbfc',
  },
  cell: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  cellText: {
    fontSize: 14,
    color: '#374151',
  },
  // User table columns
  nameColumn: { flex: 2 },
  emailColumn: { flex: 2.5 },
  roleColumn: { flex: 1 },
  statusColumn: { flex: 1.2 },
  actionColumn: { flex: 0.8 },
  // Review table columns
  reviewCityColumn: { flex: 1.5 },
  reviewVehicleColumn: { flex: 1.5 },
  reviewRatingColumn: { flex: 1 },
  reviewUserColumn: { flex: 1.5 },
  reviewDateColumn: { flex: 1.5 },
  reviewActionColumn: { flex: 0.8 },
  roleChip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 4,
    alignSelf: 'flex-start',
    maxWidth: 90,
    overflow: 'hidden',
  },
  adminChip: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  statusChip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 4,
    alignSelf: 'flex-start',
    maxWidth: 90,
    overflow: 'hidden',
  },
  activeChip: {
    backgroundColor: '#d1fae5',
  },
  inactiveChip: {
    backgroundColor: '#fee2e2',
  },
  ratingText: {
    fontSize: 14,
    color: '#f59e0b',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardSub: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  cardChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,      // a bit more space between rows
    alignItems: 'flex-start', // make sure chips align at the top
  },
  cardReviewText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8, // increased from 2 for more space above the review text
  },
  vehicleChip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 2,    // smaller vertical padding
    paddingHorizontal: 8,  // add horizontal padding for space
    marginRight: 4,
    alignSelf: 'flex-start', // prevent stretching
  },
  ratingChip: {
    backgroundColor: '#fef3c7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 4,
    alignSelf: 'flex-start',
  },
  userChip: {
    backgroundColor: '#e0e7ef',
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 4,
    alignSelf: 'flex-start',
    maxWidth: 120,           // limit width
    overflow: 'hidden',
  },
  dateChip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 4,
    alignSelf: 'flex-start',
    maxWidth: 140,
    overflow: 'hidden',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});