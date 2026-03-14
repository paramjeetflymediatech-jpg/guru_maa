import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Easing,
} from 'react-native';
import colors from '../constants/theme';

const { width, height } = Dimensions.get('window');

function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // First phase: Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Second phase: Show button after logo animation
    const buttonTimer = setTimeout(() => {
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }, 1200);

    return () => clearTimeout(buttonTimer);
  }, [fadeAnim, scaleAnim, slideAnim, buttonAnim]);

  const handleGetStarted = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to Onboarding
      navigation.replace('Onboarding');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Background gradient effect with animated views */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: fadeAnim }]} />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/splash.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.appName}>Gurumaa</Text>
        <Text style={styles.tagline}>Spiritual Wisdom for Modern Life</Text>
        <Text style={styles.subtitle}>Discover ancient wisdom for today's journey</Text>
      </Animated.View>

      {/* Get Started Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: buttonAnim,
            transform: [
              { translateY: Animated.multiply(buttonAnim, 30) },
              { scale: buttonScale },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 200,
  },
  circle1: {
    width: 400,
    height: 400,
    backgroundColor: '#F3E8FF',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 300,
    height: 300,
    backgroundColor: '#FFEDD5',
    bottom: -50,
    left: -50,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.85,
    height: width * 0.85,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 10,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 3,
    textShadowColor: 'rgba(98, 0, 238, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonArrow: {
    color: '#ffffff',
    fontSize: 20,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
