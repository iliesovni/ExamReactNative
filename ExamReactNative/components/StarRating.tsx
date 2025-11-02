import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, onRatingChange, size = 24 }: Props) {
  const isInteractive = !!onRatingChange;

  const handlePress = (value: number) => {
    if (isInteractive) {
      onRatingChange?.(value);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= rating;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => handlePress(value)}
            disabled={!isInteractive}
            activeOpacity={isInteractive ? 0.7 : 1}
            style={styles.starContainer}
          >
            <Text style={[styles.star, { fontSize: size }, filled && styles.starFilled]}>
              ★
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starContainer: {
    padding: 2,
  },
  star: {
    color: '#ddd',
    fontSize: 24,
  },
  starFilled: {
    color: '#FFD700',
  },
});
