import { Book } from '../../shared/models/book.model';

export interface CartItem {
  book: Book;
  quantity: number;
}