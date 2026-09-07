import { Component, Input } from '@angular/core';
import { environment } from '../../../../../../environments/environments';

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  rating: number;
  image: string;
}

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {
  @Input() book!: Book;
  readonly serverUrl = environment.serverUrl;
}
