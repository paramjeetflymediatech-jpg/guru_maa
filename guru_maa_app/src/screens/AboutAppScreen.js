import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import colors from '../constants/theme';
import { version } from '../../package.json';
console.log('App Version:', version);
function AboutAppScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          {/* App Name */}
          <Text style={styles.appName}>Gurumaa</Text>
          <Text style={styles.version}>Version {version}</Text>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the App</Text>
            <Text style={styles.description}>
              Gurumaa is your secure spiritual library at your fingertips.
              Access a vast collection of spiritual texts, scriptures, and
              educational materials designed to guide you on your spiritual
              journey.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>
                📚 Access to spiritual library
              </Text>
              <Text style={styles.featureItem}>🔒 Secure authentication</Text>
              <Text style={styles.featureItem}>📖 Easy-to-read content</Text>
              <Text style={styles.featureItem}>📱 Offline reading support</Text>
              <Text style={styles.featureItem}>🔄 Regular content updates</Text>
            </View>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.description}>
              For support or inquiries, please contact us at:
              {'\n'}support@gurumaa.app
            </Text>
          </View>

          {/* Copyright */}
          <View style={styles.footer}>
            <Text style={styles.copyright}>
              © 2024 Gurumaa. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  appIcon: {
    width: 140,
    height: 140,
    borderRadius: 40,
    objectFit: 'cover',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
    alignItems: 'center',
  },
  copyright: {
    fontSize: 14,
    color: colors.textTertiary,
  },
});

export default AboutAppScreen;
