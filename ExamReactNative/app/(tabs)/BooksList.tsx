// app/(tabs)/BooksList.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'read' | 'unread' | 'favorite'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'author' | 'theme'>('name');

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
    }, [fetchBooks])
  );

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        b => b.name.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }

    if (filter === 'read') result = result.filter(b => b.read);
    if (filter === 'unread') result = result.filter(b => !b.read);
    if (filter === 'favorite') result = result.filter(b => b.favorite);

    result.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortBy === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortBy === 'author') {
        valA = a.author;
        valB = b.author;
      } else if (sortBy === 'theme') {
        valA = a.theme || '';
        valB = b.theme || '';
      }

      return valA.localeCompare(valB);
    });

    return result;
  }, [books, search, filter, sortBy]);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await api.deleteBook(deleteDialog.id);
      setBooks(prev => prev.filter(b => b.id !== deleteDialog.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteDialog(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ma Bibliothèque</Text>
      </View>

      <View style={styles.controls}>
        <TextInput
          style={styles.search}
          placeholder="Rechercher..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {(['all', 'read', 'unread', 'favorite'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Tous' : f === 'read' ? 'Lus' : f === 'unread' ? 'Non lus' : 'Favoris'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Trier :</Text>
          {(['name', 'author', 'theme'] as const).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
              onPress={() => setSortBy(s)}
            >
              <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>
                {s === 'name' ? 'Titre' : s === 'author' ? 'Auteur' : 'Thème'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <BookItem
              book={item}
              onPress={() => router.push(`/book/${item.id}`)}
              onEdit={() => router.push(`/(tabs)/BookFormModal?mode=edit&bookId=${item.id}`)}
              onDelete={() => setDeleteDialog({ id: item.id! })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>Aucun livre</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/BookFormModal?mode=add')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!deleteDialog}
        title="Supprimer ?"
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
  container: { flex: 1, backgroundColor: '#f9f9fb' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1c1c1e' },
  controls: { padding: 16, backgroundColor: '#fff', marginBottom: 8 },
  search: {
    backgroundColor: '#f1f1f6',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f1f1f6',
    borderRadius: 20,
  },
  filterBtnActive: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#555' },
  filterTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f1f6',
    borderRadius: 16,
  },
  sortBtnActive: { backgroundColor: '#007AFF' },
  sortText: { fontSize: 13, fontWeight: '600', color: '#555' },
  sortTextActive: { color: '#fff' },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 18, color: '#888' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300' },
});