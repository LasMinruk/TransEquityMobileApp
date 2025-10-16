import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { COLORS } from '@/constants/CollorPallet';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon, TextInput } from 'react-native-paper';

const logo = require('../../../../assets/images/logo/logo_t.png');
const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      Alert.alert('Login successful!');
      // Navigation handled in StackNavigator via user.role
    } else {
      Alert.alert('Invalid credentials');
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
          <Text style={styles.appTitle}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue your journey</Text>
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

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ResetPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
            <Text style={styles.logInText}>Log In</Text>
          </TouchableOpacity>

          <Text style={styles.separateText}>OR</Text>

          <TouchableOpacity
            style={[styles.logInButton, styles.registerButton]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.registerText}>Register with Email</Text>
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
    marginTop: 60,
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.6, // responsive logo
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#fff',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.blue,
    fontWeight: '600',
  },
  logInButton: {
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
  },
  logInText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '600',
  },
  separateText: {
    textAlign: 'center',
    marginVertical: 10,
    marginTop: 20,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  socialLogInWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconOuter: {
    backgroundColor: COLORS.darkGray,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  registerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
