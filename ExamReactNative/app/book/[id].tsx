import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSuccessPopup from '../../components/ActionSuccessPopup';
import StarRating from '../../components/StarRating';
import { Book } from '../../models/Book';
import api from '../../services/api';

export default function BookDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const bookId = useMemo(() => (params.id ? Number(params.id) : undefined), [params.id]);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingRating, setUpdatingRating] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [successPopup, setSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tiltAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const load = useCallback(async () => {
    if (typeof bookId !== 'number' || Number.isNaN(bookId)) return;
    try {
      setLoading(true);
      const b = await api.fetchBook(bookId);
      if (!b) throw new Error('Not found');
      setBook(b);
    } catch (e) {
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
      setSuccessMessage(next ? 'Marqué comme lu !' : 'Marqué comme non lu !');
      setSuccessPopup(true);
    } catch (e) {
      Alert.alert('Erreur', "Impossible de mettre à jour le statut.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleFavorite = async () => {
    if (!book || typeof book.id !== 'number') return;
    try {
      setTogglingFavorite(true);
      const next = !book.favorite;
      await api.updateBook(book.id, { ...book, favorite: next });
      setBook({ ...book, favorite: next });
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setSuccessMessage(next ? 'Ajouté aux favoris !' : 'Retiré des favoris !');
      setSuccessPopup(true);
    } catch (e) {
      Alert.alert('Erreur', "Impossible de mettre à jour le favori.");
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!book || typeof book.id !== 'number') return;
    try {
      setUpdatingRating(true);
      await api.updateBook(book.id, { ...book, rating: newRating });
      setBook({ ...book, rating: newRating });
      setSuccessMessage(`Note mise à jour : ${newRating}/5`);
      setSuccessPopup(true);
    } catch (e) {
      Alert.alert('Erreur', "Impossible de mettre à jour la note.");
    } finally {
      setUpdatingRating(false);
    }
  };

  const addNote = async () => {
    if (!book || !book.id || !noteContent.trim()) return;
    try {
      setAddingNote(true);
      const newNote = await api.addNote(book.id, noteContent.trim());
      setBook(prev => prev ? {
        ...prev,
        notes: [...(prev.notes || []), newNote]
      } : null);
      setNoteContent('');
      setSuccessMessage('Note ajoutée !');
      setSuccessPopup(true);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d’ajouter la note.');
    } finally {
      setAddingNote(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} à ${hours}:${minutes}`;
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

  const favoriteIcon = book.favorite
    ? require('../../assets/images/favorite.png')
    : require('../../assets/images/NotFavorite.png');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
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

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Note</Text>
            <View style={styles.ratingWrapper}>
              <StarRating
                rating={book.rating || 0}
                onRatingChange={handleRatingChange}
                size={32}
              />
              {(book.rating || 0) > 0 && (
                <Text style={styles.ratingValue}>{book.rating}/5</Text>
              )}
            </View>
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

          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>

            {(book.notes ?? []).length > 0 ? (
              <View style={styles.notesList}>
                {book.notes!.map((note) => (
                  <View key={note.id ?? note.createdAt} style={styles.noteItem}>
                    <Text style={styles.noteContent}>{note.content}</Text>
                    <Text style={styles.noteDate}>
                      {formatDate(note.createdAt)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noNotes}>Aucune note pour le moment.</Text>
            )}

            <View style={styles.addNoteContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Écrire une note..."
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.addNoteBtn, (!noteContent.trim() || addingNote) && styles.addNoteBtnDisabled]}
                onPress={addNote}
                disabled={!noteContent.trim() || addingNote}
              >
                <Text style={styles.addNoteBtnText}>
                  {addingNote ? '...' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backTxt}>Retour</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={toggleFavorite}
          disabled={togglingFavorite}
          activeOpacity={0.7}
        >
          <Animated.Image
            source={favoriteIcon}
            style={[
              styles.favoriteIcon,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
        </TouchableOpacity>
      </ScrollView>

      <ActionSuccessPopup
        visible={successPopup}
        message={successMessage}
        onHide={() => setSuccessPopup(false)}
      />
    </KeyboardAvoidingView>
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
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingValue: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: '700',
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
  favoriteBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  favoriteIcon: {
    width: 36,
    height: 36,
  },
  notesSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  notesList: {
    marginBottom: 20,
  },
  noteItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  noNotes: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  addNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    maxHeight: 100,
  },
  addNoteBtn: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addNoteBtnDisabled: {
    opacity: 0.5,
  },
  addNoteBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});