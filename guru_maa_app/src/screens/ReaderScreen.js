import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import colors, { spacing, typography, radius } from '../constants/theme';

// Spiritual color palette
const SAFFRON = '#FF9933';
const SAFFRON_DARK = '#E67300';
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F5E7A0';
const MAROON = '#6B0000';
const DEEP_PURPLE = '#4A0072';
const CREAM = '#FFF8EE';
const HEADER_BG = '#3D0000';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/* ───────────────────────────────────────────
   Spiritual Corner Ornament component
─────────────────────────────────────────── */
function SpiritualBorder({ children, style }) {
  return (
    <View style={[styles.spiritualFrame, style]}>
      {/* Outer border layer */}
      <View style={styles.borderLayerOuter}>
        {/* Inner border layer */}
        <View style={styles.borderLayerInner}>
          {/* Content */}
          <View style={styles.borderContent}>{children}</View>
        </View>
      </View>
      {/* Corner ornaments — positioned absolute on the outermost frame */}
      <Text style={[styles.ornament, styles.ornamentTL]}>✦</Text>
      <Text style={[styles.ornament, styles.ornamentTR]}>✦</Text>
      <Text style={[styles.ornament, styles.ornamentBL]}>✦</Text>
      <Text style={[styles.ornament, styles.ornamentBR]}>✦</Text>
      {/* Mid-edge ornaments */}
      <Text style={[styles.ornamentMid, styles.ornamentMT]}>❈</Text>
      <Text style={[styles.ornamentMid, styles.ornamentMB]}>❈</Text>
    </View>
  );
}

