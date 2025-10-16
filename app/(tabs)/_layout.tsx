// import { Tabs } from 'expo-router';
// import React from 'react';

// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
//         tabBarStyle: {
//           // Hide the bottom tab bar entirely
//           display: 'none',
//           backgroundColor: colorScheme === 'dark' ? '#111B21' : '#ffffff',
//           borderTopColor: colorScheme === 'dark' ? '#22303C' : '#E5E7EB',
//         },
//         tabBarShowLabel: false,
//         headerShown: false,
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Explore',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }

import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
