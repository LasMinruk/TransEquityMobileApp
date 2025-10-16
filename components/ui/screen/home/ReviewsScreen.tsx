import { StarRatingInput, StarRatingWithValue } from '@/components/StarRating';
import { COLORS } from '@/constants/CollorPallet';
import { useAuth, User } from '@/contexts/AuthContext';
import { Review, addReview, canEditOrDelete, deleteReview, getReviews, getUsersRaw, updateReview } from '@/utils/storage';
import { getRelativeTime } from '@/utils/timeAgo';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, FAB, IconButton, Text, TextInput } from 'react-native-paper';


const VEHICLES = ['bus', 'train', 'tuk tuk', 'bicycle', 'other'] as const;
const LK_CITIES = [
  'Colombo','Kandy','Galle','Gampaha','Negombo','Jaffna','Matara','Anuradhapura','Badulla','Batticaloa',
  'Ratnapura','Trincomalee','Kurunegala','Polonnaruwa','Nuwara Eliya','Kalutara','Hambantota','Kegalle',
  'Monaragala','Vavuniya','Mannar','Kilinochchi','Mullaitivu','Matale','Puttalam'
];


export default function ReviewsScreen() {
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [vehicleType, setVehicleType] = useState<'bus' | 'train' | 'tuk tuk' | 'bicycle' | 'other'>('bus');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editing, setEditing] = useState<Review | null>(null);
  const [data, setData] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Review[]>([]);
  
  const citySuggestions = React.useMemo(() => {
    const q = city.trim().toLowerCase();
    if (!q) return LK_CITIES.slice(0, 10);
    return LK_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 10);
  }, [city]);

  // Function to get user name from user ID
  const getUserName = (userId: string): string => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : `User ${userId.slice(-4)}`; // Show last 4 digits if user not found
  };

  // Function to get user data from user ID
  const getUserData = (userId: string): User | null => {
    return users.find(u => u.id === userId) || null;
  };

  // Function to handle profile picture click
  const handleProfileClick = (userId: string) => {
    const userData = getUserData(userId);
    if (userData) {
      setSelectedUser(userData);
      setShowUserProfile(true);
    }
  };

  // Function to close user profile modal
  const closeUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };


  async function refresh() {
    const list = await getReviews();
    setData(list);
    setFilteredData(list);
    
    // Load users data
    try {
      const usersList = await getUsersRaw<User[]>();
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }


  useEffect(() => {
    refresh();
  }, []);


  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(review => 
        review.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewText.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);


  const submit = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please login to submit a review.');
      return;
    }
    const base = {
      city: city.trim(),
      vehicleType,
      rating: rating,
      reviewText: reviewText.trim(),
      userId: user.id,
    };
    if (editing) {
      if (!canEditOrDelete(editing.timestamp)) {
        Alert.alert("You can't edit after 15 mins");
        setEditing(null);
        return;
      }
      const updated: Review = { ...editing, ...base };
      await updateReview(updated);
      Alert.alert('Review updated!');
      setEditing(null);
    } else {
      await addReview(base);
      Alert.alert('Review submitted!');
    }
    setCity('');
    setVehicleType('bus');
    setRating(5);
    setReviewText('');
    setShowModal(false);
    refresh();
  };


  const onEdit = (r: Review) => {
    if (!canEditOrDelete(r.timestamp)) {
      Alert.alert("You can't edit after 15 mins");
      return;
    }
    setEditing(r);
    setCity(r.city);
    setVehicleType(r.vehicleType);
    setRating(r.rating);
    setReviewText(r.reviewText);
    setShowModal(true);
  };


  const openAddModal = () => {
    setEditing(null);
    setCity('');
    setVehicleType('bus');
    setRating(5);
    setReviewText('');
    setShowModal(true);
  };


  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };


  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus': return '🚌';
      case 'train': return '🚆';
      case 'tuk tuk': return '🛺';
      case 'bicycle': return '🚲';
      default: return '🚗';
    }
  };


  const getVehicleColor = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus': return '#dbeafe'; // Light blue background
      case 'train': return '#e9d5ff'; // Light purple background
      case 'tuk tuk': return '#fed7aa'; // Light orange background
      case 'bicycle': return '#cffafe'; // Light cyan background
      default: return '#f3f4f6'; // Light gray background
    }
  };

  const getVehicleTextColor = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus': return '#1e40af'; // Dark blue text
      case 'train': return '#6b21a8'; // Dark purple text
      case 'tuk tuk': return '#c2410c'; // Dark orange text
      case 'bicycle': return '#0e7490'; // Dark cyan text
      default: return '#374151'; // Dark gray text
    }
  };


  const onDelete = async (r: Review) => {
    if (!user || (user.role !== 'admin' && user.id !== r.userId)) return;
    if (!canEditOrDelete(r.timestamp) && user.role !== 'admin') {
      Alert.alert("You can't delete after 15 mins");
      return;
    }
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteReview(r.id);
          Alert.alert('Review deleted');
          refresh();
        } },
      ]
    );
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Reviews</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Share your transit experiences
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Search reviews..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      {/* Reviews List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <Card style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewMeta}>
                  <View style={styles.chipContainer}>
                    <Chip 
                      compact 
                      style={[styles.vehicleChip, { backgroundColor: getVehicleColor(item.vehicleType) }]}
                      textStyle={[styles.chipText, { color: getVehicleTextColor(item.vehicleType) }]}
                    >
                      <Text>{getVehicleIcon(item.vehicleType)} {item.vehicleType}</Text>
                    </Chip>
                    <Chip 
                      compact 
                      style={styles.locationChip}
                      textStyle={styles.locationChipText}
                      icon="map-marker"
                    >
                      <Text>{item.city}</Text>
                    </Chip>
                  </View>
                  <Text style={styles.reviewTime}>{getRelativeTime(item.timestamp)}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <StarRatingWithValue 
                    rating={item.rating} 
                    size={18}
                  />
                </View>
              </View>
              
              <Text style={styles.reviewText} numberOfLines={3}>
                {item.reviewText}
              </Text>
              
              <View style={styles.reviewFooter}>
                <TouchableOpacity 
                  style={styles.userProfileContainer}
                  onPress={() => handleProfileClick(item.userId)}
                >
                  <View style={styles.profilePictureContainer}>
                    {getUserData(item.userId)?.profileImageUri ? (
                      <Image 
                        source={{ uri: getUserData(item.userId)?.profileImageUri! }}
                        style={styles.profilePicture}
                      />
                    ) : (
                      <View style={styles.defaultProfilePicture}>
                        <Text style={styles.defaultProfileText}>
                          {getUserName(item.userId).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reviewUser}>by {getUserName(item.userId)}</Text>
                </TouchableOpacity>
                <View style={styles.reviewActions}>
                  {canEditOrDelete(item.timestamp) && (
                    <IconButton
                      icon="pencil"
                      size={18}
                      iconColor="#6b7280"
                      onPress={() => onEdit(item)}
                    />
                  )}
                  {canEditOrDelete(item.timestamp) && (
                    <IconButton
                      icon="delete"
                      size={18}
                      iconColor="#ef4444"
                      onPress={() => onDelete(item)}
                    />
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text variant="titleMedium" style={styles.emptyStateTitle}>
              {searchQuery ? 'No reviews found' : 'No reviews yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Be the first to share your transit experience!'
              }
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Button
          mode="contained"
          icon="plus"
          style={styles.fab}
          labelStyle={styles.fabLabel}
          onPress={openAddModal}
        >
          Add Review
        </Button>
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {editing ? 'Edit Review' : 'Add Review'}
            </Text>
            <IconButton
              icon="close"
              onPress={closeModal}
              iconColor="#6b7280"
            />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              <TextInput
                mode="outlined"
                label="City"
                value={city}
                onChangeText={setCity}
                style={styles.input}
                placeholder="Enter city name"
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsRow}
              >
                {citySuggestions.map((c) => (
                  <Chip key={c} compact style={styles.suggestionChip} onPress={() => setCity(c)}>
                    <Text>{c}</Text>
                  </Chip>
                ))}
              </ScrollView>

              <View style={styles.vehicleSection}>
                <Text style={styles.sectionLabel}>Vehicle Type</Text>
                <View style={styles.vehicleChips}>
                  {VEHICLES.map((vehicle) => (
                    <Chip
                      key={vehicle}
                      selected={vehicleType === vehicle}
                      onPress={() => setVehicleType(vehicle)}
                      style={[
                        styles.vehicleChipOption,
                        vehicleType === vehicle && { backgroundColor: getVehicleColor(vehicle) }
                      ]}
                      textStyle={[
                        styles.vehicleChipText,
                        { color: getVehicleTextColor(vehicle) }
                      ]}
                    >
                      <Text>{getVehicleIcon(vehicle)} {vehicle}</Text>
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.ratingSection}>
                <Text style={styles.sectionLabel}>Rating</Text>
                <View style={styles.ratingInput}>
                  <StarRatingInput
                    rating={rating}
                    size={32}
                    onRatingChange={setRating}
                    showValue={true}
                    textStyle={styles.ratingText}
                  />
                </View>
                <View style={styles.ratingButtons}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={[
                        styles.ratingButton,
                        rating >= star && styles.ratingButtonActive
                      ]}
                    >
                      <Text style={[
                        styles.ratingButtonText,
                        rating >= star && styles.ratingButtonTextActive
                      ]}>
                        {star}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                mode="outlined"
                label="Your Review"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                placeholder="Share your transit experience..."
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={closeModal}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={submit}
                  style={styles.submitButton}
                  labelStyle={styles.submitButtonText}
                  disabled={!city.trim() || !reviewText.trim()}
                >
                  {editing ? 'Update Review' : 'Submit Review'}
                </Button>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* User Profile Modal */}
      <Modal
        visible={showUserProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeUserProfile}
      >
        <View style={styles.userProfileModal}>
          <View style={styles.userProfileHeader}>
            <TouchableOpacity onPress={closeUserProfile} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.userProfileTitle}>User Profile</Text>
            <View style={styles.placeholder} />
          </View>
          
          {selectedUser && (
            <ScrollView style={styles.userProfileContent}>
              <View style={styles.userProfileInfo}>
                <View style={styles.userProfilePictureContainer}>
                  {selectedUser.profileImageUri ? (
                    <Image 
                      source={{ uri: selectedUser.profileImageUri }}
                      style={styles.userProfilePicture}
                    />
                  ) : (
                    <View style={styles.userDefaultProfilePicture}>
                      <Text style={styles.userDefaultProfileText}>
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.userProfileName}>{selectedUser.name}</Text>
                <Text style={styles.userProfileEmail}>{selectedUser.email}</Text>
                
                <View style={styles.userProfileBadges}>
                  <Chip 
                    style={[styles.roleChip, selectedUser.role === 'admin' && styles.adminChip]}
                    textStyle={styles.roleChipText}
                  >
                    {selectedUser.role.toUpperCase()}
                  </Chip>
                  <Chip 
                    style={[styles.statusChip, selectedUser.active ? styles.activeChip : styles.inactiveChip]}
                    textStyle={styles.statusChipText}
                  >
                    {selectedUser.active ? 'ACTIVE' : 'INACTIVE'}
                  </Chip>
                </View>
              </View>

              <View style={styles.userReviewsSection}>
                <Text style={styles.userReviewsTitle}>User Reviews</Text>
                {data.filter(review => review.userId === selectedUser.id).map((review, index) => (
                  <Card key={index} style={styles.userReviewCard}>
                    <Card.Content>
                      <View style={styles.userReviewHeader}>
                        <Chip 
                          compact 
                          style={[styles.vehicleChip, { backgroundColor: getVehicleColor(review.vehicleType) }]}
                          textStyle={[styles.chipText, { color: getVehicleTextColor(review.vehicleType) }]}
                        >
                          <Text>{getVehicleIcon(review.vehicleType)} {review.vehicleType}</Text>
                        </Chip>
                        <Chip 
                          compact 
                          style={styles.locationChip}
                          textStyle={styles.locationChipText}
                          icon="map-marker"
                        >
                          <Text>{review.city}</Text>
                        </Chip>
                      </View>
                      <Text style={styles.userReviewTime}>{getRelativeTime(review.timestamp)}</Text>
                      <StarRatingWithValue rating={review.rating} size={16} />
                      <Text style={styles.userReviewText}>{review.reviewText}</Text>
                    </Card.Content>
                  </Card>
                ))}
                {data.filter(review => review.userId === selectedUser.id).length === 0 && (
                  <Text style={styles.noReviewsText}>No reviews found for this user.</Text>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#6b7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#ffffff',
  },
  listContainer: {
    padding: 20,
  },
  separator: {
    height: 12,
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewMeta: {
    flex: 1,
    marginRight: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  vehicleChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationChip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    // Color will be set dynamically based on vehicle type
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  reviewTime: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
    marginLeft: 8,
  },
  reviewText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUser: {
    color: '#6b7280',
    fontSize: 12,
    fontStyle: 'italic',
  },
  reviewActions: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fabContainer: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  fab: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    elevation: 4,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabLabel: {
    color: COLORS.light,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  vehicleSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  vehicleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleChipOption: {
    marginBottom: 8,
  },
  vehicleChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  suggestionChip: {
    height: 35,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingInput: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: COLORS.primary,
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  ratingButtonTextActive: {
    color: '#ffffff',
  },
  textArea: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '600',
  },
  // Profile Picture Styles
  userProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePictureContainer: {
    marginRight: 8,
  },
  profilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  defaultProfilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  defaultProfileText: {
    color: COLORS.light,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // User Profile Modal Styles
  userProfileModal: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  userProfileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    backgroundColor: COLORS.light,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  userProfileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  placeholder: {
    width: 32,
  },
  userProfileContent: {
    flex: 1,
    padding: 16,
  },
  userProfileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userProfilePictureContainer: {
    marginBottom: 16,
  },
  userProfilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  userDefaultProfilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  userDefaultProfileText: {
    color: COLORS.light,
    fontSize: 32,
    fontWeight: 'bold',
  },
  userProfileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  userProfileEmail: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  userProfileBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    backgroundColor: COLORS.gray,
  },
  adminChip: {
    backgroundColor: COLORS.warning,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  statusChip: {
    backgroundColor: COLORS.gray,
  },
  activeChip: {
    backgroundColor: COLORS.success,
  },
  inactiveChip: {
    backgroundColor: COLORS.error,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.light,
  },
  userReviewsSection: {
    marginTop: 16,
  },
  userReviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  userReviewCard: {
    marginBottom: 12,
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  userReviewHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  userReviewTime: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  userReviewText: {
    fontSize: 14,
    color: COLORS.dark,
    marginTop: 8,
  },
  noReviewsText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
