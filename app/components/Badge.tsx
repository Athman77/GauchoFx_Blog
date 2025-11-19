import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/theme';

type BadgeProps = {
  text: string;
  color?: string;
  textColor?: string;
};

export default function Badge({ text, color = COLORS.secondary, textColor = COLORS.onSecondary }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}> 
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  text: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
  },
});
