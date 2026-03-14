// import React from 'react';
// import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import Logo from './logoscreen';

// function OnboardingScreen({ navigation }) {
//   return (
//     <View style={styles.container}>
//       <Logo size={140} />
//       <View style={styles.centerContent}>
//         <Text style={styles.title}>Welcome to Gurumaa</Text>
//         <Text style={styles.subtitle}>
//           Read important documents securely after you sign in.
//         </Text>
//         <View style={styles.subcontainer}>
//           <TouchableOpacity
//             style={styles.primaryButton}
//             onPress={() => navigation.navigate('Login')}
//           >
//             <Text style={styles.primaryButtonText}>Login</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.secondaryButton}
//             onPress={() => navigation.navigate('Register')}
//           >
//             <Text style={styles.secondaryButtonText}>Register</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     alignItems: 'center',
//     paddingTop: 60,
//   },
//   subcontainer: {
//     width: 250,
//   },

//   centerContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   subtitle: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 32,
//     color: '#555555',
//   },
//   primaryButton: {
//     backgroundColor: '#007bff',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   primaryButtonText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//   },
//   secondaryButton: {
//     borderWidth: 1,
//     borderColor: '#007bff',
//     paddingVertical: 12,
//     padding: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   secondaryButtonText: {
//     color: '#007bff',
//     fontWeight: 'bold',
//   },
// });

// export default OnboardingScreen;


import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';

import Logo from './logoscreen';
import colors from '../constants/theme';


const { height } = Dimensions.get('window');
const isLandscape = height < 500;

function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.topDecoration}>
        <View style={styles.circle1}></View>
        <View style={styles.circle2}></View>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO */}
        <View style={[styles.logoContainer, isLandscape && styles.logoLandscape]}>
          <Logo size={isLandscape ? 90 : 140} />
        </View>

        {/* CONTENT */}
        <View style={styles.centerContent}>
          <Text style={styles.title}>Welcome to Gurumaa</Text>
          
          {!isLandscape && (
            <Text style={styles.subtitle}>
              Your gateway to sacred wisdom. Read important documents securely after you sign in.
            </Text>
          )}

          {/* Feature highlights */}
          {!isLandscape && (
            <View style={styles.featureContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>📚</Text>
                </View>
                <Text style={styles.featureText}>Sacred Texts</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>🔒</Text>
                </View>
                <Text style={styles.featureText}>Secure Access</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>✨</Text>
                </View>
                <Text style={styles.featureText}>Daily Wisdom</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate('Auth', { screen: 'ForgotPassword' })}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.bottomCircle}></View>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },

  topDecoration: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: 0,
    height: 200,
    zIndex: -1,
  },

  circle1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#6200ee20',
  },

  circle2: {
    position: 'absolute',
    top: 30,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff6f0015',
  },

  bottomDecoration: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 200,
    height: 200,
    zIndex: -1,
  },

  bottomCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#6200ee10',
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logoLandscape: {
    marginBottom: 12,
  },

  logoWrapper: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 100,
    shadowColor: '#6200ee',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.textSecondary,
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
  },

  featureItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
  },

  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  featureEmoji: {
    fontSize: 22,
  },

  featureText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  buttonContainer: {
    width: '100%',
    maxWidth: 280,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: 0.5,
  },

  forgotPasswordLink: {
    marginTop: 16,
    alignItems: 'center',
  },

  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
