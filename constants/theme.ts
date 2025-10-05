/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// WhatsApp-like palette
const WA_PRIMARY = '#25D366'; // WhatsApp green
const WA_PRIMARY_DARK = '#128C7E';
const WA_BG_DARK = '#0B141A';
const WA_SURFACE_DARK = '#111B21';
const WA_TEXT_LIGHT = '#E9EDEF';
const WA_TEXT_DARK = '#111827';
const tintColorLight = WA_PRIMARY;
const tintColorDark = WA_PRIMARY;

export const Colors = {
  light: {
    text: WA_TEXT_DARK,
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6b7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: WA_TEXT_LIGHT,
    background: WA_BG_DARK,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
