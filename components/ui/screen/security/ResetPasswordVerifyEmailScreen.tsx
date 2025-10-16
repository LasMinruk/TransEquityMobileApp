import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, IconButton } from "react-native-paper";
import { COLORS } from "@/constants/CollorPallet";

const logo = require("../../../../assets/images/logo/logo_t.png");
const { width } = Dimensions.get("window");

export default function ResetPasswordVerifyEmailScreen({ navigation }: any) {
  const [otp, setOtp] = useState("");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleVerify = () => {
    if (!otp.trim()) {
      alert("Please enter the verification code sent to your email.");
      return;
    }
    navigation.navigate("ResetPassword");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* 🔙 Back Button */}
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.navigate("Login")}
          style={styles.backButton}
          iconColor={COLORS.blue}
        />

        {/* 🧩 Animated Logo & Header */}
        <Animated.View
          style={[
            styles.logoWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            Please enter the OTP sent to your registered email address.
          </Text>
        </Animated.View>

        {/* 🔤 OTP Input Section */}
        <Animated.View
          style={[
            styles.inputOuter,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.formGroup}>
            <TextInput
              label="OTP Code"
              value={otp}
              keyboardType="number-pad"
              onChangeText={setOtp}
              mode="outlined"
              left={<TextInput.Icon icon="key" />}
              theme={{ roundness: 12 }}
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("ChangePassword")}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Change Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alert("Resend OTP functionality coming soon")}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>(30s) Resend Email</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleVerify} style={styles.verifyButton}>
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  backButton: {
    marginTop: 20,
    marginLeft: 10,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.7, // bigger logo (responsive)
    height: 130,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.blue,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginHorizontal: 16,
  },
  inputOuter: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#ffffff",
  },
  linkButton: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  linkText: {
    color: COLORS.blue,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  verifyButton: {
    backgroundColor: COLORS.blue,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: 30,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
