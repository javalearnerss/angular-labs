import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-range-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './price-range-filter.component.html',
  styleUrl: './price-range-filter.component.css'
})
export class PriceRangeFilterComponent {
  minPrice = 0;
  maxPrice = 5000;
}
