
import { Component, DestroyRef, OnInit } from '@angular/core';
import { BooksToolbarComponent } from './books-toolbar/books-toolbar.component';
import { BooksGridComponent } from './books-grid/books-grid.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../models/book.model';
import { BookService } from '../services/book.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-results',
  standalone: true,
  imports: [
    BooksToolbarComponent,
    BooksGridComponent,
    PaginationComponent
  ],
  templateUrl: './book-results.component.html',
  styleUrl: './book-results.component.css'
})
export class BookResultsComponent implements OnInit {

  selectedCategory: string = '';
  books: Book[] = [];

  currentPageNumber: number = 1;
  pageSize: number = 5;
  totalBooksCount: number = 0;
  totalPages: number = 0;

  private routeSubscription!: Subscription;

  constructor(
    private activateRoute: ActivatedRoute,
    private bookService: BookService,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.activateRoute.queryParamMap.subscribe({
      next: (queryParam) => {
        this.selectedCategory = queryParam.get('category') ?? '';
        this.currentPageNumber = 1;
        this.loadBooks();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.routeSubscription.unsubscribe();
    });
  }

  loadBooks(): void {
    this.bookService
      .getBooksByCategory(
        this.selectedCategory,
        this.currentPageNumber,
        this.pageSize
      )
      .subscribe({
        next: (response) => {
          this.books = response.books;
          this.totalBooksCount = response.totalBooks;
          this.totalPages = response.totalPages;
          this.pageSize = response.pageSize;
          this.currentPageNumber = response.pageNumber;
        }
      });
  }

  onPageChanged(pageNumber: number){
    this.currentPageNumber = pageNumber;
    this.loadBooks();
  }

  get startBookNumber(): number {
    if (this.totalBooksCount === 0) {
      return 0;
    }

    return (this.currentPageNumber - 1) * this.pageSize + 1;
  }

  get endBookNumber(): number {
    return Math.min(
      this.currentPageNumber * this.pageSize,
      this.totalBooksCount
    );
  }

}

