import { Component, DestroyRef, OnDestroy, OnInit } from '@angular/core';
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
  imports: [BooksToolbarComponent, BooksGridComponent, PaginationComponent],
  templateUrl: './book-results.component.html',
  styleUrl: './book-results.component.css'
})
export class BookResultsComponent implements OnInit {

  selectedCategory: string = '';
  books: Book[] = [];
  private routeSubscription!: Subscription;



  constructor(private activateRoute: ActivatedRoute, private bookService: BookService, private destroyRef: DestroyRef) { }


  ngOnInit(): void {
    this.routeSubscription = this.activateRoute.queryParamMap.subscribe({
      next: (queryParam) => {
        this.selectedCategory = queryParam.get('category') ?? '';
        this.loadBooks();
      }
    });

    this.destroyRef.onDestroy(()=> this.routeSubscription.unsubscribe());
  }

  loadBooks() {
    this.bookService.getBooksBycategory(this.selectedCategory).subscribe({
      next: (result) => {
        this.books = result;
      }
    });


  }


}
