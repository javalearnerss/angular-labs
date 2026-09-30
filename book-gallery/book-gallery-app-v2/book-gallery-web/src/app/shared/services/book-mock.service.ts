import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AdminBookSearchCriteria, BookService } from './book.service';
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

  searchAdminBooks(criteria: AdminBookSearchCriteria, pageNumber: number, pageSize: number): Observable<PageResponse> {
    const query = criteria.query.trim().toLowerCase();
    let books = this.booksData.filter(book =>
      (!query || book.title.toLowerCase().includes(query)
        || book.author.toLowerCase().includes(query)
        || book.isbn?.toLowerCase().includes(query))
      && (criteria.categoryId <= 0 || book.categoryId === criteria.categoryId)
      && (criteria.status.toLowerCase() === 'all'
        || criteria.status.toLowerCase() === 'active' && book.stock > 0
        || criteria.status.toLowerCase() === 'out-of-stock' && book.stock <= 0)
    );

    switch (criteria.sortBy) {
      case 'oldest':
        books = books.sort((first, second) => first.id - second.id);
        break;
      case 'price-low':
        books = books.sort((first, second) => first.price - second.price);
        break;
      case 'price-high':
        books = books.sort((first, second) => second.price - first.price);
        break;
      case 'name':
        books = books.sort((first, second) => first.title.localeCompare(second.title));
        break;
      default:
        books = books.sort((first, second) => second.id - first.id);
    }

    const totalBooks = books.length;
    const safePageSize = Math.max(1, pageSize);
    const totalPages = Math.ceil(totalBooks / safePageSize);
    const start = (Math.max(1, pageNumber) - 1) * safePageSize;

    return of({
      books: books.slice(start, start + safePageSize),
      pageNumber: Math.max(1, pageNumber),
      pageSize: safePageSize,
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