import { Stack } from 'expo-router'; // Import Stack from expo-router
import { AuthProvider } from '@/contexts/AuthContext'; // Import your AuthProvider (adjust path if needed)

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} /> {/* This renders your StackNavigator and all child routes/tabs */}
    </AuthProvider>
  );
}