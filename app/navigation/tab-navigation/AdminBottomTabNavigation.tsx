import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from 'react-native';
import AdminScreen from '../../../components/ui/screen/other/AdminScreen';
import ProfileScreen from '../../../components/ui/screen/home/ProfileScreen';
import ReviewsScreen from '../../../components/ui/screen/home/ReviewsScreen';
import Logo from '../../../components/Logo';
import ProfileIcon from '../../../components/ProfileIcon';
import { COLORS } from "../../../constants/CollorPallet";
const Tab = createBottomTabNavigator();

export default function AdminBottomTabNavigation({ navigation }: any) {
  return (
    <Tab.Navigator
      initialRouteName="AdminHome"
      screenOptions={({ route, focused }: any) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'AdminHome') iconName = focused ? 'settings' : 'settings-outline';
          else if (route.name === 'Reveiws') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          // @ts-ignore
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
      })}
    >
      <Tab.Screen
        name="Reveiws"
        component={ReviewsScreen}
        options={{ title: 'Reviews' }}
      />
      <Tab.Screen
        name="AdminHome"
        component={AdminScreen}
        options={{
          title: 'Admin',
          headerLeft: () => (
            <Logo size={45} style={{ marginLeft: 10 }} />
          ),
          headerTitle: '',
          headerRight: () => (
            <ProfileIcon
              size={32}
              onPress={() => navigation.navigate('Profile')}
            />
          ),
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
