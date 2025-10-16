import React from 'react';
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/CollorPallet';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileIconProps {
  size?: number;
  onPress?: () => void;
  style?: any;
}

export default function ProfileIcon({ size = 32, onPress, style }: ProfileIconProps) {
  const { user } = useAuth();

  const ProfileImage = () => {
    if (user?.profileImageUri) {
      return (
        <Image 
          source={{ uri: user.profileImageUri }}
          style={[styles.profileImage, { width: size, height: size }]}
        />
      );
    }

    return (
      <View style={[styles.defaultIcon, { width: size, height: size }]}>
        <Ionicons 
          name="person-circle" 
          size={size} 
          color={COLORS.primary} 
        />
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[{ marginRight: 18 }, style]}>
        <ProfileImage />
      </TouchableOpacity>
    );
  }

  return (
    <View style={style}>
      <ProfileImage />
    </View>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  defaultIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
