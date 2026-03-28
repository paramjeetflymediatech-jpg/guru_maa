import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

function Logo({ size = 120 }) {
  return (
    <View style={[styles.imageContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={require('../../assets/logo.png')}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  image: {
    width: 120,
    height: 120,
  },
});

export default Logo;
