
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Inject, inject, Injectable, OnInit } from '@angular/core';
import { BooksToolbarComponent } from './books-toolbar/books-toolbar.component';
import { BooksGridComponent } from './books-grid/books-grid.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../../../shared/models/book.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookService } from '../../../shared/services/book.service';
import { BOOK_SERVICE } from '../../../shared/services/book-mock-data';

@Component({
  selector: 'app-book-results',
  standalone: true,
  imports: [
    BooksToolbarComponent,
    BooksGridComponent,
    PaginationComponent
  ],
  templateUrl: './book-results.component.html',
  styleUrl: './book-results.component.css',
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class BookResultsComponent implements OnInit {

  selectedCategory: string = '';
  searchKeyword: string = '';
  books: Book[] = [];

  currentPageNumber: number = 1;
  pageSize: number = 12;
  totalBooksCount: number = 0;
  totalPages: number = 0;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private activateRoute: ActivatedRoute,
    @Inject(BOOK_SERVICE) private bookService: BookService,
    private cdr : ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activateRoute.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (queryParam) => {
        this.selectedCategory = queryParam.get('categories') ?? '';
        this.searchKeyword = queryParam.get('searchQery') ?? '';
        this.currentPageNumber = 1;
        this.loadBooks();
      }
    });


  }

  loadBooks(): void {
    this.bookService.getBooks(
      this.searchKeyword,
      this.selectedCategory,
      this.currentPageNumber,
      this.pageSize
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.books = response.books;
          this.totalBooksCount = response.totalBooks;
          this.totalPages = response.totalPages;
          this.pageSize = response.pageSize;
          this.currentPageNumber = response.pageNumber;
          this.cdr.markForCheck();
        }
      });
  }

  onPageChanged(pageNumber: number) {
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

