import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.developement';
import { Author } from '../models/author.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.apiUrl + "/authors/all");
  }

}
