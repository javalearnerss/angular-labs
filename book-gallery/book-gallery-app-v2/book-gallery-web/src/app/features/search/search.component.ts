import { Component } from '@angular/core';
import { BookFiltersComponent } from '../books/book-filters/book-filters.component';
import { SearchResultsComponent } from './search-results/search-results.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [BookFiltersComponent, SearchResultsComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {

}
