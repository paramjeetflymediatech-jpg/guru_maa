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

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { loginUser } from '../api/auth.api';
// // import AsyncStorage from '@react-native-async-storage/async-storage';

// function LoginScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const onLogin = async () => {
//     if (!email || !password) {
//       Alert.alert('Validation Error', 'Email and password are required');
//       return;
//     }
//     try {
//       setLoading(true);
//       const response = await loginUser({
//         email: email.trim(),
//         password,
//       });
//       let user = response?.data?.user;
//       console.log(user,'ss')

//       if (!user?.isVerified) {
//         Alert.alert(
//           'Login Failed',
//           response?.data?.message || 'OTP verification required',
//         );
//         return navigation.navigate('EnterOtp', {
//           email: email.trim(),
//           userId: user.id,
//         });
//       }
//       // 👉 Store token & user if API returns them
//       if (response?.data?.token) {
//         await AsyncStorage.setItem('token', response?.data?.token);
//       }
//       if (user) {
//         await AsyncStorage.setItem('user', JSON.stringify(user));
//       }
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'Library' }],
//       });
//     } catch (error) {
//       console.log(error, 'ererrr');
//       Alert.alert(
//         'Login Failed',
//         error?.response?.data?.message || 'Invalid email or password',
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
//             Secure spiritual library at your fingertips
//           </Text>
//         </View>

//         {/* FORM */}
//         <View style={styles.formWrapper}>
//           <Text style={styles.title}>Login</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             placeholderTextColor="#9ca3af"
//             autoCapitalize="none"
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//           />

//           <TextInput
//             style={styles.input}
//             placeholder="Password"
//             placeholderTextColor="#9ca3af"
//             secureTextEntry
//             value={password}
//             onChangeText={setPassword}
//           />

//           <TouchableOpacity
//             style={[styles.primaryButton, loading && styles.disabledButton]}
//             onPress={onLogin}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#ffffff" />
//             ) : (
//               <Text style={styles.primaryButtonText}>Login</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => navigation.navigate('Register')}
//             disabled={loading}
//           >
//             <Text style={styles.linkText}>
//               Don't have an account? Register
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => navigation.navigate('ForgotPassword')}
//             disabled={loading}
//           >
//             <Text style={styles.secondaryLinkText}>Forgot your password?</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexWrap:"wrap",
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
//   secondaryLinkText: {
//     color: '#6b7280',
//     textAlign: 'center',
//     marginTop: 6,
//     fontSize: 13,
//   },
// });

// export default LoginScreen;



import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';

import Logo from './logoscreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/auth.api';
import colors, { spacing, typography, radius } from '../constants/theme';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

const { height } = Dimensions.get('window');
const isLandscape = height < 500;

function LoginScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = () => {
    Alert.alert(t('profile.changeLanguage'), '', [
      { text: 'English', onPress: () => i18n.changeLanguage('en') },
      { text: 'हिन्दी', onPress: () => i18n.changeLanguage('hi') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const onLogin = async () => {
    if (!email || !password) {
      setError(t('register.fieldsRequired'));
      return;
    }

    setError('');

    try {
      setLoading(true);
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      const user = response?.data?.user;

      if (!user?.isVerified) {
        // Navigate to OTP
        return navigation.navigate('EnterOtp', {
          email: email.trim(),
          userId: user.id,
        });
      }

      if (response?.data?.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'));
      console.log('Login error:', err?.message);
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
          <TouchableOpacity 
            style={styles.langSelector} 
            onPress={handleLanguageChange}
          >
            <Text style={styles.langText}>🌐 {i18n.language === 'en' ? 'English' : 'हिन्दी'}</Text>
          </TouchableOpacity>
          <Logo size={isLandscape ? 72 : 96} />
          <Text style={styles.appName}>Gurumaa</Text>
          {!isLandscape && (
            <Text style={styles.appTagline}>
              {t('register.tagline')}
            </Text>
          )}
        </View>

        {/* FORM */}
        <View style={styles.formWrapper}>
          <Text style={styles.title}>{t('common.login')}</Text>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={t('register.email')}
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
          />

          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={t('register.password')}
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
          />

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={onLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('common.login')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              {t('register.dontHaveAccount')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.secondaryLinkText}>
              {t('register.forgotPassword')}
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
    backgroundColor: colors.background,
    paddingBottom: spacing.xl,
  },

  header: {
    paddingTop: 80,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },

  headerLandscape: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  appName: {
    marginTop: spacing.sm,
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.primary,
  },

  appTagline: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: typography.body * 1.5,
  },

  formWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  title: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    fontSize: typography.input,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecondary,
    minHeight: 56,
  },

  inputError: {
    borderColor: colors.error || '#DC2626',
  },

  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },

  errorText: {
    color: colors.error || '#DC2626',
    fontSize: typography.bodySmall,
    textAlign: 'center',
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minHeight: 56, // Larger touch target
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: typography.button,
  },

  linkText: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: typography.body,
    fontWeight: '600',
    padding: spacing.sm, // Larger touch target
  },

  secondaryLinkText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: typography.bodySmall,
  },
  langSelector: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  langText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
