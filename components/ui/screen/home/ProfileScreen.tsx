import { StarRatingInput, StarRatingWithValue } from "@/components/StarRating";
import { COLORS } from "@/constants/CollorPallet";
import { useAuth } from "@/contexts/AuthContext";
import {
  Review,
  addReview,
  canEditOrDelete,
  deleteReview,
  getReviews,
  updateReview,
} from "@/utils/storage";
import { getRelativeTime } from "@/utils/timeAgo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";

export default function ProfileScreen() {
  const { user, refresh, logout } = useAuth();
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  // edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState<
    "bus" | "train" | "tuk tuk" | "bicycle" | "other"
  >("bus");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const isLargeScreen = width >= 428;
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
      case "bus":
        return "🚌";
      case "train":
        return "🚆";
      case "tram":
        return "🚋";
      case "ferry":
        return "⛴️";
      default:
        return "🚗";
    }
  };

  const getVehicleColor = (vehicleType: string) => {
    switch (vehicleType) {
      case "bus":
        return "#3B82F6";
      case "train":
        return "#8B5CF6";
      case "tram":
        return "#F59E0B";
      case "ferry":
        return "#06B6D4";
      default:
        return "#6B7280";
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled && user) {
      const next = { ...user, profileImageUri: res.assets[0].uri };
      const raw = await AsyncStorage.getItem("users");
      const users = raw ? JSON.parse(raw) : [];
      const updated = users.map((u: any) => (u.id === user.id ? next : u));
      await AsyncStorage.setItem("users", JSON.stringify(updated));
      
      // Update the current user in AsyncStorage
      await AsyncStorage.setItem("currentUser", JSON.stringify(next));
      
      // Refresh the auth context to update the profile icon
      await refresh();
    }
  };

  if (!user) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text variant="headlineMedium" style={styles.unauthorizedText}>
          Please Login
        </Text>
        <Text variant="bodyLarge" style={styles.unauthorizedSubtext}>
          Please login to view your profile.
        </Text>
      </View>
    );
  }

  const stats = {
    totalReviews: myReviews.length,
    averageRating:
      myReviews.length > 0
        ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
        : 0,
    vehicleTypes: Array.from(new Set(myReviews.map((r) => r.vehicleType)))
      .length,
    cities: Array.from(new Set(myReviews.map((r) => r.city))).length,
  };

  // ----- Edit/Delete handlers -----
  const startEdit = (r: Review) => {
    const isOwner = user.id === r.userId;
    const isAdmin = user.role === "admin";
    const withinWindow = canEditOrDelete(r.timestamp);
    const allowed = isAdmin || (isOwner && withinWindow);
    if (!allowed) {
      Alert.alert("You can't edit this review (time window passed).");
      return;
    }
    setEditing(r);
    setCity(r.city);
    setVehicleType(r.vehicleType);
    setRating(r.rating);
    setReviewText(r.reviewText);
    setShowModal(true);
  };

  const submitEdit = async () => {
    if (!editing) return;
    const isOwner = user.id === editing.userId;
    const isAdmin = user.role === "admin";
    const withinWindow = canEditOrDelete(editing.timestamp);
    const allowed = isAdmin || (isOwner && withinWindow);
    if (!allowed) {
      Alert.alert("You can't edit this review (time window passed).");
      setShowModal(false);
      setEditing(null);
      return;
    }
    const updated: Review = {
      ...editing,
      city: city.trim(),
      vehicleType,
      rating,
      reviewText: reviewText.trim(),
    };
    await updateReview(updated);
    Alert.alert("Review updated!");
    setShowModal(false);
    setEditing(null);
    setCity("");
    setVehicleType("bus");
    setRating(5);
    setReviewText("");
    load();
  };

  const onDelete = (review: Review) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteReview(review.id);
            refresh();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        isSmallScreen && styles.contentContainerSmall,
        isLargeScreen && styles.contentContainerLarge,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {/* Profile Header */}
      <View
        style={[
          styles.header,
          isSmallScreen && styles.headerSmall,
          isLargeScreen && styles.headerLarge,
          isTablet && styles.headerTablet,
        ]}
      >
        <View
          style={[
            styles.profileSection,
            isSmallScreen && styles.profileSectionSmall,
          ]}
        >
          <View style={styles.avatarContainer}>
            {user.profileImageUri ? (
              <Image
                source={{ uri: user.profileImageUri }}
                style={[
                  styles.avatar,
                  isSmallScreen && styles.avatarSmall,
                  isLargeScreen && styles.avatarLarge,
                  isTablet && styles.avatarTablet,
                ]}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                  isSmallScreen && styles.avatarSmall,
                  isLargeScreen && styles.avatarLarge,
                  isTablet && styles.avatarTablet,
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    isSmallScreen && styles.avatarTextSmall,
                    isLargeScreen && styles.avatarTextLarge,
                  ]}
                >
                  {getInitials(user.name)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.editAvatarButton,
                isSmallScreen && styles.editAvatarButtonSmall,
                isLargeScreen && styles.editAvatarButtonLarge,
              ]}
              onPress={pickImage}
            >
              <IconButton
                icon="camera"
                size={isSmallScreen ? 14 : 16}
                iconColor="#ffffff"
              />
            </TouchableOpacity>
          </View>

          <View
            style={[styles.userInfo, isSmallScreen && styles.userInfoSmall]}
          >
            <Text
              variant="headlineSmall"
              style={[
                styles.userName,
                isSmallScreen && styles.userNameSmall,
                isLargeScreen && styles.userNameLarge,
              ]}
            >
              {user.name}
            </Text>
            <Text
              style={[
                styles.userEmail,
                isSmallScreen && styles.userEmailSmall,
                isLargeScreen && styles.userEmailLarge,
              ]}
            >
              {user.email}
            </Text>

            {/* Role chip with black text */}
            <View style={styles.roleContainer}>
              <Chip
                compact
                style={[
                  styles.roleChip,
                  user.role === "admin" ? styles.adminChip : styles.userChip,
                  isSmallScreen && styles.roleChipSmall,
                ]}
                textStyle={[
                  styles.roleChipText,
                  isSmallScreen && styles.roleChipSmall,
                  { color: "#111827" }, // black font
                ]}
              >
                <Text>{user.role === "admin" ? "👑 Admin" : "👤 User"}</Text>
              </Chip>
            </View>
          </View>
        </View>
      </View>

      {/* --- Section: Your Activity --- */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionHeaderText}>
          Your Activity
        </Text>
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
                <Text numberOfLines={1} style={styles.statValue}>
                  {stats.totalReviews}
                </Text>
                <Text numberOfLines={1} style={styles.statLabel}>
                  Total Reviews
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Ratings */}
        <View style={styles.activitySubSection}>
          <Text style={styles.activitySubSectionTitle}>Ratings</Text>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View
                style={[
                  styles.statIconContainer,
                  styles.secondaryIconContainer,
                ]}
              >
                <Text style={styles.statIcon}>⭐</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text numberOfLines={1} style={styles.secondaryStatValue}>
                  {stats.averageRating.toFixed(1)}
                </Text>
                <Text numberOfLines={1} style={styles.secondaryStatLabel}>
                  Avg Rating
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Vehicle Types */}
        <View style={styles.activitySubSection}>
          <Text style={styles.activitySubSectionTitle}>Vehicles</Text>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View
                style={[
                  styles.statIconContainer,
                  styles.secondaryIconContainer,
                ]}
              >
                <Text style={styles.statIcon}>🚌</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text numberOfLines={1} style={styles.secondaryStatValue}>
                  {stats.vehicleTypes}
                </Text>
                <Text numberOfLines={1} style={styles.secondaryStatLabel}>
                  Vehicle Types
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Cities */}
        <View style={styles.activitySubSection}>
          <Text style={styles.activitySubSectionTitle}>Cities</Text>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View
                style={[
                  styles.statIconContainer,
                  styles.secondaryIconContainer,
                ]}
              >
                <Text style={styles.statIcon}>🏙️</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text numberOfLines={1} style={styles.secondaryStatValue}>
                  {stats.cities}
                </Text>
                <Text numberOfLines={1} style={styles.secondaryStatLabel}>
                  Cities
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* --- Section: My Reviews (with edit/delete) --- */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionHeaderText}>
          My Reviews
        </Text>
      </View>

      <View
        style={[
          styles.reviewsSection,
          isSmallScreen && styles.reviewsSectionSmall,
          isLargeScreen && styles.reviewsSectionLarge,
        ]}
      >
        <View
          style={[
            styles.reviewsHeader,
            isSmallScreen && styles.reviewsHeaderSmall,
          ]}
        >
          <Button
            mode="outlined"
            onPress={load}
            icon="refresh"
            style={[
              styles.refreshButton,
              isSmallScreen && styles.refreshButtonSmall,
            ]}
            labelStyle={[
              styles.refreshButtonText,
              isSmallScreen && styles.refreshButtonTextSmall,
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
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : myReviews.length > 0 ? (
          <View
            style={[
              styles.reviewsList,
              isSmallScreen && styles.reviewsListSmall,
            ]}
          >
            {myReviews.map((review, index) => {
              const isOwner = user.id === review.userId;
              const isAdmin = user.role === "admin";
              const withinWindow = canEditOrDelete(review.timestamp);
              const canAct = isAdmin || (isOwner && withinWindow);

              return (
                <Card
                  key={review.id}
                  style={[
                    styles.reviewCardBig,
                    isSmallScreen && styles.reviewCardSmall,
                    isLargeScreen && styles.reviewCardLarge,
                    index === 0 && styles.firstReviewCard,
                  ]}
                >
                  <Card.Content
                    style={isSmallScreen && styles.reviewCardContentSmall}
                  >
                    <View
                      style={[
                        styles.reviewHeader,
                        isSmallScreen && styles.reviewHeaderSmall,
                      ]}
                    >
                      <View style={styles.reviewMeta}>
                        <View
                          style={[
                            styles.reviewChipsRow,
                            isSmallScreen && styles.reviewChipsRowSmall,
                          ]}
                        >
                          <View style={styles.circleRow}>
                            <View
                              style={[
                                styles.transportCircle,
                                {
                                  backgroundColor: getVehicleColor(
                                    review.vehicleType
                                  ),
                                },
                              ]}
                            >
                              <Text style={styles.transportIcon}>
                                {getVehicleIcon(review.vehicleType)}
                              </Text>
                            </View>
                            <View style={styles.locationCircle}>
                              <IconButton
                                icon="map-marker"
                                size={14}
                                iconColor="#3B82F6"
                                style={styles.locationIconBtn}
                              />
                              <Text style={styles.locationText}>
                                {review.city}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.reviewRatingRow}>
                          <StarRatingWithValue
                            rating={review.rating}
                            size={isSmallScreen ? 14 : 16}
                          />
                        </View>
                        <Text
                          style={[
                            styles.reviewTime,
                            isSmallScreen && styles.reviewTimeSmall,
                          ]}
                        >
                          {getRelativeTime(review.timestamp)}
                        </Text>
                      </View>

                      {/* Actions (always visible for owner/admin; disabled if outside window) */}
                      {(isOwner || isAdmin) && (
                        <View style={{ flexDirection: "row" }}>
                          <IconButton
                            icon="pencil"
                            size={18}
                            iconColor={canAct ? "#6b7280" : "#cbd5e1"}
                            onPress={() => startEdit(review)}
                          />
                          <IconButton
                            icon="delete"
                            size={18}
                            iconColor={canAct ? "#ef4444" : "#fca5a5"}
                            onPress={() => onDelete(review)}
                          />
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.reviewText,
                        isSmallScreen && styles.reviewTextSmall,
                        isLargeScreen && styles.reviewTextLarge,
                      ]}
                      numberOfLines={3}
                    >
                      {review.reviewText}
                    </Text>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card style={styles.emptyStateCard}>
            <Card.Content style={styles.emptyStateContent}>
              <Text
                style={[
                  styles.emptyStateIcon,
                  isSmallScreen && styles.emptyStateIconSmall,
                ]}
              >
                📝
              </Text>
              <Text variant="titleMedium" style={styles.emptyStateTitle}>
                No Reviews Yet
              </Text>
              <Text style={styles.emptyStateText}>
                Start sharing your transit experiences by writing your first
                review!
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Settings Section (Change Profile Picture removed) */}
      <View
        style={[
          styles.settingsSection,
          isSmallScreen && styles.settingsSectionSmall,
          isLargeScreen && styles.settingsSectionLarge,
        ]}
      >
        <Text
          variant="titleMedium"
          style={[
            styles.settingTitle,
            isSmallScreen && styles.settingTitleSmall,
            isLargeScreen && styles.sectionTitleLarge,
          ]}
        >
          Settings
        </Text>
        <Card
          style={[
            styles.settingsCard,
            isSmallScreen && styles.settingsCardSmall,
            isLargeScreen && styles.settingsCardLarge,
          ]}
        >
          <Card.Content>
            {/* "Change Profile Picture" item intentionally removed */}
            <TouchableOpacity
              style={[
                styles.settingItem,
                isSmallScreen && styles.settingItemSmall,
              ]}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <IconButton
                  icon="logout"
                  size={isSmallScreen ? 18 : 20}
                  iconColor="#ef4444"
                />
                <View style={styles.settingText}>
                  <Text
                    style={[
                      styles.settingTitle,
                      styles.logoutText,
                      isSmallScreen && styles.settingTitleSmall,
                    ]}
                  >
                    Logout
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      isSmallScreen && styles.settingSubtitleSmall,
                    ]}
                  >
                    Sign out of your account
                  </Text>
                </View>
              </View>
              <IconButton
                icon="chevron-right"
                size={isSmallScreen ? 18 : 20}
                iconColor="#6b7280"
              />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>

      <View
        style={[
          styles.bottomSpacing,
          isSmallScreen && styles.bottomSpacingSmall,
          isLargeScreen && styles.bottomSpacingLarge,
        ]}
      />

      {/* Edit Review Modal */}
      <Modal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        animationType="slide"
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalHeaderBar}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Edit Review
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowModal(false)}
              iconColor="#6b7280"
            />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
          >
            <TextInput
              mode="outlined"
              label="City"
              value={city}
              onChangeText={setCity}
              style={styles.input}
              placeholder="Enter city name"
            />

            <Text style={styles.sectionLabel}>Vehicle Type</Text>
            <View style={styles.vehicleChipsRow}>
              {(["bus", "train", "tuk tuk", "bicycle", "other"] as const).map(
                (v) => (
                  <Chip
                    key={v}
                    selected={vehicleType === v}
                    onPress={() => setVehicleType(v)}
                    style={[
                      styles.vehicleChipOption,
                      vehicleType === v && {
                        backgroundColor: getVehicleColor(v),
                      },
                    ]}
                    textStyle={[
                      styles.vehicleChipText,
                      vehicleType === v && { color: "#ffffff" },
                    ]}
                  >
                    <Text>
                      {getVehicleIcon(v)} {v}
                    </Text>
                  </Chip>
                )
              )}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Rating</Text>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <StarRatingInput
                rating={rating}
                size={32}
                onRatingChange={setRating}
                showValue
              />
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
                style={{ flex: 1 }}
                onPress={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                style={{ flex: 1, backgroundColor: COLORS.primary }}
                onPress={submitEdit}
                disabled={!city.trim() || !reviewText.trim()}
              >
                Update Review
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");
const isSmallScreenWindow = width < 375;
const isLargeScreenWindow = width >= 428;
const isTabletWindow = width >= 768;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loadingReviews: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  contentContainer: { paddingBottom: 20 },
  contentContainerSmall: { paddingBottom: 16 },
  contentContainerLarge: { paddingBottom: 24 },

  unauthorizedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  unauthorizedText: { color: "#ef4444", marginBottom: 8, textAlign: "center" },
  unauthorizedSubtext: { color: "#6b7280", textAlign: "center" },

  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerSmall: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  headerLarge: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 28 },
  headerTablet: { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 32 },

  profileSection: { flexDirection: "row", alignItems: "center" },
  profileSectionSmall: { flexDirection: "row", alignItems: "flex-start" },

  avatarContainer: { position: "relative", marginRight: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarSmall: { width: 64, height: 64, borderRadius: 32 },
  avatarLarge: { width: 96, height: 96, borderRadius: 48 },
  avatarTablet: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 24, fontWeight: "700", color: "#ffffff" },
  avatarTextSmall: { fontSize: 20 },
  avatarTextLarge: { fontSize: 28 },
  editAvatarButton: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editAvatarButtonSmall: { width: 28, height: 28, borderRadius: 14 },
  editAvatarButtonLarge: { width: 36, height: 36, borderRadius: 18 },

  userInfo: { flex: 1 },
  userInfoSmall: { flex: 1, marginLeft: 8 },
  userName: {
    color: "#111827",
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 24,
  },
  userNameSmall: { fontSize: 18, marginBottom: 2 },
  userNameLarge: { fontSize: 28 },
  userEmail: { color: "#6b7280", fontSize: 14, marginBottom: 8 },
  userEmailSmall: { fontSize: 12, marginBottom: 6 },
  userEmailLarge: { fontSize: 16 },

  roleContainer: { alignSelf: "flex-start" },
  roleChip: { height: 28 },
  roleChipSmall: { height: 24 },
  adminChip: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
  userChip: { backgroundColor: "#f3f4f6" },
  roleChipText: { fontSize: 12, fontWeight: "700" }, // color forced to black in component

  sectionHeader: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
  },
  sectionHeaderText: { fontWeight: "700", fontSize: 18, color: "#111827" },

  activitySectionGroup: { paddingHorizontal: 20, paddingBottom: 12, gap: 18 },
  activitySubSection: { marginBottom: 4 },
  activitySubSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280ff",
    marginBottom: 6,
    marginLeft: 2,
  },

  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: "#ffffff",
  },
  primaryCard: { backgroundColor: COLORS.primary },
  statContent: { flexDirection: "row", alignItems: "center", padding: 16 },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  secondaryIconContainer: { backgroundColor: "#f3f4f6" },
  statIcon: { fontSize: 20 },
  statTextContainer: { flex: 1 },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  secondaryStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  secondaryStatLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500" },

  reviewsSection: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
  reviewsSectionSmall: { paddingHorizontal: 16, paddingBottom: 20 },
  reviewsSectionLarge: { paddingHorizontal: 24, paddingBottom: 28 },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewsHeaderSmall: { marginBottom: 12 },
  refreshButton: { borderColor: COLORS.primary },
  refreshButtonSmall: { paddingHorizontal: 12 },
  refreshButtonText: { color: COLORS.primary, fontSize: 12 },
  refreshButtonTextSmall: { fontSize: 10 },
  reviewsList: { gap: 12 },
  reviewsListSmall: { gap: 8 },

  reviewCardSmall: { borderRadius: 10 },
  reviewCardLarge: { borderRadius: 14 },
  reviewCardBig: {
    borderRadius: 22,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 18,
    padding: 18,
    minHeight: 150,
  },
  reviewCardContentSmall: { padding: 12 },
  firstReviewCard: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewHeaderSmall: { marginBottom: 8 },
  reviewMeta: { flex: 1 },
  reviewChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  reviewChipsRowSmall: { gap: 8, marginBottom: 6 },
  circleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  transportCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#3B82F6",
  },
  transportIcon: { fontSize: 22, color: "#fff" },
  locationCircle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ef",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  locationIconBtn: { margin: 0, padding: 0, backgroundColor: "transparent" },
  locationText: {
    fontSize: 13,
    color: "#1e293b",
    marginLeft: 2,
    fontWeight: "600",
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  reviewRatingValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 2,
  },
  reviewTime: { color: "#6b7280", fontSize: 11, fontWeight: "500" },
  reviewTimeSmall: { fontSize: 9 },
  reviewText: { color: "#374151", fontSize: 16, lineHeight: 22 },
  reviewTextSmall: { fontSize: 13, lineHeight: 18 },
  reviewTextLarge: { fontSize: 20, lineHeight: 26 },

  emptyStateCard: {
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyStateCardSmall: { borderRadius: 10 },
  emptyStateContent: { alignItems: "center", padding: 32 },
  emptyStateContentSmall: { padding: 24 },
  emptyStateIcon: { fontSize: 48, marginBottom: 16 },
  emptyStateIconSmall: { fontSize: 40, marginBottom: 12 },
  emptyStateTitle: { color: "#374151", marginBottom: 8 },
  emptyStateTitleSmall: { fontSize: 16, marginBottom: 6 },
  emptyStateText: { color: "#6b7280", textAlign: "center", lineHeight: 20 },

  settingsSection: { paddingHorizontal: 20, paddingBottom: 24 },
  settingsSectionSmall: { paddingHorizontal: 16, paddingBottom: 20 },
  settingsSectionLarge: { paddingHorizontal: 24, paddingBottom: 28 },
  settingsCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#ff0000ff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    backgroundColor: "#ffffff",
  },
  settingsCardSmall: { borderRadius: 10 },
  settingsCardLarge: { borderRadius: 14 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingItemSmall: { paddingVertical: 6 },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingText: { marginLeft: 8, flex: 1 },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ff0000ff",
    marginBottom: 2,
  },
  settingTitleSmall: { fontSize: 14 },
  settingSubtitle: { fontSize: 14, color: "#000000ff" },
  settingSubtitleSmall: { fontSize: 12 },
  logoutText: { color: "#ef4444" },

  bottomSpacing: { height: 40 },
  bottomSpacingSmall: { height: 24 },
  bottomSpacingLarge: { height: 60 },

  // Modal
  modalWrap: { flex: 1, backgroundColor: "#f8fafc" },
  modalHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { color: "#111827", fontWeight: "700" },
  input: { marginBottom: 16, backgroundColor: "#ffffff" },
  vehicleChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  vehicleChipOption: { marginBottom: 8 },
  vehicleChipText: { fontSize: 12, fontWeight: "600" },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  textArea: { marginBottom: 24, backgroundColor: "#ffffff" },
  modalActions: { flexDirection: "row", gap: 12 },
  sectionTitleLarge: { fontSize: 22 },
});
