import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { BookService } from './book.service';
import { PageResponse } from '../../features/books/models/page-response.model';
import { Book } from '../models/book.model';
import { BOOK_DATA } from './book-mock-data';

@Injectable()
export class BookMockService implements BookService {

  constructor(
    @Inject(BOOK_DATA)
    private booksData: Book[]
  ) {}

  getBooks(
    query: string,
    categories: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PageResponse> {

    let books = [...this.booksData];

    if (query) {
      const searchTerm = query.toLowerCase().trim();

      books = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm)
      );
    }

    if (categories) {
      books = books.filter(book =>
        book.category === categories
      );
    }

    const totalBooks = books.length;
    const totalPages = Math.ceil(totalBooks / pageSize);

    // pageNumber is 1-based
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;

    const pageBooks = books.slice(start, end);

    return of({
      books: pageBooks,
      pageNumber,
      pageSize,
      totalBooks,
      totalPages
    });
  }

  getBookById(bookId: number): Observable<Book> {
    const book = this.booksData.find(book => book.id === bookId);

    return of(book as Book);
  }

  getBookByTitle(title: string): Observable<Book> {
    const book = this.booksData.find(
      book => book.title.toLowerCase() === title.toLowerCase()
    );

    return of(book as Book);
  }
}