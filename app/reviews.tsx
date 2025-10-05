import { StarRatingInput, StarRatingWithValue } from '@/components/StarRating';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Review, addReview, canEditOrDelete, deleteReview, getReviews, updateReview } from '@/utils/storage';
import { getRelativeTime } from '@/utils/timeAgo';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, FAB, IconButton, Text, TextInput } from 'react-native-paper';

const VEHICLES = ['bus', 'train', 'tram', 'ferry', 'other'] as const;
const LK_CITIES = [
  'Colombo','Kandy','Galle','Gampaha','Negombo','Jaffna','Matara','Anuradhapura','Badulla','Batticaloa',
  'Ratnapura','Trincomalee','Kurunegala','Polonnaruwa','Nuwara Eliya','Kalutara','Hambantota','Kegalle',
  'Monaragala','Vavuniya','Mannar','Kilinochchi','Mullaitivu','Matale','Puttalam'
];

export default function ReviewsScreen() {
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [vehicleType, setVehicleType] = useState<'bus' | 'train' | 'tram' | 'ferry' | 'other'>('bus');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editing, setEditing] = useState<Review | null>(null);
  const [data, setData] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Review[]>([]);
  const citySuggestions = React.useMemo(() => {
    const q = city.trim().toLowerCase();
    if (!q) return LK_CITIES.slice(0, 10);
    return LK_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 10);
  }, [city]);

  async function refresh() {
    const list = await getReviews();
    setData(list);
    setFilteredData(list);
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



  const onDelete = async (r: Review) => {
    if (!user || (user.role !== 'admin' && user.id !== r.userId)) return;
    if (!canEditOrDelete(r.timestamp) && user.role !== 'admin') {
      Alert.alert("You can't delete after 15 mins");
      return;
    }
    await deleteReview(r.id);
    Alert.alert('Review deleted');
    refresh();
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
                      textStyle={styles.chipText}
                    >
                      {getVehicleIcon(item.vehicleType)} {item.vehicleType}
                    </Chip>
                    <Chip 
                      compact 
                      style={styles.locationChip}
                      textStyle={styles.locationChipText}
                      icon="map-marker"
                    >
                      {item.city}
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
                <Text style={styles.reviewUser}>by {item.userId}</Text>
                <View style={styles.reviewActions}>
                  {canEditOrDelete(item.timestamp) && (
                    <IconButton
                      icon="pencil"
                      size={18}
                      iconColor="#6b7280"
                      onPress={() => onEdit(item)}
                    />
                  )}
                  <IconButton
                    icon="delete"
                    size={18}
                    iconColor="#ef4444"
                    onPress={() => onDelete(item)}
                  />
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
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddModal}
        label="Add Review"
      />

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
                    {c}
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
                        vehicleType === vehicle && { color: '#ffffff' }
                      ]}
                    >
                      {getVehicleIcon(vehicle)} {vehicle}
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
                  disabled={!city.trim() || !reviewText.trim()}
                >
                  {editing ? 'Update Review' : 'Submit Review'}
                </Button>
              </View>
            </View>
          </ScrollView>
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
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  vehicleChip: {
    backgroundColor: '#3B82F6',
    paddingVertical: 2,
    paddingHorizontal: 12,
    marginRight: 4,
    alignSelf: 'flex-start',
  },
  locationChip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginRight: 4,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 15, // larger for emoji and vehicle
    fontWeight: '600',
    color: '#fff',
  },
  locationChipText: {
    fontSize: 13,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.tint,
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
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  suggestionChip: {
    height: 28,
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
    backgroundColor: Colors.light.tint,
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
    backgroundColor: Colors.light.tint,
  },
});
