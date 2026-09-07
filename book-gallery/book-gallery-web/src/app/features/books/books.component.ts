import { Component } from '@angular/core';
import { BookFiltersComponent } from './book-filters/book-filters.component';
import { BookResultsComponent } from './book-results/book-results.component';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [BookFiltersComponent, BookResultsComponent],
  templateUrl: './books.component.html',
  styleUrl: './books.component.css'
})
export class BooksComponent {

  

}
