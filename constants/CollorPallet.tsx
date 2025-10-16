export const COLORS = {
    // Blue Theme Colors
    primary: '#2980b9',        // Main blue
    secondary: '#3498db',      // Lighter blue
    accent: '#1abc9c',         // Teal accent
    light: '#ffffff',          // White
    dark: '#2c3e50',          // Dark blue-gray
    darkGray: '#34495e',      // Medium blue-gray
    gray: '#ecf0f1',          // Light gray
    lightBlue: '#e8f4fd',     // Very light blue
    success: '#27ae60',       // Green for success
    warning: '#f39c12',       // Orange for warnings
    error: '#e74c3c',         // Red for errors
    
    // Legacy colors for compatibility
    blue: '#2980b9',
    orange: '#f39c12'
} as const;

export type ColorTypes = keyof typeof COLORS;
