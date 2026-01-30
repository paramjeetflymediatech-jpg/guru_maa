// import React, { useState, useMemo, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Linking,
//   Dimensions,
// } from 'react-native';
// import Pdf from 'react-native-pdf';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// /* ================= DEMO TEXT CONTENT ================= */

// const CONTENT = {
//   'gita-1': {
//     1: `Chapter 1:
// Throughout her life Maa attracted destitute and distressed people...`,
//     2: 'Chapter 2: Sankhya Yoga\n\nContent for chapter 2...',
//   },
//   'mantra-1': {
//     1: 'Om Bhur Bhuvaḥ Swaḥ\nTat-savitur vareṇyaṃ...',
//   },
// };

// /* ================= READER SCREEN ================= */

// function ReaderScreen({ route }) {
//   const {
//     docId,
//     title,
//     totalPages = 1,
//     type = 'pdf',
//     url,
//   } = route.params || {};

//   const pdfRef = useRef(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [pdfPages, setPdfPages] = useState(0);
//   const [pageRatio, setPageRatio] = useState(1);
//   const [screen, setScreen] = useState(Dimensions.get('window'));

//   const isPdf = type === 'pdf';
//   const isPdfReady = pdfPages > 0;

//   /* ================= ORIENTATION SAFE ================= */

//   useEffect(() => {
//     const sub = Dimensions.addEventListener('change', ({ window }) => {
//       setScreen(window);
//     });
//     return () => sub?.remove();
//   }, []);

//   useEffect(() => {
//     if (isPdfReady && currentPage > pdfPages) {
//       setCurrentPage(1);
//     }
//   }, [screen.width, pdfPages]);

//   /* ================= SAFE PDF HEIGHT ================= */

//   const getSafePdfHeight = () => {
//     if (!pageRatio || pageRatio <= 0) {
//       return screen.height * 0.8;
//     }

//     const calculated = screen.width / pageRatio;

//     return Math.min(
//       Math.max(calculated, screen.height * 0.6),
//       screen.height * 0.9,
//     );
//   };

//   /* ================= GESTURE ================= */

//   const panGesture = Gesture.Pan().onEnd(e => {
//     if (!isPdfReady) return;

//     if (e.translationX < -50 && currentPage < pdfPages) {
//       setCurrentPage(p => p + 1);
//     }

//     if (e.translationX > 50 && currentPage > 1) {
//       setCurrentPage(p => p - 1);
//     }
//   });

//   /* ================= EXTERNAL OPEN ================= */

//   const handleOpenExternal = () => {
//     if (!url) {
//       Alert.alert('No document URL');
//       return;
//     }
//     Linking.openURL(url).catch(() => Alert.alert('Cannot open document'));
//   };

//   /* ================= TEXT MODE ================= */

//   const pages = useMemo(
//     () => Array.from({ length: totalPages }, (_, i) => i + 1),
//     [totalPages],
//   );

//   const pageContent =
//     CONTENT[docId]?.[currentPage] || 'Content for this page is not yet added.';

//   /* ================= RENDER ================= */

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{title}</Text>

//       {/* ================= PDF MODE ================= */}
//       {isPdf && url ? (
//         <>
//           <GestureDetector gesture={panGesture}>
//             <View style={styles.pdfContainer}>
//               <Pdf
//                 ref={pdfRef}
//                 source={{ uri: url, cache: true }}
//                 page={currentPage}
//                 scale={1}
//                 minScale={1}
//                 maxScale={3}
//                 horizontal={false}
//                 enablePaging={false}
//                 spacing={0}
//                 trustAllCerts={false}
//                 onLoadComplete={(pages, filePath, { width, height }) => {
//                   if (width && height) {
//                     setPageRatio(width / height);
//                   }
//                   setPdfPages(pages);
//                 }}
//                 onError={error => {
//                   Alert.alert(
//                     'PDF Error',
//                     error?.message || 'Failed to load PDF',
//                   );
//                 }}
//                 style={[styles.pdf, { height: getSafePdfHeight() }]}
//               />
//             </View>
//           </GestureDetector>

//           {/* ===== PDF CONTROLS ===== */}
//           <View style={styles.pdfControls}>
//             <TouchableOpacity
//               disabled={!isPdfReady || currentPage <= 1}
//               onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
//             >
//               <Text
//                 style={[
//                   styles.pdfBtn,
//                   (!isPdfReady || currentPage <= 1) && styles.disabledBtn,
//                 ]}
//               >
//                 ⬅ Prev
//               </Text>
//             </TouchableOpacity>

//             <Text style={styles.pdfPageText}>
//               {currentPage} / {pdfPages || '-'}
//             </Text>

//             <TouchableOpacity
//               disabled={!isPdfReady || currentPage >= pdfPages}
//               onPress={() => setCurrentPage(p => Math.min(pdfPages, p + 1))}
//             >
//               <Text
//                 style={[
//                   styles.pdfBtn,
//                   (!isPdfReady || currentPage >= pdfPages) &&
//                     styles.disabledBtn,
//                 ]}
//               >
//                 Next ➡
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </>
//       ) : type === 'text' ? (
//         /* ================= TEXT MODE ================= */
//         <>
//           <Text style={styles.pageLabel}>
//             Page {currentPage} of {totalPages}
//           </Text>

