import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BookWriteRequest } from '../../../../shared/models/book-write.model';
import { Category } from '../../../../shared/models/category.model';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { CategoryService } from '../../../../shared/services/category.service';
import { BOOK_SERVICE } from '../../../../shared/services/book-mock-data';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css'
})
export class AddBookComponent implements OnInit, OnDestroy {

  categories: Category[] = [];
  selectedCoverImage: File | null = null;
  coverImagePreview: string | null = null;
  isSaving = false;
  errorMessage = '';

  constructor(
    @Inject(BOOK_SERVICE) private readonly bookService: BookApiService,
    private readonly categoryService: CategoryService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: categories => this.categories = categories,
      error: () => this.errorMessage = 'Could not load book categories. Please try again.'
    });
  }

  onSaveNewBook(form: NgForm): void {
    if (form.invalid || this.isSaving) {
      form.control.markAllAsTouched();
      return;
    }

    const values = form.value;
    const book: BookWriteRequest = {
      title: values.title.trim(),
      author: values.author.trim(),
      isbn: values.isbn?.trim() || null,
      categoryId: Number(values.categoryId),
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description?.trim() || null
    };

    this.isSaving = true;
    this.errorMessage = '';
    this.bookService.createBook(book, this.selectedCoverImage).subscribe({
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
}