export type Note = {
  id?: number;
  content: string;
  createdAt: string;
};

export type Book = {
  id?: number;
  name: string;
  author: string;
  editor?: string;
  year?: number;
  read?: boolean;
  favorite?: boolean;
  rating?: number;
  cover?: any;
  theme?: string;
  notes?: Note[];
};