import { Component, input, Input } from '@angular/core';
import { BookCardComponent } from './book-card/book-card.component';
import { Book } from '../../models/book.model';

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
