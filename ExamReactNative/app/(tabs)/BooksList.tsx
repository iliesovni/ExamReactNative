// app/(tabs)/BooksList.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BookItem from '../../components/BookItem';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Book } from '../../models/Book';
import api from '../../services/api';

export default function BooksList() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchBooks();
      setBooks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
      return () => {};
    }, [fetchBooks])
  );

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await api.deleteBook(deleteDialog.id);
      setBooks((prev) => prev.filter((b) => b.id !== deleteDialog.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteDialog(null);
    }
  };

  const animatePress = (scaleRef: Animated.Value, toValue: number) => {
    Animated.spring(scaleRef, {
      toValue,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Ma Bibliothèque</Text>
        <Text style={styles.subtitle}>Gère tes livres avec style</Text>
      </Animated.View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Chargement des livres...</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <BookItem
                book={item}
                onPress={() => {
                  if (!item.id) return;
                  router.push({ pathname: '/book/[id]', params: { id: String(item.id) } });
                }}
                onEdit={() => router.push(`/(tabs)/BookFormModal?mode=edit&bookId=${item.id}`)}
                onDelete={() => setDeleteDialog({ id: item.id! })}
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>Empty book</Text>
              <Text style={styles.emptyTitle}>Aucun livre</Text>
              <Text style={styles.emptyText}>Ajoute ton premier chef-d'œuvre !</Text>
            </View>
          }
        />
      )}

      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPressIn={() => animatePress(fabScale, 0.93)}
          onPressOut={() => animatePress(fabScale, 1)}
          onPress={() => router.push('/(tabs)/BookFormModal?mode=add')}
          activeOpacity={1}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      <ConfirmDialog
        visible={!!deleteDialog}
        title="Supprimer ce livre ?"
        message="Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
        loading={deleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1c1c1e',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 6,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 68,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    maxWidth: '80%',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
  },
  fab: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 14,
  },
  fabText: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 38,
  },
});