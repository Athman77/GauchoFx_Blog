import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { COLORS, RADIUS } from '../../lib/theme';

type AvatarProps = {
  uri: string;
  size?: number;
  bordered?: boolean;
};

export default function Avatar({ uri, size = 40, bordered = false }: AvatarProps) {
  return (
    <View style={[styles.wrapper, bordered && { padding: 2, borderRadius: size / 2 + 2 }]}> 
      <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
  },
  image: {
    resizeMode: 'cover',
  },
});
