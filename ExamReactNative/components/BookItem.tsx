import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Book } from '../models/Book';
import StarRating from './StarRating';

interface Props {
  book: Book;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function BookItem({ book, onPress, onEdit, onDelete }: Props) {
  const favoriteIcon = book.favorite
    ? require('../assets/images/favorite.png')
    : require('../assets/images/NotFavorite.png');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={favoriteIcon} style={styles.favoriteIcon} />
      <View style={styles.left}>
        <Text style={styles.title}>{book.name}</Text>
        <Text style={styles.subtitle}>{book.author}</Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={book.rating || 0} size={16} />
          {(book.rating || 0) > 0 && <Text style={styles.ratingText}>{book.rating}/5</Text>}
        </View>
        <Text
          style={[
            styles.readStatus,
            book.read ? styles.readStatusRead : styles.readStatusUnread,
          ]}
        >
          {book.read ? 'Lu' : 'Non lu'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  left: { flex: 1 },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  readStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  readStatusRead: {
    color: '#0A84FF',
    backgroundColor: '#0A84FF15',
  },
  readStatusUnread: {
    color: '#888',
    backgroundColor: '#f2f2f7',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionBtn: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '600',
  },
  favoriteIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
});