import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-books-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './books-toolbar.component.html',
  styleUrl: './books-toolbar.component.css'
})
export class BooksToolbarComponent {

  @Input() startBookNumber! : number;
  @Input() endBookNumber! : number;
  @Input() totalBooksCount! : number;
  @Input() selectedCategory!: string;

}
