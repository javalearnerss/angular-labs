import { Book } from '../../features/books/models/book.model';

export interface CartItem {
  book: Book;
  quantity: number;
}