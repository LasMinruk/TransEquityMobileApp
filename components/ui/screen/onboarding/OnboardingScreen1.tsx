import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { COLORS } from '@/constants/CollorPallet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen1() {
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
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
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
          name="bus-multiple" 
          size={120} 
          color={COLORS.primary} 
        />
          <View style={styles.iconBackground} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Smart Transit Reviews</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Rate and review your transit experiences across Sri Lanka. 
          Share feedback on buses, trains, tuk tuks, and more to help 
          improve public transportation for everyone.
        </Text>

        {/* Feature Icons */}
        <View style={styles.featureIcons}>
          <View style={styles.featureIcon}>
            <MaterialCommunityIcons name="bus" size={30} color={COLORS.primary} />
            <Text style={styles.featureText}>Buses</Text>
          </View>
          <View style={styles.featureIcon}>
            <MaterialCommunityIcons name="train" size={30} color={COLORS.primary} />
            <Text style={styles.featureText}>Trains</Text>
          </View>
          <View style={styles.featureIcon}>
            <MaterialCommunityIcons name="rickshaw" size={30} color={COLORS.primary} />
            <Text style={styles.featureText}>Tuk Tuks</Text>
          </View>
          <View style={styles.featureIcon}>
            <MaterialCommunityIcons name="bicycle" size={30} color={COLORS.primary} />
            <Text style={styles.featureText}>Bicycles</Text>
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
  circle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    top: 100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 200,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 300,
    left: 50,
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
  featureIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  featureIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    padding: 12,
    borderRadius: 12,
    minWidth: 65,
    marginHorizontal: 5,
  },
  featureText: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginTop: 4,
    fontWeight: '600',
  },
});
