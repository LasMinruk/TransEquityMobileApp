import { useAuth } from '@/contexts/AuthContext';
import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import SplashScreen from '@/components/ui/screen/SplashScreen';
import OnboardingNavigator from '@/components/ui/screen/onboarding/OnboardingNavigator';
import StackNavigator from '../navigation/stack-navigation/StackNavigator';
import { hasCompletedOnboarding, setOnboardingCompleted } from '@/utils/storage';

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Check if onboarding has been completed
      const completed = await hasCompletedOnboarding();
      setOnboardingCompletedState(completed);

      // Show splash for 3 seconds
      const splashTimer = setTimeout(() => {
        setShowSplash(false);
        // Show onboarding if user is not logged in/registered OR if onboarding not completed
        if (!user || !completed) {
          setShowOnboarding(true);
        }
      }, 3000);

      return () => clearTimeout(splashTimer);
    };

    initializeApp();
  }, [user]);

  const handleOnboardingFinish = async () => {
    await setOnboardingCompleted();
    setShowOnboarding(false);
    setOnboardingCompletedState(true);
  };

  const handleGetStarted = async () => {
    await setOnboardingCompleted();
    setShowOnboarding(false);
    setOnboardingCompletedState(true);
    // The StackNavigator will handle showing login/register screens for unauthenticated users
  };

  // Show splash screen
  if (showSplash || authLoading) {
    return <SplashScreen />;
  }

  // Show onboarding for unauthenticated users or first-time users
  if (showOnboarding && (!user || !onboardingCompleted)) {
    return (
      <OnboardingNavigator 
        onFinish={handleOnboardingFinish} 
        onGetStarted={handleGetStarted}
      />
    );
  }

  // Show main app
  return (
    <View style={styles.container}>
      <StackNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
