import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PageResponse } from '../../../books/models/page-response.model';
import { environment } from '../../../../../environments/environments';
import { BookStatus } from '../../shared/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
import { Book } from '../../../../shared/models/book.model';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { CategoryService } from '../../../../shared/services/category.service';
import { BOOK_SERVICE } from '../../../../shared/services/book-mock-data';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { Category } from '../../../../shared/models/category.model';
import { AdminBookSearchCriteria, BookService } from '../../../../shared/services/book.service';

@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [PageHeaderComponent, SearchInputComponent, DataTableComponent, PaginationComponent],
  templateUrl: './books-page.component.html',
  styleUrl: './books-page.component.css'
})
export class BooksPageComponent implements OnInit {

  buttonText : string = 'Add New Book';

  books: Book[] = [];
  isLoading = true;
  errorMessage = '';

  totalPages = 0;
  currentPageNumber = 1;
  pageSize = 5;
  categories : Category[] = [];
  
  private searchCriteria: AdminBookSearchCriteria = {
    query: '',
    categoryId: 0,
    status: 'All',
    sortBy: 'newest'
  };
  private latestPage: PageResponse | null = null;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    @Inject(BOOK_SERVICE) private readonly bookService: BookService,
    private readonly categoryService: CategoryService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.categoryService.getAllCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: categories => {
        this.categories = categories;
        if (this.latestPage) {
          this.applyPage(this.latestPage);
        }
      },
      error: () => this.errorMessage = 'Could not load categories.'
    });
  }

  onSearchCriteriaChanged(criteria: AdminBookSearchCriteria): void {
    this.searchCriteria = criteria;
    this.currentPageNumber = 1;
    this.isLoading = true;
    this.errorMessage = '';
  }

  onSearchBooks(page: PageResponse): void {
    this.errorMessage = '';
    this.isLoading = false;
    this.applyPage(page);
  }

  onSearchFailed(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  onPageChanged(pageNumber: number): void {
    this.currentPageNumber = pageNumber;
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.bookService.searchAdminBooks(this.searchCriteria, this.currentPageNumber, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.errorMessage = '';
          this.isLoading = false;
          this.applyPage(page);
        },
        error: () => {
          this.errorMessage = 'Could not load books. Please try again.';
          this.isLoading = false;
        }
      });
  }

  private applyPage(page: PageResponse): void {
    this.latestPage = page;
    this.books = page.books.map(book => ({
      ...book,
      category: this.categories.find(category => category.id === book.categoryId)?.name ?? '',
      status: book.stock > 0 ? BookStatus.AVAILABLE : BookStatus.OUT_OF_STOCK,
      coverImage: this.resolveCoverImage(book.coverImage)
    }));
    this.currentPageNumber = page.pageNumber;
    this.totalPages = page.totalPages;
  }

  goToAddBook(): void {
    this.router.navigate(['/admin/books/add-book']);
  }

  private resolveCoverImage(path: string | null): string {
    const imagePath = path || '/images/books/no-preview.jpg';
    if (/^https?:\/\//i.test(imagePath)) {
      return imagePath;
    }
    const serverUrl = environment.serverUrl.replace(/\/+$/, '');
    return `${serverUrl}/${imagePath.replace(/^\/+/, '')}`;
  }



}
