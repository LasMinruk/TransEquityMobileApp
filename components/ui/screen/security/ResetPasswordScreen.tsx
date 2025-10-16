import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { TextInput, IconButton } from "react-native-paper";
import { COLORS } from "@/constants/CollorPallet";
import { getUsersRaw, setUsersRaw } from "@/utils/storage";

const logo = require("../../../../assets/images/logo/logo_t.png");
const { width } = Dimensions.get("window");

export default function ResetPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDisplayState, setPasswordDisplayState] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleResetPassword = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match!");
      return;
    }

    const users = await getUsersRaw<any[]>();
    const userIndex = users.findIndex(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (userIndex === -1) {
      Alert.alert("No account found with that email.");
      return;
    }

    users[userIndex].password = password;
    await setUsersRaw(users);

    Alert.alert("Password updated successfully!", "You can now log in with your new password.", [
      {
        text: "Go to Login",
        onPress: () => navigation.reset({
          index: 0,
          routes: [{ name: "Login" }], // ✅ resets stack so user can’t go back here
        }),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.navigate("Login")}
          style={styles.backButton}
          iconColor={COLORS.blue}
        />

        <Animated.View style={[styles.logoWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>Enter your email and new password below.</Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.formGroup}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              style={styles.input}
              theme={{ roundness: 12 }}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              label="New Password"
              value={password}
              secureTextEntry={!passwordDisplayState}
              onChangeText={setPassword}
              right={
                <TextInput.Icon
                  size={20}
                  icon={passwordDisplayState ? "eye" : "eye-off"}
                  onPress={() => setPasswordDisplayState(!passwordDisplayState)}
                />
              }
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              theme={{ roundness: 12 }}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              secureTextEntry={!passwordDisplayState}
              onChangeText={setConfirmPassword}
              right={
                <TextInput.Icon
                  size={20}
                  icon={passwordDisplayState ? "eye" : "eye-off"}
                  onPress={() => setPasswordDisplayState(!passwordDisplayState)}
                />
              }
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              theme={{ roundness: 12 }}
            />
          </View>

          <TouchableOpacity onPress={handleResetPassword} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset Password</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  backButton: { marginTop: 20, marginLeft: 10 },
  logoWrapper: { alignItems: "center", marginTop: 30, paddingHorizontal: 20 },
  logo: { width: width * 0.7, height: 130, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.blue, marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  formContainer: { marginTop: 40, paddingHorizontal: 24 },
  formGroup: { marginBottom: 18 },
  input: { backgroundColor: "#fff" },
  resetButton: {
    backgroundColor: COLORS.blue,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  resetText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
