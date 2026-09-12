import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Book } from '../models/book.model';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/page-response.model';

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

}
