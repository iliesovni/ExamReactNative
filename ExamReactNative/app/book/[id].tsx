import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Book } from '../../models/Book';
import api from '../../services/api';

export default function BookDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const bookId = useMemo(() => (params.id ? Number(params.id) : undefined), [params.id]);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const tiltAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    if (typeof bookId !== 'number' || Number.isNaN(bookId)) return;
    try {
      setLoading(true);
      const b = await api.fetchBook(bookId);
      if (!b) throw new Error('Not found');
      setBook(b);
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de charger le livre.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [bookId, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading && book) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(tiltAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, book]);

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

  const interpolateTilt = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0],
  });

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Livre introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.coverContainer,
          {
            opacity: fadeAnim,
            transform: [
              { perspective: 1000 },
              { rotateX: interpolateTilt + 'deg' },
              { scale: tiltAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
            ],
          },
        ]}
      >
        {book.cover ? (
          <Image source={book.cover} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderText}>No cover</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>{book.name}</Text>
        <Text style={styles.author}>{book.author}</Text>

        <View style={styles.metaRow}>
          {!!book.editor && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Éditeur</Text>
              <Text style={styles.metaValue}>{book.editor}</Text>
            </View>
          )}
          {!!book.year && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Année</Text>
              <Text style={styles.metaValue}>{book.year}</Text>
            </View>
          )}
        </View>

        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, book.read ? styles.read : styles.unread]}>
            {book.read ? 'Lu' : 'Non lu'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.toggleBtn, updating && styles.toggleBtnDisabled]}
          onPress={toggleRead}
          disabled={updating}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleTxt}>
            {updating ? '...' : book.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backTxt}>Retour</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
    paddingTop: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
  },
  coverContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  cover: {
    width: 220,
    height: 320,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  placeholderCover: {
    width: 220,
    height: 320,
    borderRadius: 16,
    backgroundColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  author: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  read: {
    color: '#0A84FF',
  },
  unread: {
    color: '#ff453a',
  },
  toggleBtn: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toggleBtnDisabled: {
    opacity: 0.7,
  },
  toggleTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backTxt: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  notFound: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 40,
  },
});