// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// function ProfileScreen({ navigation }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const stored = await AsyncStorage.getItem('user');
//         if (stored) {
//           setUser(JSON.parse(stored));
//         }
//       } catch (e) {
//         console.log('Failed to load user from storage', e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('token');
//       await AsyncStorage.removeItem('user');
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'AuthLoading' }],
//       });
//     } catch (e) {
//       console.log('Logout error', e);
//       Alert.alert('Logout Failed', 'Please try again.');
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Profile</Text>

//       {user ? (
//         <View style={styles.card}>
//           {user.name ? (
//             <View style={styles.row}>
//               <Text style={styles.label}>Name</Text>
//               <Text style={styles.value}>{user.name}</Text>
//             </View>
//           ) : null}

//           {user.email ? (
//             <View style={styles.row}>
//               <Text style={styles.label}>Email</Text>
//               <Text style={styles.value}>{user.email}</Text>
//             </View>
//           ) : null}

//           {user.isVerified !== undefined ? (
//             <View style={styles.row}>
//               <Text style={styles.label}>Verified</Text>
//               <Text style={styles.value}>{user.isVerified ? 'Yes' : 'No'}</Text>
//             </View>
//           ) : null}
//         </View>
//       ) : (
//         <Text style={styles.emptyText}>
//           No profile details found. Please log in again.
//         </Text>
//       )}

//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 16,
//     paddingTop: 40,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   card: {
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 24,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   label: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   value: {
//     fontSize: 14,
//     color: '#111827',
//     fontWeight: '500',
//   },
//   emptyText: {
//     fontSize: 14,
//     color: '#6b7280',
//     marginBottom: 24,
//   },
//   logoutButton: {
//     marginTop: 'auto',
//     marginBottom: 24,
//     backgroundColor: '#ef4444',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   logoutText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default ProfileScreen;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors, { spacing, typography, radius } from '../constants/theme';
import { version } from '../../package.json';
import { useTranslation } from 'react-i18next';
function ProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.log('Failed to load user', e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []); 
  const handleLanguageChange = () => {
    Alert.alert(t('profile.changeLanguage'), '', [
      { text: 'English', onPress: () => i18n.changeLanguage('en') },
      { text: 'हिन्दी', onPress: () => i18n.changeLanguage('hi') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert(t('common.logout'), t('profile.logoutConfirm'), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(['token', 'user']);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          } catch (e) {
            Alert.alert('Logout Failed', 'Please try again.');
          }
        },
      },
    ]);
  };

  const handleMenuItem = screen => {
    navigation.navigate(screen);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.headerSection}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>
              {user?.isVerified ? t('profile.verified') : t('profile.notVerified')}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuItem
              icon="🌐"
              title={t('profile.changeLanguage')}
              onPress={handleLanguageChange}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('profile.legal')}</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="ℹ️"
              title={t('profile.about')}
              onPress={() => handleMenuItem('About')}
            />
            <MenuItem
              icon="🔒"
              title={t('profile.privacy')}
              onPress={() => handleMenuItem('PrivacyPolicy')}
            />
            <MenuItem
              icon="📝"
              title={t('profile.terms')}
              onPress={() => handleMenuItem('TermsConditions')}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.versionText}>Version {version}</Text>
      </ScrollView>
    </View>
  );
}

/* ===== Reusable Menu Item ===== */

function MenuItem({ icon, title, onPress }) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 100,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },

  initialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  initialsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },

  userName: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },

  userEmail: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  verifiedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
  },

  verifiedText: {
    fontSize: typography.bodySmall,
    color: colors.success,
    fontWeight: '600',
  },

  // Menu Sections
  menuSection: {
    marginBottom: spacing.md,
    width: '100%',
  },

  sectionTitle: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  menuCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56, // Larger touch target
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },

  menuTitle: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  menuArrow: {
    fontSize: 28,
    color: colors.textTertiary,
    fontWeight: '300',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56, // Larger touch target
    width: '100%',
  },

  logoutIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },

  logoutText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: typography.button,
  },

  // Footer
  versionText: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
  },
});

export default ProfileScreen;
