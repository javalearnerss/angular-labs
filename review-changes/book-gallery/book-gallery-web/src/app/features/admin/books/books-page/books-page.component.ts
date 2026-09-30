import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../../environments/environments';
import { BookStatus } from '../../shared/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { Book } from '../../../../shared/models/book.model';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { CategoryService } from '../../../../shared/services/category.service';

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
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly bookService: BookApiService,
    private readonly categoryService: CategoryService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    forkJoin({
      page: this.bookService.getBooks('', '', 1, 1000),
      categories: this.categoryService.getAllCategories()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ page, categories }) => {
        this.books = page.books.map(book => ({
          ...book,
          category: categories.find(category => category.id === book.categoryId)?.name ?? '',
          status: book.stock > 0 ? BookStatus.AVAILABLE : BookStatus.OUT_OF_STOCK,
          coverImage: this.resolveCoverImage(book.coverImage)
        }));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load books. Please try again.';
        this.isLoading = false;
      }
    });
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
