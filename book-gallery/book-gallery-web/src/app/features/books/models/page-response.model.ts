import { Book } from "./book.model";


export interface PageResponse {
    books : Book[];
    pageNumber : number;
    pageSize : number;
    totalBooks : number;
    totalPages: number;
}