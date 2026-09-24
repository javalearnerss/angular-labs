import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  price: number;
  stock: number;
  status: BookStatus;
  isbn: string;
  coverImage: string;
}

export type BookStatus = 'Active' | 'Inactive' | 'Out of Stock';

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
    status: 'Active',
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
    status: 'Active',
    isbn: '9781594631931',
    coverImage: 'assets/books/kite-runner.jpg'
  }
];
}
