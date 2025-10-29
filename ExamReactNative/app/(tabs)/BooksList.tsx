// app/(tabs)/BooksList.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchBooks();
      setBooks(data || []);
    } catch (err) {
      console.error(err);
      // Alert.alert('Erreur', 'Impossible de charger la liste des livres.');
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

  const handleDelete = async () => {
    if (!deleteDialog) return;

    setDeleting(true);
    try {
      await api.deleteBook(deleteDialog.id);
      setBooks((prev) => prev.filter((b) => b.id !== deleteDialog.id));
    } catch (err) {
      console.error(err);
      // Alert.alert('Erreur', 'Impossible de supprimer le livre.');
    } finally {
      setDeleting(false);
      setDeleteDialog(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mes livres</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(tabs)/BookFormModal?mode=add')}
        >
          <Text style={styles.addTxt}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <BookItem
              book={item}
              onPress={() => {
                if (!item.id) return;
                router.push({ pathname: '/book/[id]', params: { id: String(item.id) } });
              }}
              onEdit={() => router.push(`/(tabs)/BookFormModal?mode=edit&bookId=${item.id}`)}
              onDelete={() => setDeleteDialog({ id: item.id! })}
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun livre — ajoute ton premier livre</Text>}
        />
      )}

      {/* Modal de confirmation */}
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
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0a84ff', borderRadius: 8 },
  addTxt: { color: '#fff', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 40 },
});