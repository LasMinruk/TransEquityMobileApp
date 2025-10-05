import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Surface, Text, TextInput } from 'react-native-paper';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    
    const ok = await login(email.trim(), password);
    if (!ok) {
      setError('Invalid credentials or inactive account');
      setLoading(false);
      return;
    }
    router.replace('/');
  };

  const emailError = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email !== 'admin';
  const isFormValid = email.trim() && password;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>sign in</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text variant="headlineMedium" style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your transit journey</Text>
          </View>

          {/* Form Card */}
          <Surface style={styles.formCard} elevation={4}>
            <View style={styles.formContent}>
              <TextInput
                label="Email or 'admin'"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                mode="outlined"
                returnKeyType="next"
                autoComplete="email"
                left={<TextInput.Icon icon="email" />}
                error={!!email && emailError}
                outlineColor="#e5e7eb"
                activeOutlineColor={Colors.light.tint}
                textColor="#111827"
              />
              <HelperText type={emailError ? 'error' : 'info'} visible={!!email} style={styles.helperText}>
                {emailError ? 'Enter a valid email or use admin' : 'We will never share your email.'}
              </HelperText>

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
                returnKeyType="done"
                autoComplete="password"
                left={<TextInput.Icon icon="lock" />}
                outlineColor="#e5e7eb"
                activeOutlineColor={Colors.light.tint}
                textColor="#111827"
              />

              {!!error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                mode="contained"
                onPress={onSubmit}
                style={[styles.button, !isFormValid && styles.buttonDisabled]}
                contentStyle={styles.buttonContent}
                uppercase={false}
                icon="login"
                buttonColor={Colors.light.tint}
                textColor="#ffffff"
                disabled={!isFormValid || loading}
                loading={loading}
              >
                Sign In
              </Button>
            </View>
          </Surface>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  formCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formContent: {
    padding: 24,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  helperText: {
    marginBottom: 16,
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  registerLink: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
});
