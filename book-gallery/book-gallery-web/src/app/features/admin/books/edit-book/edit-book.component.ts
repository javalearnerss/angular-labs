import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, NgControl, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../../../shared/services/book.service';
import { environment } from '../../../../../environments/environments';
import { CategoryService } from '../../../../shared/services/category.service';
import { Category } from '../../../../shared/models/category.model';
import { isbnValidator } from '../../../../shared/validators/isbn.validator';
import { bookTitleExistsValidator } from '../../../../shared/validators/book-title-exists.validator';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.css'
})
export class EditBookComponent implements OnInit {

  existingCoverImage: string | null = null;

  categories: Category[] = [];

  originalTitle = '';

  editBookForm;

  // editBookForm = new FormGroup({
  //   title: new FormControl('', Validators.required),
  //   author: new FormControl('', Validators.required),
  //   isbn: new FormControl('', Validators.required),
  //   category: new FormControl('', Validators.required),
  //   price: new FormControl(0, {
  //     validators: [Validators.required, Validators.min(0.01)]
  //   }),
  //   stock: new FormControl(0, {
  //     validators: [Validators.required, Validators.min(1)]
  //   }),
  //   coverPhoto: new FormControl('', Validators.required)
  // });

  constructor(private activatedRoute: ActivatedRoute, private bookService: BookService,
    private destroyRef: DestroyRef,
    private categoryService: CategoryService,
    private formBuilder: FormBuilder
  ) {
    this.editBookForm = this.formBuilder.group({ 
      title: ['', Validators.required, bookTitleExistsValidator(bookService, () => this.originalTitle)], 
      author: ['', Validators.required], 
      isbn: ['', [Validators.required, isbnValidator]], 
      category: ['', Validators.required], 
      price: [0, [Validators.required, Validators.min(0.01)]], 
      stock: [0, [Validators.required, Validators.min(1)]], 
      coverPhoto: ['', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadAllCategories();
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (paramMap) => {
        const bookdId = paramMap.get('bookId') ?? '';
        this.loadBook(bookdId);
      }
    });
  }

  loadBook(bookId: string) {
    this.bookService.getBookById(bookId).subscribe(book => {
      this.editBookForm.patchValue({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.categoryId,
        price: book.price,
        stock: book.stock
      });
      
      this.originalTitle = book.title;
      this.existingCoverImage = environment.serverUrl + book.imageUrl;
      console.log(this.existingCoverImage);

    });

  }

  loadAllCategories() {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  isFieldValid(fieldName: string) {
    const control = this.editBookForm.get(fieldName);
    return control?.invalid && control.touched;
  }



  hasError(ctrlname: string, errorName: string) {
    const control = this.editBookForm.get(ctrlname);

    return control?.hasError(errorName) && control.invalid && control.touched
  }

}
