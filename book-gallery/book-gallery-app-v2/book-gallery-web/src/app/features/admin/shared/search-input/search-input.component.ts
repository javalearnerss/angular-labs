import { Component, DestroyRef, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BOOK_SERVICE } from '../../../../shared/services/book-mock-data';
import { AdminBookSearchCriteria, BookService } from '../../../../shared/services/book.service';
import { Category } from '../../../../shared/models/category.model';
import { CategoryService } from '../../../../shared/services/category.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, EMPTY, startWith, switchMap } from 'rxjs';
import { PageResponse } from '../../../books/models/page-response.model';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css'
})
export class SearchInputComponent implements OnInit {

  searchControl = new FormControl('');
  categoryControl = new FormControl(0);
  bookStatusControl = new FormControl('All');
  sortingControl = new FormControl('newest');

  categories: Category[] = [];

  errorMessage: string | null = null;

  @Output() searchBooks = new EventEmitter<PageResponse>();
  @Output() searchCriteriaChange = new EventEmitter<AdminBookSearchCriteria>();
  @Output() searchFailed = new EventEmitter<string>();

  constructor(@Inject(BOOK_SERVICE) private bookService: BookService,
    private categoryService: CategoryService,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit(): void {
    this.categoryService.getAllCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.categories = response;
      },
      error: error => {
        this.errorMessage = 'Could not load categories.';
      }
    });
    this.initBookSearch();
  }

  initBookSearch(): void {
    combineLatest({
      searchTerm: this.searchControl.valueChanges.pipe(
        startWith(this.searchControl.value ?? ''),
        debounceTime(300),
        distinctUntilChanged()
      ),
      categoryId: this.categoryControl.valueChanges.pipe(
        startWith(this.categoryControl.value ?? 0),
        distinctUntilChanged()
      ),
      bookStatus: this.bookStatusControl.valueChanges.pipe(
        startWith(this.bookStatusControl.value ?? 'All'),
        distinctUntilChanged()
      ),
      sorting: this.sortingControl.valueChanges.pipe(
        startWith(this.sortingControl.value ?? 'newest'),
        distinctUntilChanged()
      )
    }).pipe(
      switchMap(({ searchTerm, categoryId, bookStatus, sorting }) => {
        const criteria: AdminBookSearchCriteria = {
          query: searchTerm?.trim() ?? '',
          categoryId: Number(categoryId ?? 0),
          status: bookStatus ?? 'All',
          sortBy: sorting ?? 'newest'
        };
        this.errorMessage = null;
        this.searchCriteriaChange.emit(criteria);
        return this.bookService.searchAdminBooks(criteria, 1, 15).pipe(
          catchError(() => {
            const message = 'Could not search books. Please try again.';
            this.errorMessage = message;
            this.searchFailed.emit(message);
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: page => {
        this.searchBooks.emit(page);
      }
    });
  }


}
