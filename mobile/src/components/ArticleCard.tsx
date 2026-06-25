import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Article } from '../types';
import { timeAgo } from '../timeAgo';

interface Props {
  article: Article;
}

export default function ArticleCard({ article }: Props) {
  const handlePress = async () => {
    try {
      await WebBrowser.openBrowserAsync(article.link);
    } catch {
      // Ignore — could not open the link.
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.title}>{article.title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.source}>{article.source}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.date}>{timeAgo(article.published_at)}</Text>
      </View>
      {article.summary ? (
        <Text style={styles.summary} numberOfLines={3}>
          {article.summary}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  source: {
    fontSize: 12,
    color: '#7a5230',
    fontWeight: '600',
  },
  dot: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  summary: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
});
