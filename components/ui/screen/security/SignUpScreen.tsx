import { useAuth } from '@/contexts/AuthContext';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS } from "@/constants/CollorPallet";
import { useEffect, useRef, useState } from "react";
import { Icon, TextInput } from "react-native-paper";

const logo = require('../../../../assets/images/logo/logo_t.png');
const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [passwordDisplayState, setPasswordDisplayState] = useState(false);

  // Animation refs
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

  const handleRegister = async () => {
    const success = await register({ name: displayName, email, password });
    if (success) {
      navigation.navigate('SignUpVerifyEmail');
    } else {
      Alert.alert('Registration failed', 'Email may already be in use.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appTitle}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start your journey today</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.formGroup}>
            <TextInput
              label="Display Name"
              value={displayName}
              onChangeText={text => setDisplayName(text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              theme={{ roundness: 12 }}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={text => setEmail(text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              theme={{ roundness: 12 }}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              label="Password"
              value={password}
              secureTextEntry={!passwordDisplayState}
              onChangeText={text => setPassword(text)}
              right={
                <TextInput.Icon
                  size={20}
                  icon={passwordDisplayState ? 'eye' : 'eye-off'}
                  onPress={() => setPasswordDisplayState(!passwordDisplayState)}
                />
              }
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              theme={{ roundness: 12 }}
            />
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handleRegister}>
            <Text style={styles.signUpText}>Register</Text>
          </TouchableOpacity>

          <Text style={styles.separateText}>OR</Text>

          <TouchableOpacity
            style={[styles.signUpButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryText}>Already have an account?</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.6, // Responsive width
    height: 100,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.blue,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#fff',
  },
  signUpButton: {
    backgroundColor: COLORS.blue,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: 20,
  },
  signUpText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '600',
  },
  separateText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.primary,
    marginTop: 0,
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
