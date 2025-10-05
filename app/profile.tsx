import { StarRatingWithValue } from '@/components/StarRating';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getReviews, Review } from '@/utils/storage';
import { getRelativeTime } from '@/utils/timeAgo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, Text } from 'react-native-paper';

export default function ProfileScreen() {
  const { user, refresh, logout } = useAuth();
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  
  // Enhanced responsive breakpoints
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 428;
  const isLargeScreen = width >= 428; // iPhone 16 Pro Max and larger
  const isTablet = width >= 768;

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const all = await getReviews();
    setMyReviews(all.filter((r) => r.userId === user.id));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus': return '🚌';
      case 'train': return '🚆';
      case 'tram': return '🚋';
      case 'ferry': return '⛴️';
      default: return '🚗';
    }
  };

  const getVehicleColor = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus': return '#3B82F6';
      case 'train': return '#8B5CF6';
      case 'tram': return '#F59E0B';
      case 'ferry': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled && user) {
      const next = { ...user, profileImageUri: res.assets[0].uri };
      const raw = await AsyncStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      const updated = users.map((u: any) => (u.id === user.id ? next : u));
      await AsyncStorage.setItem('users', JSON.stringify(updated));
      await AsyncStorage.setItem('currentUser', JSON.stringify(next));
      await refresh();
    }
  };

  if (!user) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text variant="headlineMedium" style={styles.unauthorizedText}>Please Login</Text>
        <Text variant="bodyLarge" style={styles.unauthorizedSubtext}>
          Please login to view your profile.
        </Text>
      </View>
    );
  }

  const stats = {
    totalReviews: myReviews.length,
    averageRating: myReviews.length > 0 
      ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length 
      : 0,
    vehicleTypes: [...new Set(myReviews.map(r => r.vehicleType))].length,
    cities: [...new Set(myReviews.map(r => r.city))].length,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[
      styles.contentContainer,
      isSmallScreen && styles.contentContainerSmall,
      isLargeScreen && styles.contentContainerLarge
    ]} showsVerticalScrollIndicator={false} refreshControl={
      <RefreshControl refreshing={loading} onRefresh={load} />
    }>
      {/* Profile Header */}
      <View style={[
        styles.header, 
        isSmallScreen && styles.headerSmall,
        isLargeScreen && styles.headerLarge,
        isTablet && styles.headerTablet
      ]}>
        <View style={[
          styles.profileSection,
          isSmallScreen && styles.profileSectionSmall
        ]}>
          <View style={styles.avatarContainer}>
            {user.profileImageUri ? (
              <Image
                source={{ uri: user.profileImageUri }}
                style={[
                  styles.avatar, 
                  isSmallScreen && styles.avatarSmall,
                  isLargeScreen && styles.avatarLarge,
                  isTablet && styles.avatarTablet
                ]}
              />
            ) : (
              <View style={[
                styles.avatar, 
                styles.avatarPlaceholder, 
                isSmallScreen && styles.avatarSmall,
                isLargeScreen && styles.avatarLarge,
                isTablet && styles.avatarTablet
              ]}>
                <Text style={[
                  styles.avatarText,
                  isSmallScreen && styles.avatarTextSmall,
                  isLargeScreen && styles.avatarTextLarge
                ]}>{getInitials(user.name)}</Text>
              </View>
            )}
            <TouchableOpacity style={[
              styles.editAvatarButton,
              isSmallScreen && styles.editAvatarButtonSmall,
              isLargeScreen && styles.editAvatarButtonLarge
            ]} onPress={pickImage}>
              <IconButton icon="camera" size={isSmallScreen ? 14 : 16} iconColor="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.userInfo,
            isSmallScreen && styles.userInfoSmall
          ]}>
            <Text variant="headlineSmall" style={[
              styles.userName, 
              isSmallScreen && styles.userNameSmall,
              isLargeScreen && styles.userNameLarge
            ]}>{user.name}</Text>
            <Text style={[
              styles.userEmail, 
              isSmallScreen && styles.userEmailSmall,
              isLargeScreen && styles.userEmailLarge
            ]}>{user.email}</Text>
            <View style={styles.roleContainer}>
              <Chip 
                compact 
                style={[
                  styles.roleChip, 
                  user.role === 'admin' ? styles.adminChip : styles.userChip,
                  isSmallScreen && styles.roleChipSmall
                ]}
                textStyle={[
                  styles.roleChipText,
                  isSmallScreen && styles.roleChipTextSmall
                ]}
              >
                {user.role === 'admin' ? '👑 Admin' : '👤 User'}
              </Chip>
            </View>
          </View>
        </View>
      </View>

      {/* --- Section: Your Activity --- */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionHeaderText}>Your Activity</Text>
      </View>
      <View style={styles.activitySectionGroup}>
        {/* Reviews */}
        <View style={styles.activitySubSection}>
          <Text style={styles.activitySubSectionTitle}>Reviews</Text>
          <Card style={[styles.statCard, styles.primaryCard]}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📝</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text numberOfLines={1} style={styles.statValue}>{stats.totalReviews}</Text>
                <Text numberOfLines={1} style={styles.statLabel}>Total Reviews</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
        {/* Ratings */}
        <View style={styles.activitySubSection}>
          <Text style={styles.activitySubSectionTitle}>Ratings</Text>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>⭐</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text numberOfLines={1} style={styles.secondaryStatValue}>{stats.averageRating.toFixed(1)}</Text>
                <Text numberOfLines={1} style={styles.secondaryStatLabel}>Avg Rating</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
        {/* Vehicle Types */}
        <View style={styles.activitySubSection}>
          <Text style={styles.activitySubSectionTitle}>Vehicles</Text>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>🚌</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text numberOfLines={1} style={styles.secondaryStatValue}>{stats.vehicleTypes}</Text>
                <Text numberOfLines={1} style={styles.secondaryStatLabel}>Vehicle Types</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
        {/* Cities */}
        <View style={styles.activitySubSection}>
          <Text style={styles.activitySubSectionTitle}>Cities</Text>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>🏙️</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text numberOfLines={1} style={styles.secondaryStatValue}>{stats.cities}</Text>
                <Text numberOfLines={1} style={styles.secondaryStatLabel}>Cities</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* --- Section: My Reviews --- */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionHeaderText}>My Reviews</Text>
      </View>
      <View style={[
        styles.reviewsSection, 
        isSmallScreen && styles.reviewsSectionSmall,
        isLargeScreen && styles.reviewsSectionLarge
      ]}>
        <View style={[
          styles.reviewsHeader,
          isSmallScreen && styles.reviewsHeaderSmall
        ]}>
          <Button
            mode="outlined"
            onPress={load}
            icon="refresh"
            style={[
              styles.refreshButton,
              isSmallScreen && styles.refreshButtonSmall
            ]}
            labelStyle={[
              styles.refreshButtonText,
              isSmallScreen && styles.refreshButtonTextSmall
            ]}
            compact
            loading={loading}
            disabled={loading}
          >
            Refresh
          </Button>
        </View>

        {loading ? (
          <View style={styles.loadingReviews}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
          </View>
        ) : myReviews.length > 0 ? (
          <View style={[
            styles.reviewsList,
            isSmallScreen && styles.reviewsListSmall
          ]}>
            {myReviews.map((review, index) => (
              <Card key={review.id} style={[
                styles.reviewCardBig, // Use bigger card style
                isSmallScreen && styles.reviewCardSmall,
                isLargeScreen && styles.reviewCardLarge,
                index === 0 && styles.firstReviewCard
              ]}>
                <Card.Content style={isSmallScreen && styles.reviewCardContentSmall}>
                  <View style={[
                    styles.reviewHeader,
                    isSmallScreen && styles.reviewHeaderSmall
                  ]}>
                    <View style={styles.reviewMeta}>
                      <View style={[
                        styles.reviewChipsRow, // NEW style for wrapping
                        isSmallScreen && styles.reviewChipsRowSmall
                      ]}>
                        <View style={styles.circleRow}>
                          <View style={[styles.transportCircle, { backgroundColor: getVehicleColor(review.vehicleType) }]}>
                            <Text style={styles.transportIcon}>{getVehicleIcon(review.vehicleType)}</Text>
                          </View>
                          <View style={styles.locationCircle}>
                            <IconButton icon="map-marker" size={14} iconColor="#3B82F6" style={styles.locationIconBtn} />
                            <Text style={styles.locationText}>{review.city}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.reviewRatingRow}>
                        <StarRatingWithValue 
                          rating={review.rating} 
                          size={isSmallScreen ? 14 : 16}
                        />
                        <Text style={styles.reviewRatingValue}>{review.rating.toFixed(1)}</Text>
                      </View>
                      <Text style={[
                        styles.reviewTime,
                        isSmallScreen && styles.reviewTimeSmall
                      ]}>{getRelativeTime(review.timestamp)}</Text>
                    </View>
                  </View>
                  
                  <Text style={[
                    styles.reviewText, 
                    isSmallScreen && styles.reviewTextSmall,
                    isLargeScreen && styles.reviewTextLarge
                  ]} numberOfLines={3}>
                    {review.reviewText}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={[
            styles.emptyStateCard,
            isSmallScreen && styles.emptyStateCardSmall
          ]}>
            <Card.Content style={[
              styles.emptyStateContent,
              isSmallScreen && styles.emptyStateContentSmall
            ]}>
              <Text style={[
                styles.emptyStateIcon,
                isSmallScreen && styles.emptyStateIconSmall
              ]}>📝</Text>
              <Text variant="titleMedium" style={[
                styles.emptyStateTitle,
                isSmallScreen && styles.emptyStateTitleSmall
              ]}>No Reviews Yet</Text>
              <Text style={[
                styles.emptyStateText,
                isSmallScreen && styles.emptyStateTextSmall
              ]}>
                Start sharing your transit experiences by writing your first review!
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Settings Section */}
      <View style={[
        styles.settingsSection,
        isSmallScreen && styles.settingsSectionSmall,
        isLargeScreen && styles.settingsSectionLarge
      ]}>
        <Text variant="titleMedium" style={[
          styles.sectionTitle,
          isSmallScreen && styles.sectionTitleSmall,
          isLargeScreen && styles.sectionTitleLarge
        ]}>Settings</Text>
        <Card style={[
          styles.settingsCard,
          isSmallScreen && styles.settingsCardSmall,
          isLargeScreen && styles.settingsCardLarge
        ]}>
          <Card.Content>
            <TouchableOpacity style={[
              styles.settingItem,
              isSmallScreen && styles.settingItemSmall
            ]}>
              <View style={styles.settingLeft}>
                <IconButton icon="camera" size={isSmallScreen ? 18 : 20} iconColor="#6b7280" />
                <View style={styles.settingText}>
                  <Text style={[
                    styles.settingTitle,
                    isSmallScreen && styles.settingTitleSmall
                  ]}>Change Profile Picture</Text>
                  <Text style={[
                    styles.settingSubtitle,
                    isSmallScreen && styles.settingSubtitleSmall
                  ]}>Update your avatar</Text>
                </View>
              </View>
              <IconButton icon="chevron-right" size={isSmallScreen ? 18 : 20} iconColor="#6b7280" />
            </TouchableOpacity>

            <Divider style={[
              styles.divider,
              isSmallScreen && styles.dividerSmall
            ]} />

            <TouchableOpacity style={[
              styles.settingItem,
              isSmallScreen && styles.settingItemSmall
            ]} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <IconButton icon="logout" size={isSmallScreen ? 18 : 20} iconColor="#ef4444" />
                <View style={styles.settingText}>
                  <Text style={[
                    styles.settingTitle, 
                    styles.logoutText,
                    isSmallScreen && styles.settingTitleSmall
                  ]}>Logout</Text>
                  <Text style={[
                    styles.settingSubtitle,
                    isSmallScreen && styles.settingSubtitleSmall
                  ]}>Sign out of your account</Text>
                </View>
              </View>
              <IconButton icon="chevron-right" size={isSmallScreen ? 18 : 20} iconColor="#6b7280" />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>

      <View style={[
        styles.bottomSpacing,
        isSmallScreen && styles.bottomSpacingSmall,
        isLargeScreen && styles.bottomSpacingLarge
      ]} />
    </ScrollView>
  );
}

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isLargeScreen = width >= 428;
const isTablet = width >= 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingReviews: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  contentContainerSmall: {
    paddingBottom: 16,
  },
  contentContainerLarge: {
    paddingBottom: 24,
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
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerSmall: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLarge: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  headerTablet: {
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileSectionSmall: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarTablet: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarTextSmall: {
    fontSize: 20,
  },
  avatarTextLarge: {
    fontSize: 28,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editAvatarButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  editAvatarButtonLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userInfo: {
    flex: 1,
  },
  userInfoSmall: {
    flex: 1,
    marginLeft: 8,
  },
  userName: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 24,
  },
  userNameSmall: {
    fontSize: 18,
    marginBottom: 2,
  },
  userNameLarge: {
    fontSize: 28,
  },
  userEmail: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  userEmailSmall: {
    fontSize: 12,
    marginBottom: 6,
  },
  userEmailLarge: {
    fontSize: 16,
  },
  roleContainer: {
    alignSelf: 'flex-start',
  },
  roleChip: {
    height: 28,
  },
  roleChipSmall: {
    height: 24,
  },
  adminChip: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  userChip: {
    backgroundColor: '#f3f4f6',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleChipTextSmall: {
    fontSize: 10,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  statsSectionSmall: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statsSectionLarge: {
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  statsSectionTablet: {
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  sectionTitle: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitleSmall: {
    fontSize: 16,
    marginBottom: 12,
  },
  sectionTitleLarge: {
    fontSize: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
  },
  sectionHeaderText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#111827',
  },
  activitySectionGroup: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 18,
  },
  activitySubSection: {
    marginBottom: 4,
  },
  activitySubSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    marginLeft: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsRow: {
    paddingRight: 8,
    gap: 12,
  },
  statsRowSmall: {
    gap: 8,
  },
  statsGridSmall: {
    gap: 8,
  },
  statsGridTablet: {
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#ffffff',
    
  },
  statCardSmall: {
    minWidth: 140,
    borderRadius: 12,
  },
  statCardLarge: {
    minWidth: '48%',
    borderRadius: 20,
  },
  primaryCard: {
    backgroundColor: Colors.light.tint,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statContentSmall: {
    padding: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIconContainerSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  secondaryIconContainer: {
    backgroundColor: '#f3f4f6',
  },
  statIcon: {
    fontSize: 20,
  },
  statIconSmall: {
    fontSize: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  statValueSmall: {
    fontSize: 16,
  },
  statValueLarge: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statLabelSmall: {
    fontSize: 10,
  },
  secondaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  secondaryStatValueSmall: {
    fontSize: 16,
  },
  secondaryStatValueLarge: {
    fontSize: 24,
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  secondaryStatLabelSmall: {
    fontSize: 10,
  },
  reviewsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  reviewsSectionSmall: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  reviewsSectionLarge: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsHeaderSmall: {
    marginBottom: 12,
  },
  refreshButton: {
    borderColor: Colors.light.tint,
  },
  refreshButtonSmall: {
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: Colors.light.tint,
    fontSize: 12,
  },
  refreshButtonTextSmall: {
    fontSize: 10,
  },
  reviewsList: {
    gap: 12,
  },
  reviewsListSmall: {
    gap: 8,
  },
  reviewCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reviewCardSmall: {
    borderRadius: 10,
  },
  reviewCardLarge: {
    borderRadius: 14,
  },
  reviewCardBig: {
    borderRadius: 22,           // bigger corners
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 18,           // more space between cards
    padding: 18,                // more padding inside
    minHeight: 150,             // taller card
  },
  reviewCardContentSmall: {
    padding: 12,
  },
  firstReviewCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewHeaderSmall: {
    marginBottom: 8,
  },
  reviewMeta: {
    flex: 1,
  },
  reviewChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  reviewChipsRowSmall: {
    gap: 8,
    marginBottom: 6,
  },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  transportCircle: {
    width: 40,                // bigger circle
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#3B82F6', // fallback color
  },
  transportIcon: {
    fontSize: 22,             // bigger emoji
    color: '#fff',
  },
  locationCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ef',
    borderRadius: 16,
    paddingHorizontal: 10,    // more space
    paddingVertical: 5,
    marginRight: 6,
  },
  locationIconBtn: {
    margin: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },
  locationText: {
    fontSize: 13,             // bigger text
    color: '#1e293b',
    marginLeft: 2,
    fontWeight: '600',
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reviewRatingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 2,
  },
  chipText: {
    fontSize: 11,              // smaller font
    fontWeight: '600',
    color: '#ffffff',
  },
  chipTextSmall: {
    fontSize: 10,
  },
  locationChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  locationChipTextSmall: {
    fontSize: 10,
  },
  reviewTime: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
  },
  reviewTimeSmall: {
    fontSize: 9,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  reviewText: {
    color: '#374151',
    fontSize: 16,               // was 14
    lineHeight: 22,             // was 20
  },
  reviewTextSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  reviewTextLarge: {
    fontSize: 16,
    lineHeight: 22,
  },
  emptyStateCard: {
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateCardSmall: {
    borderRadius: 10,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateContentSmall: {
    padding: 24,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateIconSmall: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyStateTitle: {
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateTitleSmall: {
    fontSize: 16,
    marginBottom: 6,
  },
  emptyStateText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateTextSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  settingsSectionSmall: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  settingsSectionLarge: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  settingsCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    backgroundColor: '#ffffff',
  },
  settingsCardSmall: {
    borderRadius: 10,
  },
  settingsCardLarge: {
    borderRadius: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingItemSmall: {
    paddingVertical: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 8,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  settingTitleSmall: {
    fontSize: 14,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingSubtitleSmall: {
    fontSize: 12,
  },
  logoutText: {
    color: '#ef4444',
  },
  divider: {
    marginVertical: 8,
  },
  dividerSmall: {
    marginVertical: 6,
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
  bottomSpacingSmall: {
    height: 24,
  },
  bottomSpacingLarge: {
    height: 60,
  },
});