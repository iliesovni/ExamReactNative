// services/BookService.ts
import { Book } from '../models/Book';

const API_URL = 'http://localhost:3000/books';
const fallbackImage = require('../assets/images/placeholder-cover.png');

export class BookService {
  static async fetchBooks(): Promise<Book[]> {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const json = await res.json();

      const data: Book[] = (json ?? []).map((b: any) => ({
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
      }));

      return data;
    } catch (error) {
      console.error('BookService.fetchBooks error:', error);
      throw error;
    }
  }

  static async fetchBook(id: number): Promise<Book | null> {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const b = await res.json();
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
      };
    } catch (error) {
      console.error('BookService.fetchBook error:', error);
      return null;
    }
  }

  static async createBook(book: Book): Promise<void> {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    } catch (error) {
      console.error('BookService.createBook error:', error);
      throw error;
    }
  }

  static async updateBook(id: number, book: Book): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    } catch (error) {
      console.error('BookService.updateBook error:', error);
      throw error;
    }
  }

  static async deleteBook(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    } catch (error) {
      console.error('BookService.deleteBook error:', error);
      throw error;
    }
  }
}

export default BookService;