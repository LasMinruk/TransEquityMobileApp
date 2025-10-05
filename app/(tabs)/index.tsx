import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Branding */}
        <Text style={styles.logo}>TransitEquity</Text>
        <Text style={styles.subtitle}>
          {user ? `Welcome back, ${user.name}` : 'Empowering fair and accessible transit for everyone.'}
        </Text>

        {/* Auth Section */}
        <View style={styles.section}>
          {!user ? (
            <View style={styles.row}>
              <Button
                icon="login"
                mode="contained"
                buttonColor="#25D366"
                textColor="white"
                style={styles.authButton}
                onPress={() => router.push('/login' as any)}
                uppercase={false}
                contentStyle={{ paddingVertical: 10 }}
              >
                Login
              </Button>
              <Button
                icon="account-plus"
                mode="outlined"
                textColor="#128C7E"
                style={styles.authButton}
                onPress={() => router.push('/register' as any)}
                uppercase={false}
                contentStyle={{ paddingVertical: 10 }}
              >
                Register
              </Button>
            </View>
          ) : (
            <Button
              icon="logout"
              mode="outlined"
              textColor="#128C7E"
              style={styles.authButton}
              onPress={logout}
              uppercase={false}
              contentStyle={{ paddingVertical: 10 }}
            >
              Logout
            </Button>
          )}
        </View>

        {/* Navigation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.navButtons}>
            {['reviews', 'analytics', 'profile', 'admin'].map((screen) => {
              const iconMap: Record<string, string> = {
                reviews: 'star',
                analytics: 'chart-bar',
                profile: 'account',
                admin: 'cog',
              };
              return (
                <Button
                  key={screen}
                  icon={iconMap[screen]}
                  mode="contained"
                  buttonColor="#25D366"
                  textColor="white"
                  style={styles.navButton}
                  onPress={() => router.push(`/${screen}` as any)}
                  uppercase={false}
                  contentStyle={{ paddingVertical: 12 }}
                >
                  {screen.charAt(0).toUpperCase() + screen.slice(1)}
                </Button>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1D4ED8',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  section: {
    marginVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  authButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    minWidth: 110,
    marginHorizontal: 2,
    elevation: 2,
  },
  navButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  navButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    minWidth: 120,
    marginVertical: 4,
    elevation: 2,
  },
});
