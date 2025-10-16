import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { COLORS } from '@/constants/CollorPallet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen2() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.shape, styles.shape1]} />
        <View style={[styles.shape, styles.shape2]} />
        <View style={[styles.shape, styles.shape3]} />
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name="chart-line" 
          size={120} 
          color={COLORS.primary} 
        />
          <View style={styles.iconBackground} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Real-Time Analytics</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Get insights into transit performance with detailed analytics. 
          View ratings by city, vehicle type, and track improvements 
          in public transportation across the island.
        </Text>

        {/* Analytics Preview */}
        <View style={styles.analyticsPreview}>
          <View style={styles.analyticsCard}>
            <MaterialCommunityIcons name="chart-bar" size={24} color={COLORS.primary} />
            <Text style={styles.analyticsText}>Performance Charts</Text>
          </View>
          <View style={styles.analyticsCard}>
            <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} />
            <Text style={styles.analyticsText}>City Rankings</Text>
          </View>
          <View style={styles.analyticsCard}>
            <MaterialCommunityIcons name="star" size={24} color={COLORS.primary} />
            <Text style={styles.analyticsText}>Rating Trends</Text>
          </View>
        </View>

        {/* Stats Preview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.2</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>25</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Vehicle Types</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  shape: {
    position: 'absolute',
    backgroundColor: COLORS.orange,
    opacity: 0.1,
  },
  shape1: {
    width: 180,
    height: 180,
    borderRadius: 90,
    top: 80,
    right: -40,
  },
  shape2: {
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: 150,
    left: -20,
  },
  shape3: {
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 250,
    left: 30,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    zIndex: 1,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  iconBackground: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    top: -10,
    left: -10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  analyticsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  analyticsCard: {
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    padding: 12,
    borderRadius: 12,
    minWidth: 70,
    marginHorizontal: 5,
  },
  analyticsText: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: COLORS.gray,
    padding: 15,
    borderRadius: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginTop: 4,
  },
});
