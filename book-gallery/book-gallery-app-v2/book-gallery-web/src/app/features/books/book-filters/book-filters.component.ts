import { Component } from '@angular/core';
import { RatingFilterComponent } from './rating-filter/rating-filter.component';
import { CategoryFilterComponent } from './category-filter/category-filter.component';
import { PriceRangeFilterComponent } from './price-range-filter/price-range-filter.component';

@Component({
  selector: 'app-book-filters',
  standalone: true,
  imports: [CategoryFilterComponent, PriceRangeFilterComponent, RatingFilterComponent],
  templateUrl: './book-filters.component.html',
  styleUrl: './book-filters.component.css'
})
export class BookFiltersComponent {

}