/* ───────────────────────────────────────────
   READER SCREEN
─────────────────────────────────────────── */
function ReaderScreen({ route, navigation }) {
  const {
    docId,
    title,
    subtitle,
    totalPages = 1,
    type = 'pdf',
    url,
    content,
  } = route.params || {};

  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  const pdfRef = useRef(null);

  // Swipe flash animation
  const swipeFlash = useRef(new Animated.Value(0)).current;
  const swipeFlashColor = useRef(new Animated.Value(0)).current; // 0=left, 1=right

  const isPdf = type === 'pdf';
  const isText = type === 'text';
  const isHtml = type === 'html';
  const textContent = content || '';

  const flashSwipeIndicator = useCallback((direction) => {
    swipeFlashColor.setValue(direction === 'right' ? 1 : 0);
    Animated.sequence([
      Animated.timing(swipeFlash, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.timing(swipeFlash, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
  }, [swipeFlash, swipeFlashColor]);

  const handlePdfLoadComplete = useCallback((numberOfPages) => {
    setTotalPdfPages(numberOfPages);
    setIsLoading(false);
    setLoadingError(null);
  }, []);

  const handlePdfError = useCallback((error) => {
    setIsLoading(false);
    setLoadingError(error?.message || 'Failed to load PDF');
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      pdfRef.current?.setPage(newPage);
      flashSwipeIndicator('right');
    }
  }, [currentPage, flashSwipeIndicator]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPdfPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      pdfRef.current?.setPage(newPage);
      flashSwipeIndicator('left');
    }
  }, [currentPage, totalPdfPages, flashSwipeIndicator]);

  // Gesture handler for swipe-to-navigate removed to avoid conflict with PDF zoom
  // Tap zones and native PDF paging are now the primary navigation methods

  const handleOpenExternal = useCallback(() => {
    if (!url) { setLoadingError('No document URL'); return; }
    Linking.openURL(url).catch(() => setLoadingError('Cannot open document'));
  }, [url]);

  /* ── Page progress bar ── */
  const progressWidth = totalPdfPages > 0
    ? (currentPage / totalPdfPages) * (screenWidth - spacing.md * 2 - 32)
    : 0;

  /* ── PDF VIEWER ── */
  const renderPdfViewer = () => {
    if (!url) return renderExternalViewer();

    return (
      <View style={styles.pdfWrapper}>
        <SpiritualBorder style={styles.pdfFrameOuter}>
          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loaderOm}>ॐ</Text>
              <ActivityIndicator size="large" color={SAFFRON} style={{ marginTop: 8 }} />
              <Text style={styles.loadingText}>Loading sacred text…</Text>
            </View>
          )}

          {/* Error Overlay */}
          {loadingError && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorText}>⚠ {loadingError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => { setIsLoading(true); setLoadingError(null); }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.pdfContainer}>
            <Pdf
              ref={pdfRef}
              source={{ uri: url, cache: true }}
              trustAllCerts={false}
              minScale={1}
              maxScale={3}
              horizontal={true}
              enablePaging={true}
              spacing={0}
              style={styles.pdf}
              onLoadStart={() => setIsLoading(true)}
              onLoadComplete={handlePdfLoadComplete}
              onError={handlePdfError}
              onPageChanged={handlePageChange}
            />
          </View>
        </SpiritualBorder>

        {/* Tap zones for edge navigation */}
        <TouchableOpacity
          style={styles.tapZoneLeft}
          onPress={goToPreviousPage}
          activeOpacity={0.2}
        />
        <TouchableOpacity
          style={styles.tapZoneRight}
          onPress={goToNextPage}
          activeOpacity={0.2}
        />

        {/* Swipe flash feedback */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.swipeFlashOverlay,
            {
              opacity: swipeFlash,
              backgroundColor: swipeFlashColor.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(255,153,51,0.15)', 'rgba(255,153,51,0.15)'],
              }),
            },
          ]}
        />

        {/* Bottom controls */}
        {renderPageControls(totalPdfPages)}
      </View>
    );
  };

  /* ── Page controls (shared by pdf/text) ── */
  const renderPageControls = (total) => (
    <View style={styles.pageControlsContainer}>
      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: progressWidth }]} />
      </View>

      {/* Nav row */}
      <View style={styles.pageInfoCard}>
        <TouchableOpacity
          style={[styles.navButton, currentPage <= 1 && styles.navButtonDisabled]}
          onPress={goToPreviousPage}
          disabled={currentPage <= 1}
        >
          <Text style={[styles.navButtonText, currentPage <= 1 && styles.navButtonTextDisabled]}>
            ← पिछला
          </Text>
        </TouchableOpacity>

        <View style={styles.pageIndicatorPill}>
          <Text style={styles.pageIndicatorOm}>ॐ</Text>
          <Text style={styles.pageNumberText}>{currentPage}</Text>
          <Text style={styles.pageSeparator}> / </Text>
          <Text style={styles.pageTotalText}>{total || '--'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, currentPage >= total && styles.navButtonDisabled]}
          onPress={goToNextPage}
          disabled={currentPage >= total}
        >
          <Text style={[styles.navButtonText, currentPage >= total && styles.navButtonTextDisabled]}>
            अगला →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipe hint */}
      {total > 1 && (
        <Text style={styles.swipeHint}>
          ❈ स्वाइप करें पृष्ठ बदलने के लिए ❈
        </Text>
      )}
    </View>
  );

  /* ── EXTERNAL VIEWER ── */
  const renderExternalViewer = () => (
    <SpiritualBorder style={{ flex: 1, margin: spacing.md }}>
      <View style={styles.externalInner}>
        <Text style={styles.externalOm}>ॐ</Text>
        <Text style={styles.externalTitle}>Sacred Document</Text>
        <Text style={styles.externalDescription}>
          This document will open in an external reader
        </Text>
        <TouchableOpacity style={styles.externalButton} onPress={handleOpenExternal}>
          <Text style={styles.externalButtonText}>Open Document</Text>
        </TouchableOpacity>
      </View>
    </SpiritualBorder>
  );

  /* ── TEXT READER ── */
  const renderTextReader = () => (
    <View style={styles.textWrapper}>
      <SpiritualBorder style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.contentScrollInner}>
          <Text style={styles.contentText}>{textContent || 'Content not available'}</Text>
        </ScrollView>
      </SpiritualBorder>
      {totalPages > 1 && renderPageControls(totalPages)}
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_BG} />

      {/* ── SPIRITUAL HEADER ── */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← वापस</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerOm}>ॐ</Text>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Decorative right side */}
        <View style={styles.headerRight}>
          <Text style={styles.headerFlower}>❀</Text>
        </View>
      </View>

      {/* Gold border under header */}
      <View style={styles.headerGoldBorder} />

      {/* ── MAIN CONTENT ── */}
      <View style={styles.mainContent}>
        {isPdf && url && renderPdfViewer()}
        {isText && renderTextReader()}
        {isHtml && (
          <SpiritualBorder style={{ flex: 1, margin: spacing.md }}>
            <View style={styles.externalInner}>
              <Text style={styles.externalTitle}>HTML content</Text>
              <Text style={styles.externalDescription}>Use text mode for best experience</Text>
            </View>
          </SpiritualBorder>
        )}
        {!isPdf && !isText && !isHtml && renderExternalViewer()}
      </View>
    </GestureHandlerRootView>
  );
}

