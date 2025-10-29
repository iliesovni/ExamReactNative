import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Book } from '../models/Book';

interface Props {
  book: Book;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function BookItem({ book, onPress, onEdit, onDelete }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.title}>{book.name}</Text>
        <Text style={styles.subtitle}>{book.author}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}><Text>✏️</Text></TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}><Text>🗑️</Text></TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 10, alignItems: 'center' },
  left: { flex: 1 },
  title: { fontWeight: '700' },
  subtitle: { color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', marginLeft: 8 },
  actionBtn: { marginLeft: 8, padding: 6 },
});