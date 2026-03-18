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
import colors, { spacing, typography, radius } from '../constants/theme';
import { useTranslation } from 'react-i18next';


const { height } = Dimensions.get('window');
const isLandscape = height < 500;

function RegisterScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');

  const handleLanguageChange = () => {
    Alert.alert(t('profile.changeLanguage'), '', [
      { text: 'English', onPress: () => i18n.changeLanguage('en') },
      { text: 'हिन्दी', onPress: () => i18n.changeLanguage('hi') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t('register.validationError'), t('register.fieldsRequired'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('register.weakPassword'), t('register.weakPassword'));
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
        t('register.failed'),
        error?.response?.data?.message ||
          t('common.error')
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
          {/* <TouchableOpacity 
            style={styles.langSelector} 
            onPress={handleLanguageChange}
          >
            <Text style={styles.langText}>🌐 {i18n.language === 'en' ? 'English' : 'हिन्दी'}</Text>
          </TouchableOpacity> */}
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
          <Text style={styles.title}>{t('register.title')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('register.fullName')}
            value={name}
            onChangeText={setName}
          />
 
          <TextInput
            style={styles.input}
            placeholder={t('register.email')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
 
          <TextInput
            style={styles.input}
            placeholder={t('register.password')}
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
              <Text style={styles.primaryButtonText}>{t('register.submit')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              {t('register.alreadyHaveAccount')}
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
    paddingBottom: spacing.lg,
  },

  header: {
    paddingTop: 64,
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
    marginTop: spacing.xs,
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
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
    marginBottom: spacing.md,
    fontSize: typography.input,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecondary,
    minHeight: 56, // Larger touch target
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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
    marginTop: spacing.sm,
    fontSize: typography.bodySmall,
    fontWeight: '600',
    padding: spacing.sm, // Larger touch target
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

export default RegisterScreen;