/* ───────────────────────────────────────────
   STYLES
─────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  /* ── HEADER ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: HEADER_BG,
  },
  headerGoldBorder: {
    height: 3,
    backgroundColor: GOLD,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
    minWidth: 70,
  },
  backButtonText: {
    fontSize: typography.body,
    color: GOLD_LIGHT,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerOm: {
    fontSize: 22,
    color: SAFFRON,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  title: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.small,
    color: GOLD_LIGHT,
    marginTop: 2,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  headerRight: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  headerFlower: {
    fontSize: 24,
    color: SAFFRON,
  },

  /* ── MAIN CONTENT ── */
  mainContent: {
    flex: 1,
    backgroundColor: CREAM,
  },

  /* ── SPIRITUAL BORDER FRAME ── */
  spiritualFrame: {
    borderRadius: radius.lg,
    // outer gold dot border
    borderWidth: 2,
    borderColor: GOLD,
    borderStyle: 'dotted',
    padding: 4,
    overflow: 'visible',
  },
  borderLayerOuter: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: SAFFRON,
    padding: 3,
    overflow: 'hidden',
  },
  borderLayerInner: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 4,
    borderColor: GOLD_LIGHT,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  borderContent: {
    flex: 1,
    overflow: 'hidden',
  },

  /* Ornaments on the outer frame */
  ornament: {
    position: 'absolute',
    fontSize: 16,
    color: GOLD,
    zIndex: 10,
  },
  ornamentTL: { top: -8, left: -4 },
  ornamentTR: { top: -8, right: -4 },
  ornamentBL: { bottom: -8, left: -4 },
  ornamentBR: { bottom: -8, right: -4 },
  ornamentMid: {
    position: 'absolute',
    fontSize: 12,
    color: SAFFRON,
    zIndex: 10,
  },
  ornamentMT: { top: -7, alignSelf: 'center', left: '48%' },
  ornamentMB: { bottom: -7, alignSelf: 'center', left: '48%' },

  /* ── PDF WRAPPER ── */
  pdfWrapper: {
    flex: 1,
    padding: spacing.md,
    paddingBottom: 4,
  },
  pdfFrameOuter: {
    flex: 1,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pdf: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Tap zones */
  tapZoneLeft: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    width: 64,
    bottom: 140,
    zIndex: 5,
  },
  tapZoneRight: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 64,
    bottom: 140,
    zIndex: 5,
  },

  /* Swipe flash overlay */
  swipeFlashOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    bottom: 140,
    borderRadius: radius.lg,
    zIndex: 6,
    pointerEvents: 'none',
  },

  /* ── LOADING / ERROR ── */
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,248,238,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loaderOm: {
    fontSize: 52,
    color: SAFFRON,
    textShadowColor: GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: SAFFRON_DARK,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,248,238,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.body,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: SAFFRON,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: GOLD,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: typography.button,
  },

  /* ── PAGE CONTROLS ── */
  pageControlsContainer: {
    paddingBottom: spacing.sm,
    paddingTop: 6,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: GOLD_LIGHT,
    borderRadius: 2,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: SAFFRON,
    borderRadius: 2,
  },
  pageInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HEADER_BG,
    borderRadius: radius.round,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: GOLD,
    shadowColor: SAFFRON_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  navButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 80,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: typography.body,
    color: GOLD_LIGHT,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  navButtonTextDisabled: {
    color: '#888',
  },
  pageIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SAFFRON,
    borderRadius: radius.round,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: GOLD,
  },
  pageIndicatorOm: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 4,
    fontWeight: 'bold',
  },
  pageNumberText: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSeparator: {
    fontSize: typography.body,
    color: GOLD_LIGHT,
  },
  pageTotalText: {
    fontSize: typography.body,
    color: '#FFFFFF',
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: typography.small,
    color: SAFFRON_DARK,
    fontStyle: 'italic',
    marginTop: 6,
    letterSpacing: 0.3,
  },

  /* ── EXTERNAL VIEWER ── */
  externalInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  externalOm: {
    fontSize: 56,
    color: SAFFRON,
    marginBottom: spacing.md,
    textShadowColor: GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  externalTitle: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: DEEP_PURPLE,
    marginBottom: spacing.sm,
  },
  externalDescription: {
    fontSize: typography.body,
    color: '#7A5C3A',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.body * 1.5,
  },
  externalButton: {
    backgroundColor: SAFFRON,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: GOLD,
    shadowColor: SAFFRON_DARK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  externalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: typography.button,
    letterSpacing: 0.5,
  },

  /* ── TEXT READER ── */
  textWrapper: {
    flex: 1,
    padding: spacing.md,
    paddingBottom: 4,
  },
  contentScrollInner: {
    padding: spacing.lg,
  },
  contentText: {
    fontSize: typography.body,
    lineHeight: typography.body * 1.8,
    color: MAROON,
    textAlign: 'justify',
  },
});

export default ReaderScreen;
