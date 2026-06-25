import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchNews } from '../api';
import { Article, CategoryKey } from '../types';
import ArticleCard from '../components/ArticleCard';

interface Props {
  category?: CategoryKey;
}

const PAGE_SIZE = 20;

export default function NewsListScreen({ category }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      try {
        setError(null);
        const data = await fetchNews({ category, page: pageToLoad, pageSize: PAGE_SIZE });
        setArticles((prev) => (replace ? data.items : [...prev, ...data.items]));
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [category]
  );

  useEffect(() => {
    setLoading(true);
    load(1, true).finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(1, true);
    setRefreshing(false);
  }, [load]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    await load(page + 1, false);
    setLoadingMore(false);
  }, [loadingMore, loading, page, totalPages, load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7a5230" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <ArticleCard article={item} />}
      contentContainerStyle={articles.length === 0 ? styles.emptyContainer : styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7a5230']} />
      }
      onEndReachedThreshold={0.4}
      onEndReached={onLoadMore}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{error ? error : 'Sin noticias'}</Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={styles.footerLoader} size="small" color="#7a5230" />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  footerLoader: {
    marginVertical: 16,
  },
});
