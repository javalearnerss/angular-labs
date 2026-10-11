import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, Inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { CategoryService } from '../../../../shared/services/category.service';
import { Category } from '../../../../shared/models/category.model';
import { BookWriteRequest } from '../../../../shared/models/book-write.model';
import { isbnValidator } from '../../../../shared/validators/isbn.validator';
import { bookTitleExistsValidator } from '../../../../shared/validators/book-title-exists.validator';
import { BOOK_SERVICE } from '../../../../shared/services/book-mock-data';
import { environment } from '../../../../../environments/environments.developement';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.css'
})
export class EditBookComponent implements OnInit, OnDestroy {

  existingCoverImage: string | null = null;
  selectedCoverImage: File | null = null;
  coverImagePreview: string | null = null;

  categories: Category[] = [];

  originalTitle = '';
  bookId: number | null = null;
  isSaving = false;
  errorMessage = '';

  serverURL : string = environment.serverUrl;

  editBookForm;

  constructor(private activatedRoute: ActivatedRoute, @Inject(BOOK_SERVICE) private bookService: BookApiService,
    private destroyRef: DestroyRef,
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private router : Router
  ) {
    this.editBookForm = this.formBuilder.group({
      title: ['', Validators.required, bookTitleExistsValidator(bookService, () => this.originalTitle)],
      author: ['', Validators.required],
      isbn: ['', isbnValidator],
      categoryId: [0, Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.loadAllCategories();
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (paramMap) => {
        const bookIdParam = paramMap.get('bookId');

        if (!bookIdParam) {
          return;
        }

        const bookId = Number(bookIdParam);

        if (!Number.isSafeInteger(bookId) || bookId < 1) {
          this.errorMessage = 'The book ID is invalid.';
          return;
        }

        this.bookId = bookId;
        this.loadBook(bookId);
      }
    });
  }

  loadBook(bookId: number): void {
    this.bookService.getBookById(bookId).subscribe({
      next: book => {
        this.originalTitle = book.title;
        this.editBookForm.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn ?? '',
          categoryId: book.categoryId ?? 0,
          price: book.price,
          stock: book.stock,
          description: book.description ?? ''
        });
        this.existingCoverImage = book.coverImage ? this.resolveCoverImage(book.coverImage) : null;
      },
      error: () => this.errorMessage = 'Could not load this book. It may no longer exist.'
    });
  }

  loadAllCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: categories => this.categories = categories,
      error: () => this.errorMessage = 'Could not load book categories. Please try again.'
    });
  }

  onSave(): void {
    if (this.editBookForm.invalid || this.isSaving || this.bookId === null) {
      this.editBookForm.markAllAsTouched();
      return;
    }

    const values = this.editBookForm.getRawValue();
    const book: BookWriteRequest = {
      title: values.title?.trim() ?? '',
      author: values.author?.trim() ?? '',
      isbn: values.isbn?.trim() || null,
      categoryId: Number(values.categoryId),
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description?.trim() || null
    };

    this.isSaving = true;
    this.errorMessage = '';
    this.bookService.updateBook(this.bookId, book, this.selectedCoverImage).subscribe({
      next: () => this.router.navigate(['/admin/books']),
      error: error => {
        this.errorMessage = this.getErrorMessage(error);
        this.isSaving = false;
      }
    });
  }

  goToBooks(): void {
    this.router.navigate(['/admin/books']);
  }

  onCoverImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'Choose a JPG, PNG, or WEBP image no larger than 2 MB.';
      input.value = '';
      return;
    }

    this.errorMessage = '';
    this.releaseCoverPreview();
    this.selectedCoverImage = file;
    this.coverImagePreview = URL.createObjectURL(file);
  }

  private resolveCoverImage(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const serverUrl = environment.serverUrl.replace(/\/+$/, '');
    return `${serverUrl}/${path.replace(/^\/+/, '')}`;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.detail ?? error.error?.message ?? 'Could not save the book. Please try again.';
    }
    return 'Could not save the book. Please try again.';
  }

  private releaseCoverPreview(): void {
    if (this.coverImagePreview) {
      URL.revokeObjectURL(this.coverImagePreview);
      this.coverImagePreview = null;
    }
  }

  ngOnDestroy(): void {
    this.releaseCoverPreview();
  }




  hasError(ctrlname: string, errorName: string) {
    const control = this.editBookForm.get(ctrlname);

    return control?.hasError(errorName) && control.invalid && control.touched
  }

}
