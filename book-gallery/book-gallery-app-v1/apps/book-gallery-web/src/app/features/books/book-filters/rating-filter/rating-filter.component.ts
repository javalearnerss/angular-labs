import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rating-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rating-filter.component.html',
  styleUrl: './rating-filter.component.css'
})
export class RatingFilterComponent {
ratings = [5, 4, 3, 2];

selectedRating = 5;

selectRating(rating: number): void {
  this.selectedRating = rating;
}
}
