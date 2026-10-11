import { Observable } from "rxjs";
import { PageResponse } from "../../features/books/models/page-response.model";
import { Book } from "../models/book.model";

export interface AdminBookSearchCriteria {
    query: string;
    categoryId: number;
    status: string;
    sortBy: string;
}


export interface BookService {

    getBooks(searchKeyword: string, categories: string, pageNumber: number, pageSize: number) : Observable<PageResponse>;

    searchAdminBooks(criteria: AdminBookSearchCriteria, pageNumber: number, pageSize: number): Observable<PageResponse>;

    getBookById(bookId: number): Observable<Book>;

    getBookByTitle(title : string) : Observable<Book>;

}