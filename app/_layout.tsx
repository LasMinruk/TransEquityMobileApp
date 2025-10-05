import { DarkTheme as NavDark, DefaultTheme as NavLight, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Keep the native splash screen visible while we prepare the app
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const paperTheme = colorScheme === 'dark'
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: Colors.dark.tint,
          secondary: '#34B7F1',
          surface: '#111B21',
          background: Colors.dark.background,
          onPrimary: '#ffffff',
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: Colors.light.tint,
          secondary: '#34B7F1',
          surface: '#ffffff',
          background: '#ECE5DD',
          onPrimary: '#ffffff',
        },
      };

  const navTheme = colorScheme === 'dark'
    ? {
        ...NavDark,
        colors: {
          ...NavDark.colors,
          primary: Colors.dark.tint,
          background: Colors.dark.background,
          text: Colors.dark.text,
          card: '#111B21',
          border: '#22303C',
        },
      }
    : {
        ...NavLight,
        colors: {
          ...NavLight.colors,
          primary: Colors.light.tint,
          background: '#ECE5DD',
          text: Colors.light.text,
          card: '#ffffff',
          border: '#E5E7EB',
        },
      };

  // Simulate/perform any startup work here, then hide the splash
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Simulate staged preload work and animate progress over ~3s
        const steps = 30; // 30 x 100ms = 3000ms
        for (let i = 1; i <= steps; i++) {
          await new Promise((r) => setTimeout(r, 100));
          setProgress(Math.min(98, Math.round((i / steps) * 98)));
        }
        // TODO: replace with real preload (fonts, assets, API)
      } finally {
        if (mounted) {
          setProgress(100);
          setIsAppReady(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAppReady]);

  const splashBg = '#FFFFFF';
  const barBg = useMemo(
    () => (colorScheme === 'dark' ? '#111B21' : '#E5E7EB'),
    [colorScheme]
  );
  const barFill = useMemo(
    () => (colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint),
    [colorScheme]
  );

  return (
    <ThemeProvider value={navTheme}>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          {!isAppReady && (
            <View style={{ position: 'absolute', zIndex: 9999, left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: splashBg, paddingHorizontal: 28 }}>
              <Image source={require('../assets/images/splash-icon.png')} style={{ width: 128, height: 128, resizeMode: 'contain', marginBottom: 16 }} />
              <Text style={{ color: colorScheme === 'dark' ? '#E9EDEF' : '#111827', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>TransitEquity</Text>
              <Text style={{ color: colorScheme === 'dark' ? '#9BA1A6' : '#6B7280', marginBottom: 18 }}>Loading...</Text>
              <View style={{ width: '80%', maxWidth: 360, height: 10, borderRadius: 6, backgroundColor: barBg, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progress}%`, backgroundColor: barFill, borderRadius: 6 }} />
              </View>
            </View>
          )}
          <Stack
            screenOptions={{
              headerBackTitleVisible: false,
              headerBackTitle: ' ',
              headerTintColor: Colors[colorScheme ?? 'light'].tint,
              headerTitleStyle: { textTransform: 'capitalize', fontWeight: '700' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ title: 'Profile' }} />
            <Stack.Screen name="admin" options={{ title: 'Admin' }} />
            <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
            <Stack.Screen name="reviews" options={{ title: 'Reviews' }} />
            <Stack.Screen name="login" options={{ title: 'Sign In' }} />
            <Stack.Screen name="register" options={{ title: 'Register' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </AuthProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
