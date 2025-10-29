import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Book } from '../../models/Book';
import api from '../../services/api';

export default function BookDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const bookId = useMemo(() => (params.id ? Number(params.id) : undefined), [params.id]);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    if (typeof bookId !== 'number' || Number.isNaN(bookId)) return;
    try {
      setLoading(true);
      const b = await api.fetchBook(bookId);
      if (!b) throw new Error('Not found');
      setBook(b);
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de charger le livre.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }, [bookId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async () => {
    if (!book || typeof book.id !== 'number') return;
    try {
      setUpdating(true);
      const next = !book.read;
      await api.updateBook(book.id, { ...book, read: next });
      setBook({ ...book, read: next });
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Impossible de mettre à jour le statut.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  if (!book) {
    return (
      <View style={styles.container}> 
        <Text>Livre introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {book.cover ? (
        // eslint-disable-next-line react/no-unstable-nested-components
        <Image source={book.cover} style={styles.cover} />
      ) : null}
      <Text style={styles.title}>{book.name}</Text>
      <Text style={styles.author}>{book.author}</Text>
      {!!book.editor && <Text style={styles.meta}>Éditeur: {book.editor}</Text>}
      {!!book.year && <Text style={styles.meta}>Année: {book.year}</Text>}

      <TouchableOpacity style={[styles.toggleBtn, updating && { opacity: 0.6 }]} disabled={updating} onPress={toggleRead}>
        <Text style={styles.toggleTxt}>{book.read ? 'Marquer comme non lu' : 'Marquer comme lu'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  cover: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16, resizeMode: 'cover' },
  title: { fontSize: 22, fontWeight: '700' },
  author: { marginTop: 4, color: '#555' },
  meta: { marginTop: 8, color: '#666' },
  toggleBtn: { marginTop: 20, backgroundColor: '#0a84ff', padding: 12, borderRadius: 8, alignItems: 'center' },
  toggleTxt: { color: '#fff', fontWeight: '700' },
  backBtn: { marginTop: 12, alignItems: 'center' },
});


