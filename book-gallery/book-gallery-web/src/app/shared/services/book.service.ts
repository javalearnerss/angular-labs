import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';
import { PageResponse } from '../../features/books/models/page-response.model';
import { Book } from '../../features/books/models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBooks(query: string, categories: string, pageNumber: number, pageSize: number): Observable<PageResponse> {
    const params = new HttpParams().set('query', query)
      .set('categories', categories)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<PageResponse>(this.apiUrl + "/books", {
      params
    });
  }

  getBookById(bookId: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${bookId}`);
  }

  getBookByTitle(title : string) : Observable<Book> {

    const params = new HttpParams()
    .set('title', title);

    return this.http.get<Book>(this.apiUrl+'/book/title', {
      params
    });

  }

}
