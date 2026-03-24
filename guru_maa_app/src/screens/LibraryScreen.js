import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DOC_PATH, API_BASE_URL } from '@env';
import { getAllDocs, getAllCategories } from '../api/doc.api';
import colors, { spacing, typography, radius } from '../constants/theme';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

// Spiritual color palette
const SAFFRON = '#FF9933';
const SAFFRON_DARK = '#E67300';
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F5E7A0';
const MAROON = '#800000';
const DEEP_PURPLE = '#4A0072';
const CREAM = '#FFF8EE';
const CARD_BG = '#FFFDF5';

function LibraryScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isSmallWidth = width < 360;
  const isShortHeight = height < 600;

  const [docs, setDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Animation for header glow
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const fetchDocuments = async ({ showSpinner = true } = {}) => {
    try {
      if (showSpinner) setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(t('common.error'), t('common.loading'));
        return navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
      const response = await getAllDocs();
      setDocs(response?.data?.docs || []);
    } catch (error) {
      console.log('Fetch docs error:', error);
      Alert.alert(t('common.error'), error?.response?.data?.message || t('common.error'));
    } finally {
      if (showSpinner) setLoading(false);
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

  const filteredDocs = docs.filter(doc => {
    const matchesCategory = !selectedCategory || doc.category?._id === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => {
        const docType = item.type || 'text';
        navigation.navigate('Reader', {
          docId: item._id,
          title: item.title,
          subtitle: item.subtitle,
          totalPages: item.totalPages,
          type: docType,
          content: item.content || '',
          url: docType === 'pdf' && item.filename
            ? `${DOC_PATH}${encodeURIComponent(item.filename)}`
            : null,
        });
      }}
    >
      {/* Top gradient accent band */}
      <View style={styles.cardTopBand}>
        <Text style={styles.cardTypeIcon}>
          {item.type === 'text' ? '📖' : '📿'}
        </Text>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {item.category.icon} {item.category.name}
            </Text>
          </View>
        )}
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        {/* Left gold accent strip */}
        <View style={styles.cardAccentStrip} />

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          ) : null}
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>
              {item.totalPages} {item.totalPages === 1 ? t('library.page') : t('library.pages')}
            </Text>
            {item.author ? (
              <Text style={styles.cardAuthor}>✍ {item.author}</Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Corner ornaments */}
      <Text style={[styles.cornerOrnament, styles.cornerTL]}>✦</Text>
      <Text style={[styles.cornerOrnament, styles.cornerTR]}>✦</Text>
      <Text style={[styles.cornerOrnament, styles.cornerBL]}>✦</Text>
      <Text style={[styles.cornerOrnament, styles.cornerBR]}>✦</Text>
    </TouchableOpacity>
  );

  const headerComponent = React.useMemo(() => (
    <View>
      {/* ── SPIRITUAL HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.searchIconBtn} 
          onPress={() => setIsSearchExpanded(!isSearchExpanded)}
        >
          <Text style={styles.searchIconText}>🔍</Text>
        </TouchableOpacity>

        <Text style={styles.headerOm}>ॐ</Text>
        <Text style={[styles.heading, isSmallWidth && styles.headingSmall]}>
          {i18n.language === 'hi' ? t('library.hindiTitle') : t('library.title')}
        </Text>
        {i18n.language === 'hi' && (
          <Text style={styles.headingEn}>{t('library.title')}</Text>
        )}
        {/* Lotus divider */}
        <View style={styles.lotusDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.lotusIcon}>❀</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>

      {/* ── SEARCH BAR ── */}
      {isSearchExpanded && (
        <View style={styles.searchContainer}>
          <Text style={styles.searchPrefix}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('library.searchPlaceholder')}
            placeholderTextColor="#B07040"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        </View>
      )}

      {/* ── CATEGORY FILTER ── */}
      <TouchableOpacity
        style={styles.categoryToggle}
        onPress={() => setShowCategories(!showCategories)}
      >
        <Text style={styles.categoryToggleText}>
          {showCategories ? t('library.hideCategories') : t('library.browseByCategory')}
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
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
              🕉 {t('library.all')}
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.categoryChip, selectedCategory === cat._id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat._id)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat._id && styles.categoryChipTextActive]}>
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.resultCount}>
        ✦ {filteredDocs.length} {filteredDocs.length === 1 ? 'scripture' : 'scriptures'} found
      </Text>
    </View>
  ), [
    isSearchExpanded,
    searchQuery,
    showCategories,
    selectedCategory,
    categories,
    filteredDocs.length,
    i18n.language,
    isSmallWidth,
    t
  ]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderOm}>ॐ</Text>
        <ActivityIndicator size="large" color={SAFFRON} style={{ marginTop: 12 }} />
        <Text style={styles.loadingText}>{t('library.loadingTexts')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      <View style={styles.container}>
        <FlatList
          data={filteredDocs}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={headerComponent}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🪷</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? t('library.noMatch') : t('library.noScriptures')}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? t('library.tryDifferent') : t('library.checkBack')}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  /* ── HEADER ── */
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: CREAM,
    position: 'relative',
  },
  searchIconBtn: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
    padding: spacing.sm,
    zIndex: 10,
    backgroundColor: '#FFFBF0',
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: SAFFRON,
    shadowColor: SAFFRON,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIconText: {
    fontSize: 18,
  },
  headerOm: {
    fontSize: 42,
    color: SAFFRON_DARK,
    fontWeight: 'bold',
    marginBottom: 2,
    textShadowColor: GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heading: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: DEEP_PURPLE,
    letterSpacing: 1.5,
    textShadowColor: GOLD_LIGHT,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headingSmall: {
    fontSize: typography.h3,
  },
  headingEn: {
    fontSize: typography.bodySmall,
    color: SAFFRON_DARK,
    letterSpacing: 3,
    fontStyle: 'italic',
    marginTop: 2,
  },
  lotusDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    width: '80%',
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  lotusIcon: {
    fontSize: 22,
    color: SAFFRON,
    marginHorizontal: spacing.sm,
  },

  /* ── SEARCH BAR ── */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF0',
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: SAFFRON,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: SAFFRON,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  searchPrefix: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: MAROON,
    minHeight: 52,
  },

  /* ── CATEGORY FILTER ── */
  categoryToggle: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: radius.round,
    backgroundColor: '#FFF3DC',
  },
  categoryToggleText: {
    fontSize: typography.bodySmall,
    color: SAFFRON_DARK,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoriesContainer: {
    marginBottom: spacing.md,
    maxHeight: 62,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
  },
  categoryChip: {
    backgroundColor: '#FFF8EE',
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1.5,
    borderColor: GOLD,
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: SAFFRON,
    borderColor: SAFFRON_DARK,
  },
  categoryChipText: {
    fontSize: typography.bodySmall,
    color: SAFFRON_DARK,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },

  /* ── RESULT COUNT ── */
  resultCount: {
    fontSize: typography.bodySmall,
    color: SAFFRON_DARK,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* ── LIST ── */
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 130,
  },

  /* ── BOOK CARD ── */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: GOLD,
    overflow: 'hidden',
    shadowColor: SAFFRON_DARK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTopBand: {
    backgroundColor: SAFFRON,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
  },
  cardTypeIcon: {
    fontSize: 18,
  },
  categoryBadge: {
    backgroundColor: '#FFF3DC',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: GOLD,
  },
  categoryBadgeText: {
    fontSize: typography.small,
    color: SAFFRON_DARK,
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  cardAccentStrip: {
    width: 4,
    backgroundColor: GOLD,
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: DEEP_PURPLE,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: typography.body,
    color: SAFFRON_DARK,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  cardDescription: {
    fontSize: typography.bodySmall,
    color: '#7A5C3A',
    marginBottom: spacing.sm,
    lineHeight: typography.bodySmall * 1.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: GOLD_LIGHT,
    paddingTop: 6,
    marginTop: 2,
  },
  cardMeta: {
    fontSize: typography.small,
    color: '#9A7040',
    fontWeight: '600',
  },
  cardAuthor: {
    fontSize: typography.small,
    color: '#9A7040',
    fontStyle: 'italic',
  },

  /* ── CORNER ORNAMENTS ── */
  cornerOrnament: {
    position: 'absolute',
    fontSize: 10,
    color: GOLD,
  },
  cornerTL: { top: 4, left: 4 },
  cornerTR: { top: 4, right: 4 },
  cornerBL: { bottom: 4, left: 4 },
  cornerBR: { bottom: 4, right: 4 },

  /* ── LOADER ── */
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CREAM,
  },
  loaderOm: {
    fontSize: 64,
    color: SAFFRON,
    textShadowColor: GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  loadingText: {
    marginTop: spacing.md,
    color: SAFFRON_DARK,
    fontSize: typography.body,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },

  /* ── EMPTY STATE ── */
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: typography.h4,
    color: SAFFRON_DARK,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: typography.body,
    color: '#B07040',
    fontStyle: 'italic',
  },
});

export default LibraryScreen;
