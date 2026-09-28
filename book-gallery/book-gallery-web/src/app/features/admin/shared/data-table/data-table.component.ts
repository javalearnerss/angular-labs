import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Book } from '../../../../shared/models/book.model';




export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent {
books: Book[] = [
  {
    id: 1,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    category: 'Fiction',
    price: 399,
    stock: 25,
    status: BookStatus.AVAILABLE,
    isbn: '9780062315007',
    coverImage: 'assets/books/alchemist.jpg'
  },
  {
    id: 2,
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    category: 'Fiction',
    price: 499,
    stock: 18,
    status: BookStatus.AVAILABLE,
    isbn: '9781594631931',
    coverImage: 'assets/books/kite-runner.jpg'
  }
];
}
