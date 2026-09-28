import { Observable } from "rxjs";
import { PageResponse } from "../../features/books/models/page-response.model";
import { Book } from "../models/book.model";


export interface BookService {

    getBooks(searchKeyword: string, categories: string, pageNumber: number, pageSize: number) : Observable<PageResponse>;

    getBookById(bookId: number): Observable<Book>;

    getBookByTitle(title : string) : Observable<Book>;

}