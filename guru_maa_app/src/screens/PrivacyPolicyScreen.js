import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import colors from '../constants/theme';

function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 2024</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.description}>
              At Gurumaa, we take your privacy seriously. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your 
              information when you use our mobile application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.description}>
              {'\u2022'} Personal Information: Name, email address, and profile 
              information when you create an account
              {'\n\n'}\u2022 Device Information: Device type, operating system, 
              and unique device identifiers
              {'\n\n'}\u2022 Usage Data: How you interact with our app, including 
              reading history and preferences
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.description}>
              {'\u2022'} To provide and maintain our services
              {'\n\n'}\u2022 To personalize your experience
              {'\n\n'}\u2022 To communicate with you about updates and support
              {'\n\n'}\u2022 To improve our services and develop new features
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
            <Text style={styles.description}>
              Your data is stored securely on our servers with industry-standard 
              encryption. We implement appropriate technical and organizational 
              measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
            <Text style={styles.description}>
              Our app may contain links to third-party websites or services. 
              We are not responsible for the privacy practices of these third 
              parties. We encourage you to review their privacy policies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Your Rights</Text>
            <Text style={styles.description}>
              You have the right to:
              {'\n\n'}\u2022 Access your personal information
              {'\n\n'}\u2022 Correct inaccurate data
              {'\n\n'}\u2022 Request deletion of your data
              {'\n\n'}\u2022 Opt-out of marketing communications
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.description}>
              Our app is not intended for children under 13 years of age. We 
              do not knowingly collect personal information from children under 13.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
            <Text style={styles.description}>
              We may update our Privacy Policy from time to time. We will 
              notify you of any changes by posting the new Privacy Policy on 
              this page and updating the "Last Updated" date.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact Us</Text>
            <Text style={styles.description}>
              If you have any questions about this Privacy Policy, please 
              contact us at: support@gurumaa.app
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});

export default PrivacyPolicyScreen;
