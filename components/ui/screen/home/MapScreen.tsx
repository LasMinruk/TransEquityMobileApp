import { StarRatingWithValue } from '@/components/StarRating';
import { COLORS } from '@/constants/CollorPallet';
import { getReviews, Review } from '@/utils/storage';
import { getRelativeTime } from '@/utils/timeAgo';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View, Animated, TouchableOpacity, Modal } from 'react-native';
import { Button, Card, Chip, IconButton, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width - 24;

export default function MapScreen() {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCityDetails, setSelectedCityDetails] = useState<string | null>(null);
  const [cityDetails, setCityDetails] = useState<any>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  
  // Animation refs
  const mapScaleAnim = useRef(new Animated.Value(0.9)).current;
  const mapOpacityAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const refresh = async () => {
    setLoading(true);
    const list = await getReviews();
    setReviews(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    
    // Start map animations
    Animated.parallel([
      Animated.timing(mapOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(mapScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, []);

  // City data with average details
  const cityData = useMemo(() => {
    const cities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna'];
    return cities.map(city => {
      const cityReviews = reviews.filter(review => 
        review.city && review.city.toLowerCase().includes(city.toLowerCase())
      );
      
      if (cityReviews.length === 0) {
        return {
          name: city,
          averageRating: 0,
          totalReviews: 0,
          topVehicleType: 'N/A',
          satisfaction: 0,
          lastReviewDate: 'N/A'
        };
      }

      const totalRating = cityReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / cityReviews.length;
      
      // Get the most recent review date
      const lastReviewDate = cityReviews.length > 0 
        ? new Date(Math.max(...cityReviews.map(r => r.timestamp))).toLocaleDateString()
        : 'N/A';
      
      // Count vehicle types
      const vehicleCounts = cityReviews.reduce((acc, review) => {
        if (review.vehicleType) {
          acc[review.vehicleType] = (acc[review.vehicleType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const topVehicleType = Object.keys(vehicleCounts).length > 0 
        ? Object.keys(vehicleCounts).reduce((a, b) => 
            vehicleCounts[a] > vehicleCounts[b] ? a : b
          )
        : 'N/A';

      return {
        name: city,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: cityReviews.length,
        topVehicleType,
        satisfaction: Math.round(averageRating * 20), // Convert to percentage
        lastReviewDate
      };
    });
  }, [reviews]);

  const handleCityClick = (cityName: string) => {
    const city = cityData.find(c => c.name === cityName);
    if (city) {
      setCityDetails(city);
      setSelectedCityDetails(cityName);
      setShowCityModal(true);
    }
  };

  const closeCityModal = () => {
    setShowCityModal(false);
    setSelectedCityDetails(null);
    setCityDetails(null);
  };

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews : 0;
    const cityCounts = reviews.reduce((acc, r) => {
      if (r.city) {
        acc[r.city] = (acc[r.city] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalReviews,
      avgRating,
      cityCounts,
      topCity: Object.entries(cityCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
    };
  }, [reviews]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading map data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>🗺️ Transit Map</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Interactive Sri Lankan transit coverage map
          </Text>
        </View>

        {/* Statistics Summary Cards */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, styles.primaryCard]}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📍</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Covered Cities</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>📊</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.secondaryStatValue}>{stats.totalReviews}</Text>
                <Text style={styles.secondaryStatLabel}>Total Reviews</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>⭐</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.secondaryStatValue}>{stats.avgRating.toFixed(1)}</Text>
                <Text style={styles.secondaryStatLabel}>Avg Rating</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>🏙️</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.secondaryStatValue}>{stats.topCity}</Text>
                <Text style={styles.secondaryStatLabel}>Top City</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Interactive Sri Lankan Map */}
        <View style={styles.mapSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Interactive Transit Map</Text>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>Tap on any city marker to view detailed analytics</Text>
          
          <Animated.View 
            style={[
              styles.mapContainer,
              {
                opacity: mapOpacityAnim,
                transform: [{ scale: mapScaleAnim }]
              }
            ]}
          >
            <View style={styles.sriLankaMap}>
              {/* Sri Lanka Island Shape */}
              <View style={styles.islandShape}>
                {/* Major Cities with Pulse Animation */}
                {cityData.map((city, index) => (
                  <TouchableOpacity
                    key={city.name}
                    style={[
                      styles.cityMarker,
                      city.name === 'Colombo' && styles.colomboMarker,
                      city.name === 'Kandy' && styles.kandyMarker,
                      city.name === 'Galle' && styles.galleMarker,
                      city.name === 'Negombo' && styles.negomboMarker,
                      city.name === 'Jaffna' && styles.jaffnaMarker,
                      selectedCityDetails === city.name && styles.selectedMarker
                    ]}
                    onPress={() => handleCityClick(city.name)}
                    activeOpacity={0.7}
                  >
                    <Animated.View
                      style={[
                        styles.markerPulse,
                        {
                          transform: [{ scale: pulseAnim }]
                        }
                      ]}
                    />
                    <View style={styles.markerDot} />
                    <Text style={styles.cityLabel}>{city.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
            </View>
            
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>Major Cities</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
                <Text style={styles.legendText}>Regional Centers</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* City List Section */}
        <View style={styles.cityListSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>City Overview</Text>
          <View style={styles.cityList}>
            {cityData.map((city, index) => (
              <Card key={city.name} style={styles.cityCard}>
                <Card.Content style={styles.cityCardContent}>
                  <View style={styles.cityCardHeader}>
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>{city.name}</Text>
                      <Text style={styles.cityStats}>
                        {city.totalReviews} reviews • {city.averageRating}/5 rating
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCityClick(city.name)}
                      style={styles.viewDetailsButton}
                    >
                      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cityMetrics}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Satisfaction</Text>
                      <Text style={styles.metricValue}>{city.satisfaction}%</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Last Review</Text>
                      <Text style={styles.metricValue}>{city.lastReviewDate}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Top Vehicle</Text>
                      <Text style={styles.metricValue}>{city.topVehicleType}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Add Review Button */}
        <View style={styles.addReviewSection}>
          <Button
            mode="contained"
            onPress={() => {
              // Navigate to Reviews tab to add a new review
              navigation.navigate('HomeTabs', { screen: 'Reviews' });
            }}
            style={styles.addReviewButton}
            labelStyle={styles.addReviewButtonText}
            icon="plus"
          >
            Add Your Review
          </Button>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* City Details Modal */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCityModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{cityDetails?.name} Analytics</Text>
              <TouchableOpacity onPress={closeCityModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            {cityDetails && (
              <View style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Average Rating</Text>
                    <Text style={styles.detailValue}>{cityDetails.averageRating}/5</Text>
                    <View style={styles.ratingBar}>
                      <View 
                        style={[
                          styles.ratingFill, 
                          { width: `${(cityDetails.averageRating / 5) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Total Reviews</Text>
                    <Text style={styles.detailValue}>{cityDetails.totalReviews}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Review</Text>
                    <Text style={styles.detailValue}>{cityDetails.lastReviewDate}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Top Vehicle</Text>
                    <Text style={styles.detailValue}>{cityDetails.topVehicleType}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Satisfaction</Text>
                    <Text style={styles.detailValue}>{cityDetails.satisfaction}%</Text>
                  </View>
                </View>
                
                <View style={styles.satisfactionContainer}>
                  <Text style={styles.satisfactionLabel}>Overall Satisfaction</Text>
                  <View style={styles.satisfactionBar}>
                    <View 
                      style={[
                        styles.satisfactionFill, 
                        { width: `${cityDetails.satisfaction}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.satisfactionText}>
                    {cityDetails.satisfaction >= 80 ? 'Excellent' : 
                     cityDetails.satisfaction >= 60 ? 'Good' : 
                     cityDetails.satisfaction >= 40 ? 'Average' : 'Needs Improvement'}
                  </Text>
                </View>
                
                {/* Recent Reviews Section */}
                <View style={styles.recentReviewsContainer}>
                  <Text style={styles.recentReviewsLabel}>Recent User Reviews</Text>
                  {reviews.filter(review => 
                    review.city && review.city.toLowerCase().includes(cityDetails.name.toLowerCase())
                  ).slice(0, 3).map((review, index) => (
                    <View key={review.id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewUser}>{review.userId}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.reviewRating}>
                        <StarRatingWithValue rating={review.rating} size={14} />
                        <Text style={styles.reviewVehicle}>{review.vehicleType}</Text>
                      </View>
                      <Text style={styles.reviewText} numberOfLines={2}>
                        {review.reviewText}
                      </Text>
                    </View>
                  ))}
                  {reviews.filter(review => 
                    review.city && review.city.toLowerCase().includes(cityDetails.name.toLowerCase())
                  ).length === 0 && (
                    <Text style={styles.noReviewsText}>No reviews available for this city</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    paddingHorizontal: 12,
    paddingTop: 0,
    backgroundColor: '#f8fafc',
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginTop: 0,
    marginBottom: 6,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 24,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '400',
  },
  statsGrid: {
    flexDirection: 'column',
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 18,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 0,
    marginHorizontal: 0,
    width: '100%',
    minWidth: undefined,
    flex: undefined,
  },
  primaryCard: {
    backgroundColor: COLORS.primary,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  secondaryIconContainer: {
    backgroundColor: '#f3f4f6',
  },
  secondaryStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  // Map Section Styles
  mapSection: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: COLORS.darkGray,
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  mapContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sriLankaMap: {
    height: 300,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  islandShape: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.light,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cityMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  colomboMarker: {
    top: 80,
    left: 50,
  },
  kandyMarker: {
    top: 60,
    left: 100,
  },
  galleMarker: {
    top: 140,
    left: 80,
  },
  negomboMarker: {
    top: 40,
    left: 40,
  },
  jaffnaMarker: {
    top: 30,
    left: 120,
  },
  cityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 4,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  
  // Interactive Map Styles
  selectedMarker: {
    transform: [{ scale: 1.2 }],
    zIndex: 10,
  },
  markerPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.light,
    zIndex: 2,
  },
  
  // City List Section
  cityListSection: {
    marginBottom: 24,
  },
  cityList: {
    gap: 12,
  },
  cityCard: {
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
  cityCardContent: {
    padding: 16,
  },
  cityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  cityStats: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  viewDetailsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightBlue,
  },
  cityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.light,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: '90%',
    minWidth: 300,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  modalBody: {
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 15,
  },
  detailItem: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 5,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  ratingBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.gray,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  ratingFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  satisfactionContainer: {
    backgroundColor: COLORS.lightBlue,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  satisfactionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  satisfactionBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.gray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  satisfactionFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  satisfactionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  
  // Recent Reviews Styles
  recentReviewsContainer: {
    backgroundColor: COLORS.lightBlue,
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  recentReviewsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: COLORS.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewUser: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reviewDate: {
    fontSize: 11,
    color: COLORS.darkGray,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewVehicle: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  reviewText: {
    fontSize: 12,
    color: COLORS.dark,
    lineHeight: 16,
  },
  noReviewsText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Add Review Button Styles
  addReviewSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  addReviewButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addReviewButtonText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});
