import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DOC_PATH } from '@env';

import { getAllDocs } from '../api/doc.api';

function LibraryScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isSmallWidth = width < 360;
  const isShortHeight = height < 600;

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async ({ showSpinner = true } = {}) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Session expired', 'Please login again');
        return navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }

      const response = await getAllDocs();
      let data = response?.data;
      setDocs(data.docs);
    } catch (error) {
      console.log('Fetch docs error:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Unable to load documents',
      );
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchDocuments({ showSpinner: false });
    } finally {
      setRefreshing(false);
    }
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Reader', {
          docId: item._id,
          title: item.title,
          totalPages: item.totalPages,
          type: item.type,
          // Build file URL using DOC_PATH so it works from emulator/device.
          // Encode filename to handle spaces and special characters.
          url: `${DOC_PATH}${encodeURIComponent(item.filename)}`,
        })
      }
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      <Text style={styles.cardMeta}>{item.totalPages} chapters/pages</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isShortHeight && styles.containerCompact]}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Text
          style={[styles.heading, isSmallWidth && styles.headingSmall]}
          numberOfLines={isSmallWidth ? 2 : undefined}
        >
          Your Spiritual Library
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text
            style={[styles.profileLink, isSmallWidth && styles.profileLinkSmall]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subheading}>
        Choose a scripture or prayer collection to begin reading.
      </Text>

      <FlatList
        data={docs}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No documents found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: '#FFF9F0',
  },
  containerCompact: {
    paddingTop: 32,
    paddingHorizontal: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    flexShrink: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
  headingSmall: {
    fontSize: 20,
  },
  profileLink: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  profileLinkSmall: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  subheading: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
});

export default LibraryScreen;
