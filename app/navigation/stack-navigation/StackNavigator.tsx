import { createStackNavigator } from '@react-navigation/stack';
import HomeBottomTabNavigation from '../tab-navigation/HomeBottomTabNavigation';
import ReviewsScreen from '@/components/ui/screen/home/ReviewsScreen';
import ProfileScreen from '@/components/ui/screen/home/ProfileScreen';
import LoginScreen from '@/components/ui/screen/security/LoginScreen';
import RegisterScreen from '@/components/ui/screen/security/SignUpScreen';
import SignUpVerifyEmailScreen from '@/components/ui/screen/security/SignUpVerifyEmailScreen';
import ChangePasswordScreen from '@/components/ui/screen/security/ChangePasswordScreen';
import ResetPasswordScreen from '@/components/ui/screen/security/ResetPasswordScreen';
import AdminScreen from '@/components/ui/screen/other/AdminScreen';
import { useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/components/ui/screen/SplashScreen';
import AdminBottomTabNavigation from '../tab-navigation/AdminBottomTabNavigation';

const Stack = createStackNavigator();

export default function StackNavigator() {
  const { user, loading } = useAuth();

  // if (loading) {
  //   return <SplashScreen onFinish={() => {}} />;
  // }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.role === 'admin' ? (
          <>
            <Stack.Screen
              name="AdminTabs"
              component={AdminBottomTabNavigation}
              options={{ title: 'Admin Dashboard' }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="HomeTabs" component={HomeBottomTabNavigation} />
            <Stack.Screen name="Reviews" component={ReviewsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen   name="SignUpVerifyEmailScreen"  component={SignUpVerifyEmailScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={RegisterScreen} />
          <Stack.Screen   name="SignUpVerifyEmailScreen"  component={SignUpVerifyEmailScreen} />
          {/* ✅ Reset password remains available for public users */}
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
