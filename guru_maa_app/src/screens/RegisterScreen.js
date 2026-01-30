// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';

// import Logo from './logoscreen';
// import { registerUser } from '../api/auth.api'; // <-- your API

// function RegisterScreen({ navigation }) {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const onRegister = async () => {
//     if (!name || !email || !password) {
//       Alert.alert('Validation Error', 'All fields are required');
//       return;
//     }

//     if (password.length < 6) {
//       Alert.alert('Weak Password', 'Password must be at least 6 characters');
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await registerUser({
//         name: name.trim(),
//         email: email.trim(),
//         password,
//       });

//       // Example: backend returns userId / otpToken
//       navigation.navigate('EnterOtp', {
//         email: email.trim(),
//         userId: response?.data.userId,
//       });
//     } catch (error) {
//       Alert.alert(
//         'Registration Failed',
//         error?.message || 'Unable to register. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={styles.container}>
//         {/* HEADER */}
//         <View style={styles.header}>
//           <Logo size={96} />
//           <Text style={styles.appName}>Gurumaa</Text>
//           <Text style={styles.appTagline}>
//             Create your secure Gurumaa account
//           </Text>
//         </View>

//         {/* FORM */}
//         <View style={styles.formWrapper}>
//           <Text style={styles.title}>Register</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Full Name"
//             value={name}
//             onChangeText={setName}
//           />

//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             autoCapitalize="none"
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//           />

//           <TextInput
//             style={styles.input}
//             placeholder="Password"
//             secureTextEntry
//             value={password}
//             onChangeText={setPassword}
//           />

//           <TouchableOpacity
//             style={[styles.primaryButton, loading && styles.disabledButton]}
//             onPress={onRegister}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#ffffff" />
//             ) : (
//               <Text style={styles.primaryButtonText}>Register</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => navigation.navigate('Login')}
//             disabled={loading}
//           >
//             <Text style={styles.linkText}>
//               Already have an account? Login
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },

//   header: {
//     paddingTop: 64,
//     paddingBottom: 24,
//     alignItems: 'center',
//   },

//   appName: {
//     marginTop: 12,
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#275fb4',
//   },

//   appTagline: {
//     marginTop: 6,
//     fontSize: 14,
//     color: '#6b7280',
//     textAlign: 'center',
//     paddingHorizontal: 32,
//   },

//   formWrapper: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//   },

//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#111827',
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//     borderRadius: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     marginBottom: 14,
//     fontSize: 15,
//     color: '#111827',
//   },

//   primaryButton: {
//     backgroundColor: '#007bff',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 12,
//   },

//   disabledButton: {
//     opacity: 0.6,
//   },

//   primaryButtonText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },

//   linkText: {
//     color: '#007bff',
//     textAlign: 'center',
//     marginTop: 10,
//     fontSize: 14,
//   },
// });

// export default RegisterScreen;


import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';

import Logo from './logoscreen';
import { registerUser } from '../api/auth.api';

const { height } = Dimensions.get('window');
const isLandscape = height < 500;

function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigation.navigate('EnterOtp', {
        email: email.trim(),
        userId: response?.data?.userId,
      });
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error?.response?.data?.message ||
          'Unable to register. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={[styles.header, isLandscape && styles.headerLandscape]}>
          <Logo size={isLandscape ? 72 : 96} />
          <Text style={styles.appName}>Gurumaa</Text>

          {!isLandscape && (
            <Text style={styles.appTagline}>
              Create your secure Gurumaa account
            </Text>
          )}
        </View>

        {/* FORM */}
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={onRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 20,
  },

  header: {
    paddingTop: 64,
    paddingBottom: 24,
    alignItems: 'center',
  },

  headerLandscape: {
    paddingTop: 24,
    paddingBottom: 12,
  },

  appName: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#275fb4',
  },

  appTagline: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  formWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },

  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 15,
    color: '#111827',
  },

  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  linkText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default RegisterScreen;

