import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  showValue?: boolean;
  onRatingChange?: (rating: number) => void;
  color?: string;
  emptyColor?: string;
  style?: any;
  textStyle?: any;
}

/**
 * Reusable StarRating component for display and input
 * @param rating - Current rating value (0 to maxRating)
 * @param maxRating - Maximum rating value (default: 5)
 * @param size - Size of stars in pixels (default: 16)
 * @param interactive - Whether stars can be tapped to change rating (default: false)
 * @param showValue - Whether to show numeric rating value (default: false)
 * @param onRatingChange - Callback when rating changes (required if interactive)
 * @param color - Color for filled stars (default: '#f59e0b')
 * @param emptyColor - Color for empty stars (default: '#d1d5db')
 * @param style - Additional styles for container
 * @param textStyle - Additional styles for text
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  showValue = false,
  onRatingChange,
  color = '#f59e0b',
  emptyColor = '#d1d5db',
  style,
  textStyle,
}) => {
  const handleStarPress = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= rating;
    const starColor = isFilled ? color : emptyColor;
    
    const StarComponent = interactive ? TouchableOpacity : View;
    
    return (
      <StarComponent
        key={starNumber}
        style={styles.star}
        onPress={interactive ? () => handleStarPress(starNumber) : undefined}
        activeOpacity={interactive ? 0.7 : 1}
      >
        <Text
          style={[
            styles.starText,
            {
              fontSize: size,
              color: starColor,
            },
            textStyle,
          ]}
        >
          ★
        </Text>
      </StarComponent>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }, (_, index) => renderStar(index + 1))}
      </View>
      {showValue && (
        <Text style={[styles.ratingText, textStyle]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

/**
 * Display-only StarRating component
 */
export const StarRatingDisplay: React.FC<Omit<StarRatingProps, 'interactive' | 'onRatingChange'>> = (props) => (
  <StarRating {...props} interactive={false} />
);

/**
 * Interactive StarRating component for input
 */
export const StarRatingInput: React.FC<Omit<StarRatingProps, 'interactive'>> = (props) => (
  <StarRating {...props} interactive={true} />
);

/**
 * StarRating with numeric value display
 */
export const StarRatingWithValue: React.FC<Omit<StarRatingProps, 'showValue'>> = (props) => (
  <StarRating {...props} showValue={true} />
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  starText: {
    fontWeight: '400',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

export default StarRating;
