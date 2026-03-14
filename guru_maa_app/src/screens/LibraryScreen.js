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
  TextInput,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DOC_PATH, API_BASE_URL } from '@env';
import { getAllDocs, getAllCategories } from '../api/doc.api';
import colors from '../constants/theme';

function LibraryScreen({ navigation }) {
  const { width, height, scale } = useWindowDimensions();
  const isSmallWidth = width < 360;
  const isShortHeight = height < 600;

  const [docs, setDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

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
          routes: [{ name: 'Auth' }],
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

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response?.data?.categories || []);
    } catch (error) {
      console.log('Fetch categories error:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchDocuments({ showSpinner: false });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter docs by category and search
  const filteredDocs = docs.filter(doc => {
    const matchesCategory = !selectedCategory || doc.category?._id === selectedCategory;
    const matchesSearch = !searchQuery || 
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
 
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Reader', {
          docId: item._id,
          title: item.title,
          subtitle: item.subtitle,
          totalPages: item.totalPages,
          type: item.type,
          content: item.content, // For text content
          // Build file URL using DOC_PATH so it works from emulator/device.
          // Encode filename to handle spaces and special characters.
          url: item.type === 'pdf' ? `${DOC_PATH}${encodeURIComponent(item.filename)}` : null,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {item.category.icon} {item.category.name}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>
          {item.type === 'text' ? '📖' : '📄'} {item.totalPages} {item.totalPages === 1 ? 'page' : 'pages'}
        </Text>
        {item.author && <Text style={styles.cardAuthor}>By {item.author}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your library...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isShortHeight && styles.containerCompact]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.heading, isSmallWidth && styles.headingSmall]}>
          📚 Your Library
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books, stories, mantras..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <TouchableOpacity 
        style={styles.categoryToggle}
        onPress={() => setShowCategories(!showCategories)}
      >
        <Text style={styles.categoryToggleText}>
          {showCategories ? '▲ Hide Categories' : '▼ Browse by Category'}
        </Text>
      </TouchableOpacity>

      {showCategories && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive
            ]}>
              📚 All
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat._id}
              style={[
                styles.categoryChip,
                selectedCategory === cat._id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat._id)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat._id && styles.categoryChipTextActive
              ]}>
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.resultCount}>
        {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'} found
      </Text>

      <FlatList
        data={filteredDocs}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No documents match your search' : 'No documents found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Check back later for new content'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    backgroundColor: '#FFF9F0',
  },
  containerCompact: {
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headingSmall: {
    fontSize: 22,
  },
  subheading: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0D7C7',
  },
  categoryToggle: {
    marginBottom: 8,
  },
  categoryToggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoriesContainer: {
    marginBottom: 12,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0D7C7',
  },
  categoryChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultCount: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0E8D8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  cardAuthor: {
    fontSize: 12,
    color: '#888888',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
  },
  loadingText: {
    marginTop: 12,
    color: '#555',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
  },
});

export default LibraryScreen;
