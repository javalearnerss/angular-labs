import { Component, input, Input } from '@angular/core';
import { Book, BookCardComponent } from './book-card/book-card.component';

@Component({
  selector: 'app-books-grid',
  standalone: true,
  imports: [BookCardComponent],
  templateUrl: './books-grid.component.html',
  styleUrl: './books-grid.component.css'
})
export class BooksGridComponent {

  @Input() books : Book[] = [];

}
