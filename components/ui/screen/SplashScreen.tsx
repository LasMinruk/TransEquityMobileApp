import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, Image } from "react-native";
import Constants from "expo-constants";
import { COLORS } from "@/constants/CollorPallet";

const { width, height } = Dimensions.get("window");

// ✅ Correct logo path
const logo = require("@/assets/images/logo/logo_t.png");

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Parallel fade + scale animation for logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
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
      {/* Animated Logo Section */}
      <Animated.Image
        source={logo}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
        Smart roads. Smarter journeys
      </Animated.Text>

      {/* Footer */}
      <View style={styles.bottom}>
        <Text style={styles.footerText}>
          Version: {Constants.expoConfig?.version ?? "unknown"}
        </Text>
        <Text style={styles.footerText}>From: Y3S2-22</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.85,
    height: height * 0.6,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.light,
    textAlign: "center",
    marginTop: 30,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
  },
  bottom: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 13,
    color: COLORS.lightBlue,
  },
});