//           <ScrollView
//             style={styles.contentBox}
//             contentContainerStyle={styles.contentInner}
//           >
//             <Text style={styles.contentText}>{pageContent}</Text>
//           </ScrollView>

//           <View style={styles.pageSelector}>
//             {pages.map(page => (
//               <TouchableOpacity
//                 key={page}
//                 style={[
//                   styles.pageButton,
//                   page === currentPage && styles.pageButtonActive,
//                 ]}
//                 onPress={() => setCurrentPage(page)}
//               >
//                 <Text
//                   style={[
//                     styles.pageButtonText,
//                     page === currentPage && styles.pageButtonTextActive,
//                   ]}
//                 >
//                   {page}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </>
//       ) : (
//         /* ================= OTHER FILES ================= */
//         <View style={styles.nonTextContainer}>
//           <Text style={styles.nonTextTitle}>Document type: {type}</Text>
//           <Text style={styles.nonTextDescription}>
//             This document will open in an external application.
//           </Text>
//           <TouchableOpacity
//             style={styles.externalButton}
//             onPress={handleOpenExternal}
//           >
//             <Text style={styles.externalButtonText}>Open document</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }



import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import Pdf from 'react-native-pdf';

/* ================= DEMO TEXT CONTENT ================= */

const CONTENT = {
  'gita-1': {
    1: `Chapter 1:
Throughout her life Maa attracted destitute and distressed people...`,
    2: 'Chapter 2: Sankhya Yoga\n\nContent for chapter 2...',
  },
  'mantra-1': {
    1: 'Om Bhur Bhuvaḥ Swaḥ\nTat-savitur vareṇyaṃ...',
  },
};

/* ================= READER SCREEN ================= */

function ReaderScreen({ route }) {
  const {
    docId,
    title,
    totalPages = 1,
    type = 'pdf',
    url,
  } = route.params || {};

  const [currentPage, setCurrentPage] = useState(1); // used only for TEXT mode
  const [screen, setScreen] = useState(Dimensions.get('window'));

  const isPdf = type === 'pdf';

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreen(window);
    });

    return () => {
      if (typeof subscription?.remove === 'function') {
        subscription.remove();
      } else if (typeof subscription === 'function') {
        subscription();
      }
    };
  }, []);

  const handleOpenExternal = () => {
    if (!url) {
      Alert.alert('No document URL');
      return;
    }
    Linking.openURL(url).catch(() => Alert.alert('Cannot open document'));
  };

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const pageContent =
    CONTENT[docId]?.[currentPage] || 'Content for this page is not yet added.';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* ========== PDF MODE ========== */}
      {isPdf && url ? (
        <View style={styles.pdfContainer}>
          <Pdf
            source={{ uri: url, cache: true }}
            trustAllCerts={false}
            minScale={1}
            maxScale={6}
            horizontal={false}
            enablePaging={false}
            spacing={0}
            style={[
              styles.pdf,
              { width: screen.width, height: screen.height*0.85  },
            ]}
            onError={error => {
              Alert.alert(
                'PDF Error',
                error?.message || 'Failed to load PDF',
              );
            }}
          />
        </View>
      ) : type === 'text' ? (
        /* ========== TEXT MODE ========== */
        <>
          <Text style={styles.pageLabel}>
            Page {currentPage} of {totalPages}
          </Text>

          <ScrollView
            style={styles.contentBox}
            contentContainerStyle={styles.contentInner}
          >
            <Text style={styles.contentText}>{pageContent}</Text>
          </ScrollView>

          <View style={styles.pageSelector}>
            {pages.map(page => (
              <TouchableOpacity
                key={page}
                style={[
                  styles.pageButton,
                  page === currentPage && styles.pageButtonActive,
                ]}
                onPress={() => setCurrentPage(page)}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    page === currentPage && styles.pageButtonTextActive,
                  ]}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        /* ========== OTHER FILE TYPES ========== */
        <View style={styles.nonTextContainer}>
          <Text style={styles.nonTextTitle}>Document type: {type}</Text>
          <Text style={styles.nonTextDescription}>
            This document will open in an external application.
          </Text>
          <TouchableOpacity
            style={styles.externalButton}
            onPress={handleOpenExternal}
          >
            <Text style={styles.externalButtonText}>Open document</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFDF7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  pageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },

  /* ===== TEXT MODE ===== */
  contentBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0D7C7',
    backgroundColor: '#FFFEFA',
    paddingHorizontal: 12,
  },
  contentInner: {
    paddingVertical: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  pageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  pageButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0C0A0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
    backgroundColor: '#FFF',
  },
  pageButtonActive: {
    backgroundColor: '#F3D9A4',
    borderColor: '#E0B86A',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#555',
  },
  pageButtonTextActive: {
    fontWeight: 'bold',
    color: '#3B2A00',
  },

  /* ===== PDF MODE ===== */
  pdfContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0D7C7',
    backgroundColor: '#615f59',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    width: '100%',
    
  },
  pdfControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  pdfBtn: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#275fb4',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  pdfPageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },

  /* ===== OTHER ===== */
  nonTextContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0D7C7',
    backgroundColor: '#FFFEFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  nonTextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nonTextDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  externalButton: {
    backgroundColor: '#275fb4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  externalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ReaderScreen;
