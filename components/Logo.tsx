import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/CollorPallet';

const logo = require('@/assets/images/logo/logo_t.png');

interface LogoProps {
  size?: number;
  style?: any;
}

export default function Logo({ size = 50, style }: LogoProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.roundBackground, { width: size, height: size }]}>
        <Image
          source={logo}
          style={[styles.logo, { width: size * 0.75, height: size * 0.75 }]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBackground: {
    backgroundColor: COLORS.light,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    // Logo image styles
  },
});
