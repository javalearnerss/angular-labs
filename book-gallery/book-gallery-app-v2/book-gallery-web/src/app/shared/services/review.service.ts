import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments.developement";
import { ReviewSummary } from "../../features/books/models/review-summary.model";


@Injectable({
  providedIn: 'root'
})
export class ReviewService {

    apiUrl : string = environment.apiUrl;

    constructor(private http : HttpClient){}

    getBookReviewSummary(bookId: number): Observable<ReviewSummary> {
        const params = new HttpParams().set('bookId', bookId); 
        return this.http.get<ReviewSummary>(`${this.apiUrl}/reviews/summary`, {
            params
        });
    }


}