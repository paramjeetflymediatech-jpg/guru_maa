import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

// For now, some sample religious documents. Later you can load this from API.
const SAMPLE_DOCS = [
  {
    id: 'gita-1',
    title: 'Bhagavad Gita',
    subtitle: '18 chapters of divine wisdom',
    totalPages: 18,
  },
  {
    id: 'mantra-1',
    title: 'Morning Mantras',
    subtitle: 'Daily morning prayers and chants',
    totalPages: 5,
  },
  {
    id: 'aarti-1',
    title: 'Evening Aarti',
    subtitle: 'Evening devotional songs and aarti',
    totalPages: 7,
  },
];

function LibraryScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Reader', {
          docId: item.id,
          title: item.title,
          totalPages: item.totalPages,
        })
      }>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      <Text style={styles.cardMeta}>{item.totalPages} chapters/pages</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Spiritual Library</Text>
      <Text style={styles.subheading}>
        Choose a scripture or prayer collection to begin reading.
      </Text>

      <FlatList
        data={SAMPLE_DOCS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#FFF9F0',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#999999',
  },
});

export default LibraryScreen;
