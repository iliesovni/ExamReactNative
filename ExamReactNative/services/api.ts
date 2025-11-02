// services/api.ts
import { Book, Note } from '../models/Book';

const API_URL = 'http://localhost:3000/books';
const fallbackImage = require('../assets/images/placeholder-cover.png');

export class BookService {
  static async fetchBooks(): Promise<Book[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return (json ?? []).map((b: any) => ({
      id: b.id,
      name: b.name ?? 'Sans titre',
      author: b.author ?? 'Auteur inconnu',
      editor: b.editor ?? 'Éditeur inconnu',
      year: b.year ?? null,
      read: !!b.read,
      favorite: !!b.favorite,
      rating: b.rating ?? 0,
      theme: b.theme ?? 'Inconnu',
      cover: b.cover ? { uri: b.cover } : fallbackImage,
      notes: b.notes ?? [],
    }));
  }

  static async fetchBook(id: number): Promise<Book | null> {
    try {
      const [bookRes, notesRes] = await Promise.all([
        fetch(`${API_URL}/${id}`),
        fetch(`${API_URL}/${id}/notes`),
      ]);

      if (!bookRes.ok) return null;
      const b = await bookRes.json();

      let notes: Note[] = [];
      if (notesRes.ok) {
        notes = await notesRes.json();
      }

      return {
        id: b.id,
        name: b.name,
        author: b.author,
        editor: b.editor,
        year: b.year,
        read: !!b.read,
        favorite: !!b.favorite,
        rating: b.rating ?? 0,
        theme: b.theme,
        cover: b.cover ? { uri: b.cover } : fallbackImage,
        notes,
      };
    } catch (error) {
      console.error('fetchBook error:', error);
      return null;
    }
  }

  static async createBook(book: Book): Promise<void> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  }

  static async updateBook(id: number, book: Book): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  }

  static async addNote(bookId: number, content: string): Promise<Note> {
    const res = await fetch(`${API_URL}/${bookId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
  }

  static async deleteBook(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  }
}

export default BookService;