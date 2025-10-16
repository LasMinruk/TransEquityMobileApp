import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from "react-native";
import ReviewsScreen from "../../../components/ui/screen/home/ReviewsScreen";
import AnalyticsScreen from "../../../components/ui/screen/home/AnalyticsScreen";
import MapScreen from "../../../components/ui/screen/home/MapScreen";
import ProfileScreen from "../../../components/ui/screen/home/ProfileScreen";
import Logo from "../../../components/Logo";
import ProfileIcon from "../../../components/ProfileIcon";
import { COLORS } from "../../../constants/CollorPallet";

const Tab = createBottomTabNavigator();

export default function HomeBottomTabNavigation({ navigation }: any) {
  return (
    <Tab.Navigator
      initialRouteName="Analytics"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: COLORS.light,
          borderTopWidth: 0.5,
          borderTopColor: COLORS.lightBlue,
          height: 60,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = "home-outline";

          switch (route.name) {
            case "Reviews":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "Analytics":
              iconName = focused ? "stats-chart" : "stats-chart-outline";
              break;
            case "Map":
              iconName = focused ? "map" : "map-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
      })}
    >
      {/* Analytics Tab */}
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: "Analytics",
          headerLeft: () => (
            <Logo size={45} style={{ marginLeft: 10 }} />
          ),
          headerTitle: "",
          headerRight: () => (
            <ProfileIcon
              size={32}
              onPress={() =>
                navigation.navigate("HomeTabs", { screen: "Profile" })
              }
            />
          ),
        }}
      />

      {/* Reviews Tab */}
      <Tab.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{
          title: "Reviews",
          headerLeft: () => (
            <Logo size={45} style={{ marginLeft: 10 }} />
          ),
          headerTitle: "",
          headerRight: () => (
            <ProfileIcon
              size={32}
              onPress={() =>
                navigation.navigate("HomeTabs", { screen: "Profile" })
              }
            />
          ),
        }}
      />

      {/* Map Tab */}
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: "Map",
          headerLeft: () => (
            <Logo size={45} style={{ marginLeft: 10 }} />
          ),
          headerTitle: "",
          headerRight: () => (
            <ProfileIcon
              size={32}
              onPress={() =>
                navigation.navigate("HomeTabs", { screen: "Profile" })
              }
            />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "700", color: COLORS.dark },
        }}
      />
    </Tab.Navigator>
  );
}
