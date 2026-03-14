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
import colors from '../constants/theme';
import { version } from '../../package.json';
function ProfileScreen({ navigation }) {
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
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
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
              {user?.isVerified ? '✓ Verified Account' : 'Not Verified'}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          {/* <Text style={styles.sectionTitle}>Information</Text> */}
          <View style={styles.menuCard}>
            {/* <MenuItem
              icon="📚"
              title="My Library"
              onPress={() => handleMenuItem('Library')}
            />
            <MenuItem
              icon="👤"
              title="Edit Profile"
              onPress={() => handleMenuItem('EditProfile')}
            /> */}
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="ℹ️"
              title="About App"
              onPress={() => handleMenuItem('About')}
            />
            <MenuItem
              icon="🔒"
              title="Privacy Policy"
              onPress={() => handleMenuItem('PrivacyPolicy')}
            />
            <MenuItem
              icon="📝"
              title="Terms & Conditions"
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
          <Text style={styles.logoutText}>Logout</Text>
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
    backgroundColor: '#F5F3FF',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
    itemsAlignItems: 'center',
    itemjustifyContent: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  initialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  initialsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },

  userEmail: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
  },

  verifiedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
  },

  // Menu Sections
  menuSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },

  menuTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  menuArrow: {
    fontSize: 22,
    color: colors.textTertiary,
    fontWeight: '300',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
  },

  // Footer
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
    color: colors.textTertiary,
  },
});

export default ProfileScreen;
