import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

function Logo({ size = 120 }) {
  return (
    <View style={styles.imageContainer}>
      <Image
        source={require('../../assets/logo.png')}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
  },
});

export default Logo;
