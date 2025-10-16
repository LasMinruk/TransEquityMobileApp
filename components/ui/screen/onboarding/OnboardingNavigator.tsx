import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/CollorPallet';
import OnboardingScreen1 from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';
import OnboardingScreen3 from './OnboardingScreen3';

const { width } = Dimensions.get('window');

interface OnboardingNavigatorProps {
  onFinish: () => void;
  onGetStarted?: () => void;
}

export default function OnboardingNavigator({ onFinish, onGetStarted }: OnboardingNavigatorProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const screens = [
    { component: OnboardingScreen1, key: 'screen1' },
    { component: OnboardingScreen2, key: 'screen2' },
    { component: OnboardingScreen3, key: 'screen3' },
  ];

  const nextScreen = () => {
    if (currentScreen < screens.length - 1) {
      // Animate out current screen
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change screen
        setCurrentScreen(currentScreen + 1);
        // Animate in new screen
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Last screen - finish onboarding
      if (onGetStarted) {
        onGetStarted();
      } else {
        onFinish();
      }
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      // Animate out current screen
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change screen
        setCurrentScreen(currentScreen - 1);
        // Animate in new screen
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const skipOnboarding = () => {
    onFinish();
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <MaterialCommunityIcons name="close" size={24} color={COLORS.darkGray} />
      </TouchableOpacity>

      {/* Current Screen */}
      <Animated.View 
        style={[
          styles.screensContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {(() => {
          const ScreenComponent = screens[currentScreen].component;
          return (
            <View style={styles.screen}>
              <ScreenComponent />
            </View>
          );
        })()}
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {/* Page Indicators */}
        <View style={styles.pageIndicators}>
          {screens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentScreen ? COLORS.primary : COLORS.gray,
                  width: index === currentScreen ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentScreen > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={prevScreen}>
              <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.primary} />
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={nextScreen}>
            <Text style={styles.nextButtonText}>
              {currentScreen === screens.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <MaterialCommunityIcons 
              name={currentScreen === screens.length - 1 ? 'check' : 'chevron-right'} 
              size={24} 
              color={COLORS.light} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: COLORS.gray,
    borderRadius: 20,
    padding: 10,
  },
  screensContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  bottomNavigation: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  navButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 5,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nextButtonText: {
    fontSize: 16,
    color: COLORS.light,
    marginRight: 8,
    fontWeight: 'bold',
  },
});
