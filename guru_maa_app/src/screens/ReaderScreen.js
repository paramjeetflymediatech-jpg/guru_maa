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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;

  const pdfRef = useRef(null);

  // Swipe flash animation
  const swipeFlash = useRef(new Animated.Value(0)).current;
  const swipeFlashColor = useRef(new Animated.Value(0)).current; // 0=left, 1=right

  const textContent = content || '';

  // Auto-detect HTML in content — if content has HTML tags, render via WebView
  const containsHtml = /<[a-z][\s\S]*>/i.test(textContent);
  const isPdf = type === 'pdf';
  const isHtml = type === 'html' || (type === 'text' && containsHtml);
  const isText = type === 'text' && !containsHtml;

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

    const PdfContent = (
      <>
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
            minScale={1.1}
            maxScale={5}
            scale={1.1}
            fitPolicy={0} // 0 = Fit Width, 1 = Fit Height, 2 = Fit Both
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
      </>
    );

    return (
      <View style={[styles.pdfWrapper, isFullScreen && styles.pdfWrapperFullScreen]}>
        {isFullScreen ? (
          <View style={styles.fullScreenPdfContainer}>
            {PdfContent}
          </View>
        ) : (
          <SpiritualBorder style={styles.pdfFrameOuter}>
            {PdfContent}
          </SpiritualBorder>
        )}

        {/* Tap zones for edge navigation */}
        <TouchableOpacity
          style={[styles.tapZoneLeft, isFullScreen && styles.tapZoneFullScreen]}
          onPress={goToPreviousPage}
          activeOpacity={0.2}
        />
        <TouchableOpacity
          style={[styles.tapZoneRight, isFullScreen && styles.tapZoneFullScreen]}
          onPress={goToNextPage}
          activeOpacity={0.2}
        />

        {/* Swipe flash feedback */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.swipeFlashOverlay,
            isFullScreen && { top: 0, left: 0, right: 0, bottom: 0 },
            {
              opacity: swipeFlash,
              backgroundColor: swipeFlashColor.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(255,153,51,0.15)', 'rgba(255,153,51,0.15)'],
              }),
            },
          ]}
        />

        {/* Bottom controls — hidden in full-screen */}
        {!isFullScreen && renderPageControls(totalPdfPages)}
      </View>
    );
  };

  /* ── Page controls (shared by pdf/text) ── */
  const renderPageControls = (total) => (
    <View style={[styles.pageControlsContainer, { paddingBottom: 4 + insets.bottom }]}>
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
    <View style={[styles.textWrapper, isFullScreen && styles.textWrapperFullScreen]}>
      {isFullScreen ? (
        <ScrollView contentContainerStyle={styles.contentScrollInner}>
          <Text style={[styles.contentText, { color: '#ffffffff' }]}>{textContent || 'Content not available'}</Text>
        </ScrollView>
      ) : (
        <SpiritualBorder style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.contentScrollInner}>
            <Text style={styles.contentText}>{textContent || 'Content not available'}</Text>
          </ScrollView>
        </SpiritualBorder>
      )}
      {!isFullScreen && totalPages > 1 && renderPageControls(totalPages)}
    </View>
  );

  /* ── HTML READER (WebView) ── */
  const renderHtmlReader = () => {
    console.log('[ReaderScreen] Rendering HTML document, url:', url, '| content length:', textContent.length);
    const htmlSource = url
      ? { uri: url }
      : { html: generateHtmlWrapper(textContent), baseUrl: '' };

    return (
      <View style={[styles.textWrapper, isFullScreen && styles.textWrapperFullScreen]}>
        {isFullScreen ? (
          <View style={{ flex: 1, backgroundColor: '#978d8dff' }}>
            <WebView
              source={htmlSource}
              style={[styles.webview, { backgroundColor: '#978d8dff' }]}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scalesPageToFit={false}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loaderOm}>ॐ</Text>
                  <ActivityIndicator size="large" color={SAFFRON} style={{ marginTop: 8 }} />
                  <Text style={styles.loadingText}>Loading content…</Text>
                </View>
              )}
            />
          </View>
        ) : (
          <SpiritualBorder style={{ flex: 1 }}>
            <WebView
              source={htmlSource}
              style={styles.webview}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              scalesPageToFit={false}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loaderOm}>ॐ</Text>
                  <ActivityIndicator size="large" color={SAFFRON} style={{ marginTop: 8 }} />
                  <Text style={styles.loadingText}>Loading content…</Text>
                </View>
              )}
            />
          </SpiritualBorder>
        )}
      </View>
    );
  };

  /* Helper to wrap raw HTML content in a styled page */
  const generateHtmlWrapper = (rawHtml) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
      <style>
        body {
          font-family: -apple-system, sans-serif;
          padding: 20px;
          margin: 0;
          color: ${isFullScreen ? '#FFFFFF' : MAROON};
          background-color: ${isFullScreen ? '#978d8dff' : CREAM};
          line-height: 1.6;
          font-size: 18px;
        }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        a { color: ${SAFFRON_DARK}; }
        h1, h2, h3 { color: ${isFullScreen ? '#FFFFFF' : MAROON}; }
        blockquote {
          border-left: 4px solid ${GOLD};
          padding-left: 12px;
          margin-left: 0;
          color: ${isFullScreen ? '#CCCCCC' : '#5A3A1A'};
          font-style: italic;
        }
      </style>
    </head>
    <body>${rawHtml || '<p>Content not available</p>'}</body>
    </html>
  `;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isFullScreen ? '#978d8dff' : HEADER_BG}
        hidden={isFullScreen}
      />

      {/* ── SPIRITUAL HEADER — hidden in full-screen ── */}
      {!isFullScreen && (
        <>
          <View style={[
            styles.header, 
            { 
              paddingTop: insets.top || StatusBar.currentHeight || 0,
              paddingLeft: Math.max(insets.left, isLandscape ? 60 : 12),
              paddingRight: Math.max(insets.right, isLandscape ? 60 : 12)
            }
          ]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
              ) : null}
            </View>

            {/* Full-screen toggle */}
            <TouchableOpacity
              style={styles.fullScreenButton}
              onPress={() => setIsFullScreen(true)}
            >
              <Text style={styles.fullScreenIcon}>⛶</Text>
            </TouchableOpacity>
          </View>

          {/* Gold border under header */}
          <View style={styles.headerGoldBorder} />
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <View style={[styles.mainContent, isFullScreen && styles.mainContentFullScreen]}>
        {isPdf && url && renderPdfViewer()}
        {isText && renderTextReader()}
        {isHtml && renderHtmlReader()}
        {!isPdf && !isText && !isHtml && renderExternalViewer()}
      </View>

      {/* ── FLOATING EXIT FULL-SCREEN BUTTON ── */}
      {isFullScreen && (
        <TouchableOpacity
          style={[
            styles.floatingExitButton, 
            { 
              top: insets.top + (isLandscape ? 8 : 12),
              right: Math.max(insets.right, isLandscape ? 60 : 16)
            }
          ]}
          onPress={() => setIsFullScreen(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingExitIcon}>✕</Text>
          <Text style={styles.floatingExitText}>Exit</Text>
        </TouchableOpacity>
      )}

      {/* ── FLOATING PAGE INDICATOR (full-screen only) ── */}
      {isFullScreen && isPdf && totalPdfPages > 0 && (
        <View style={[styles.floatingPagePill, { bottom: insets.bottom + 16 }]}>
          <Text style={styles.floatingPageText}>
            {currentPage} / {totalPdfPages}
          </Text>
        </View>
      )}
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
    paddingHorizontal: 12,
    paddingBottom: 6,
    backgroundColor: HEADER_BG,
  },
  headerGoldBorder: {
    height: 2,
    backgroundColor: GOLD,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
    minWidth: 40,
  },
  backButtonText: {
    fontSize: 28,
    color: GOLD_LIGHT,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: GOLD_LIGHT,
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
  fullScreenButton: {
    minWidth: 40,
    alignItems: 'flex-end',
    paddingVertical: 4,
  },
  fullScreenIcon: {
    fontSize: 18,
    color: GOLD_LIGHT,
  },

  /* ── MAIN CONTENT ── */
  mainContent: {
    flex: 1,
    backgroundColor: CREAM,
  },
  mainContentFullScreen: {
    backgroundColor: '#978d8dff',
  },

  /* ── SPIRITUAL BORDER FRAME ── */
  spiritualFrame: {
    marginHorizontal: 2, // Ensure edges aren't clipped on narrow screens
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: GOLD,
    borderStyle: 'dotted',
    padding: 2,
    overflow: 'visible',
  },
  borderLayerOuter: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: SAFFRON,
    padding: 2,
    overflow: 'hidden',
  },
  borderLayerInner: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 2,
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
  ornamentMT: { top: -7, alignSelf: 'center' },
  ornamentMB: { bottom: -7, alignSelf: 'center' },

  /* ── PDF WRAPPER ── */
  pdfWrapper: {
    flex: 1,
    padding: 8,
    paddingBottom: 2,
  },
  pdfWrapperFullScreen: {
    padding: 0,
    paddingBottom: 0,
  },
  pdfFrameOuter: {
    flex: 1,
  },
  fullScreenPdfContainer: {
    flex: 1,
    backgroundColor: '#978d8dff',
    
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
  tapZoneFullScreen: {
    top: 0,
    bottom: 0,
    left: 0,
    right: undefined,
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
    paddingBottom: 4,
    paddingTop: 4,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: GOLD_LIGHT,
    borderRadius: 2,
    marginHorizontal: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: SAFFRON,
    borderRadius: 2,
  },
  pageInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HEADER_BG,
    borderRadius: radius.round,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: GOLD,
    elevation: 2,
  },
  navButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 13,
    color: GOLD_LIGHT,
    fontWeight: '700',
  },
  navButtonTextDisabled: {
    color: '#888',
  },
  pageIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SAFFRON,
    borderRadius: radius.round,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: GOLD,
  },
  pageIndicatorOm: {
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 3,
    fontWeight: 'bold',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSeparator: {
    fontSize: 12,
    color: GOLD_LIGHT,
  },
  pageTotalText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 10,
    color: SAFFRON_DARK,
    fontStyle: 'italic',
    marginTop: 2,
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
  textWrapperFullScreen: {
    padding: 0,
    paddingBottom: 0,
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

  /* ── WEBVIEW ── */
  webview: {
    flex: 1,
    backgroundColor: CREAM,
    opacity: 0.99, // Fix for Android WebView visibility inside border-radius containers
  },

  /* ── FLOATING CONTROLS ── */
  floatingExitButton: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61,0,0,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GOLD,
    zIndex: 100,
    elevation: 10,
  },
  floatingExitIcon: {
    fontSize: 14,
    color: GOLD_LIGHT,
    fontWeight: 'bold',
    marginRight: 6,
  },
  floatingExitText: {
    fontSize: 13,
    color: GOLD_LIGHT,
    fontWeight: '700',
  },
  floatingPagePill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(61,0,0,0.85)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GOLD,
    zIndex: 100,
    elevation: 10,
  },
  floatingPageText: {
    fontSize: 14,
    color: GOLD_LIGHT,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default ReaderScreen;
