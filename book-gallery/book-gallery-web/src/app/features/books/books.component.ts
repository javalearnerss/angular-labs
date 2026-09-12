import { Component } from '@angular/core';
import { BookResultsComponent } from './book-results/book-results.component';
import { BookFiltersComponent } from './book-filters/book-filters.component';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [BookFiltersComponent, BookResultsComponent],
  templateUrl: './books.component.html',
  styleUrl: './books.component.css'
})
export class BooksComponent {

  

}
