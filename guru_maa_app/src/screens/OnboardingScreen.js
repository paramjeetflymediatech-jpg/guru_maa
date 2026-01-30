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
} from 'react-native';

import Logo from './logoscreen';

const { height } = Dimensions.get('window');
const isLandscape = height < 500;

function OnboardingScreen({ navigation }) {
  return (
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
            Read important documents securely after you sign in.
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingVertical: 24,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  logoLandscape: {
    marginBottom: 12,
  },

  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#555555',
  },

  buttonContainer: {
    width: 260,
  },

  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OnboardingScreen;
