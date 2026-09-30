import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../../features/books/models/page-response.model';
import { Book } from '../models/book.model';
import { BookWriteRequest } from '../models/book-write.model';
import { BookService } from './book.service';
import { environment } from '../../../environments/environments.developement';

@Injectable()
export class BookApiService implements BookService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { 
    
  }

  getBooks(searchKeyword: string, categories: string, pageNumber: number, pageSize: number): Observable<PageResponse> {
    const params = new HttpParams().set('query', searchKeyword)
      .set('categories', categories)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<PageResponse>(this.apiUrl + "/books", {
      params
    });
  }

  getBookById(bookId: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${bookId}`);
  }

  getBookByTitle(title : string) : Observable<Book> {

    const params = new HttpParams()
    .set('title', title);

    return this.http.get<Book>(this.apiUrl+'/book/title', {
      params
    });

  }

  createBook(book: BookWriteRequest, coverImage: File | null): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/books`, this.toFormData(book, coverImage));
  }

  updateBook(bookId: number, book: BookWriteRequest, coverImage: File | null): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/books/${bookId}`, this.toFormData(book, coverImage));
  }

  private toFormData(book: BookWriteRequest, coverImage: File | null): FormData {
    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(book)], { type: 'application/json' }));
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    return formData;
  }

}
