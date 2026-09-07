import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Book } from '../models/book.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBooksBycategory(category: string): Observable<Book[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<Book[]>(this.apiUrl + "/books", {
      params
    });
  }

}
