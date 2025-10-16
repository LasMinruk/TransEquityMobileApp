import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { COLORS } from '@/constants/CollorPallet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen3() {
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
        <View style={[styles.triangle, styles.triangle1]} />
        <View style={[styles.triangle, styles.triangle2]} />
        <View style={[styles.triangle, styles.triangle3]} />
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
            name="account-group" 
            size={120} 
            color={COLORS.primary} 
          />
          <View style={styles.iconBackground} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Community Driven</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Join a community of commuters working together to improve 
          public transportation. Your reviews help create better 
          transit experiences for everyone in Sri Lanka.
        </Text>

        {/* Community Features */}
        <View style={styles.communityFeatures}>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="account-check" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Verified Reviews</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Trusted Feedback</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="trending-up" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Continuous Improvement</Text>
          </View>
        </View>

        {/* Impact Preview */}
        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>Your Impact</Text>
          <View style={styles.impactStats}>
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="heart" size={20} color={COLORS.primary} />
              <Text style={styles.impactText}>Help fellow commuters</Text>
            </View>
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="lightbulb" size={20} color={COLORS.primary} />
              <Text style={styles.impactText}>Drive improvements</Text>
            </View>
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="map" size={20} color={COLORS.primary} />
              <Text style={styles.impactText}>Shape better cities</Text>
            </View>
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
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.primary,
    opacity: 0.1,
  },
  triangle1: {
    top: 100,
    right: 50,
  },
  triangle2: {
    bottom: 200,
    left: 30,
    transform: [{ rotate: '180deg' }],
  },
  triangle3: {
    top: 300,
    left: 100,
    transform: [{ rotate: '90deg' }],
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
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  communityFeatures: {
    width: '100%',
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginLeft: 12,
    fontWeight: '600',
  },
  impactContainer: {
    width: '100%',
    backgroundColor: COLORS.gray,
    padding: 15,
    borderRadius: 15,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 12,
  },
  impactStats: {
    alignItems: 'center',
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginLeft: 8,
    fontWeight: '500',
  },
});
