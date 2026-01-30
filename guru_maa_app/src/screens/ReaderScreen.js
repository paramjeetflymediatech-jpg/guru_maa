import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import Pdf from 'react-native-pdf';

// Very simple in-memory content for demo purposes.
// Later you can replace this with real content loaded from your backend/docs.
const CONTENT = {
  'gita-1': {
    1: `Chapter 1: 
    Through out her life Maa attracted destitute and distressed people whio came to her refuge and became her devotees. She freed them from all kind of pain and brought joy to their lives. She took on her body & soul many incurable diseases of her devotees. The foremost is that she drove the devotees to righteous conduct as well as meditative prayers. Many times she inspired devotees by visiting in their dreams and preached them with profound messages and kept watch on their conduct. She was embodiment of divine nectar. The simple & pure soul of her kind incarnate in the world in centuries. Due to her divine attributes lacs of devotees still remember her, pray her, sing hymns and celebrate her.

Maa used to give flower petals as Prasad and this Prasad worked like divine blessings for the devotees.`,
    2: 'Chapter 2: Sankhya Yoga\n\nContent for chapter 2...',
  },
  'mantra-1': {
    1: 'Om Bhur Bhuvaḥ Swaḥ\nTat-savitur vareṇyaṃ...',
  },
  'aarti-1': {
    1: 'Om Jai Jagdish Hare... (Aarti verses here)',
  },
};

function ReaderScreen({ route }) {
  const {
    docId,
    title,
    totalPages = 1,
    type = 'pdf',
    url,
  } = route.params || {};
  const [currentPage, setCurrentPage] = useState(1);
  console.log('Reader route params:', route.params);

  const handleOpenExternal = () => {
    if (!url) {
      Alert.alert(
        'No document URL',
        'This document does not have a URL configured yet.',
      );
      return;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Cannot open document',
        'There was a problem opening this file.',
      );
    });
  };

  const pages = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= totalPages; i += 1) {
      arr.push(i);
    }
    return arr;
  }, [totalPages]);

  const pageContent =
    (CONTENT[docId] && CONTENT[docId][currentPage]) ||
    'Content for this page is not yet added.';

  const isPdf = type === 'pdf';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {type === 'text' && (
        <Text style={styles.pageLabel}>
          Page {currentPage} of {totalPages}
        </Text>
      )}

      {isPdf && url ? (
        <View style={styles.pdfContainer}>
          <Pdf
            source={{ uri: url, cache: true }}
            style={styles.pdf}
            trustAllCerts={false}
            onError={error => {
              console.log('PDF load error', error, 'URL:', url);
              Alert.alert(
                'Error loading PDF',
                error?.message || JSON.stringify(error, null, 2),
              );
            }}
          />
        </View>
      ) : type === 'text' ? (
        <>
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
        <View style={styles.nonTextContainer}>
          <Text style={styles.nonTextTitle}>Document type: {type}</Text>
          <Text style={styles.nonTextDescription}>
            This document will be opened using your device's default app for
            this file type.
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFDF7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pageLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
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
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  pageButtonActive: {
    backgroundColor: '#F3D9A4',
    borderColor: '#E0B86A',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#555555',
  },
  pageButtonTextActive: {
    color: '#3B2A00',
    fontWeight: 'bold',
  },
  pdfContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0D7C7',
    backgroundColor: '#FFFEFA',
    marginTop: 8,
  },
  pdf: {
    flex: 1,
  },
  nonTextContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0D7C7',
    backgroundColor: '#FFFEFA',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nonTextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nonTextDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  externalButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#275fb4',
  },
  externalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ReaderScreen;
