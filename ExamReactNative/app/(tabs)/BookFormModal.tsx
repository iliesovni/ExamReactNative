import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Book } from '../../models/Book';
import api from '../../services/api';

export default function BookFormModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; bookId?: string }>();
  const mode = (params.mode === 'edit' ? 'edit' : 'add') as 'add' | 'edit';
  const bookId = useMemo(() => (params.bookId ? Number(params.bookId) : undefined), [params.bookId]);

  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState('');
  const [read, setRead] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mode === 'edit' && typeof bookId === 'number') {
        try {
          setLoading(true);
          const b = await api.fetchBook(bookId);
          if (mounted && b) {
            setName(b.name || '');
            setAuthor(b.author || '');
            setPublisher(b.editor || '');
            setYear(b.year ? String(b.year) : '');
            setRead(!!b.read);
          }
        } catch (e) {
          console.error(e);
          Alert.alert('Erreur', "Impossible de charger le livre.");
        } finally {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [mode, bookId]);

  const validate = () => name.trim().length > 0 && author.trim().length > 0;

  const onSave = async () => {
    if (!validate()) {
      Alert.alert('Validation', 'Donne au moins un nom et un auteur.');
      return;
    }
    const payload: Book = { name, author, editor: publisher, year: year ? Number(year) : undefined, read };
    try {
      setSaving(true);
      if (mode === 'add') await api.createBook(payload);
      else if (typeof bookId === 'number') await api.updateBook(bookId, payload);
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', "Impossible d'enregistrer le livre.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Titre</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Titre du livre" />

      <Text style={styles.label}>Auteur</Text>
      <TextInput style={styles.input} value={author} onChangeText={setAuthor} placeholder="Auteur" />

      <Text style={styles.label}>Éditeur</Text>
      <TextInput style={styles.input} value={publisher} onChangeText={setPublisher} placeholder="Éditeur" />

      <Text style={styles.label}>Année</Text>
      <TextInput style={styles.input} value={year} onChangeText={setYear} placeholder="Année" keyboardType="numeric" />

      <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => setRead((r) => !r)} style={styles.checkbox}>
          <Text>{read ? '✓' : ''}</Text>
        </TouchableOpacity>
        <Text>Lu</Text>
      </View>

      <TouchableOpacity style={[styles.saveBtn, (saving || loading) && { opacity: 0.6 }]} onPress={onSave} disabled={saving || loading}>
        <Text style={styles.saveTxt}>{mode === 'add' ? 'Ajouter' : 'Enregistrer'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text>Annuler</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 6 },
  checkbox: { width: 28, height: 28, borderWidth: 1, borderColor: '#ccc', marginRight: 8, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  saveBtn: { marginTop: 20, backgroundColor: '#0a84ff', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveTxt: { color: '#fff', fontWeight: '700' },
  cancelBtn: { marginTop: 12, alignItems: 'center' },
});