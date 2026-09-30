
import { InjectionToken } from '@angular/core';
import { BookStatus } from '../../features/admin/shared/data-table/data-table.component';
import { Book } from '../models/book.model';
import { BookService } from './book.service';

export const BOOK_SERVICE  = new InjectionToken<BookService>('BOOK_SERVICE');

export const BOOK_DATA = new InjectionToken<Book[]>('BOOK_DATA');

export const BOOK_MOCK_DATA: Book[] = [
  {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Programming',
    price: 42.99,
    stock: 15,
    status: BookStatus.AVAILABLE,
    isbn: '9780132350884',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 2,
    title: 'Effective Java',
    author: 'Joshua Bloch',
    category: 'Programming',
    price: 49.99,
    stock: 8,
    status: BookStatus.AVAILABLE,
    isbn: '9780134685991',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 3,
    title: 'Design Patterns',
    author: 'Erich Gamma',
    category: 'Software Engineering',
    price: 39.99,
    stock: 6,
    status: BookStatus.AVAILABLE,
    isbn: '9780201633610',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 4,
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    category: 'Programming',
    price: 44.99,
    stock: 12,
    status: BookStatus.AVAILABLE,
    isbn: '9780135957059',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 5,
    title: 'Refactoring',
    author: 'Martin Fowler',
    category: 'Software Engineering',
    price: 47.50,
    stock: 4,
    status: BookStatus.AVAILABLE,
    isbn: '9780134757599',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 6,
    title: 'Head First Design Patterns',
    author: 'Eric Freeman',
    category: 'Software Engineering',
    price: 36.99,
    stock: 0,
    status: BookStatus.OUT_OF_STOCK,
    isbn: '9780596007126',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 7,
    title: 'Java: The Complete Reference',
    author: 'Herbert Schildt',
    category: 'Java',
    price: 54.99,
    stock: 10,
    status: BookStatus.AVAILABLE,
    isbn: '9781260440232',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 8,
    title: 'Spring in Action',
    author: 'Craig Walls',
    category: 'Spring',
    price: 45.99,
    stock: 7,
    status: BookStatus.AVAILABLE,
    isbn: '9781617297571',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 9,
    title: 'Building Microservices',
    author: 'Sam Newman',
    category: 'Microservices',
    price: 52.99,
    stock: 5,
    status: BookStatus.AVAILABLE,
    isbn: '9781491950357',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 10,
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    category: 'Architecture',
    price: 59.99,
    stock: 3,
    status: BookStatus.AVAILABLE,
    isbn: '9780321125217',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 11,
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'Distributed Systems',
    price: 49.99,
    stock: 9,
    status: BookStatus.AVAILABLE,
    isbn: '9781449373320',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 12,
    title: 'Java Concurrency in Practice',
    author: 'Brian Goetz',
    category: 'Java',
    price: 41.99,
    stock: 2,
    status: BookStatus.AVAILABLE,
    isbn: '9780321349606',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 13,
    title: 'Spring Boot in Action',
    author: 'Craig Walls',
    category: 'Spring',
    price: 38.99,
    stock: 0,
    status: BookStatus.OUT_OF_STOCK,
    isbn: '9781617292545',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 14,
    title: 'Kubernetes Patterns',
    author: 'Bilgin Ibryam',
    category: 'Cloud & DevOps',
    price: 46.99,
    stock: 11,
    status: BookStatus.AVAILABLE,
    isbn: '9781492050281',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 15,
    title: 'AWS Certified Solutions Architect',
    author: 'Stéphane Maarek',
    category: 'AWS',
    price: 34.99,
    stock: 14,
    status: BookStatus.AVAILABLE,
    isbn: '9781801811958',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 16,
    title: 'The Clean Coder',
    author: 'Robert C. Martin',
    category: 'Programming',
    price: 32.99,
    stock: 6,
    status: BookStatus.AVAILABLE,
    isbn: '9780137081073',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 17,
    title: 'Working Effectively with Legacy Code',
    author: 'Michael Feathers',
    category: 'Software Engineering',
    price: 43.99,
    stock: 1,
    status: BookStatus.AVAILABLE,
    isbn: '9780131177055',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 18,
    title: 'Microservices Patterns',
    author: 'Chris Richardson',
    category: 'Microservices',
    price: 48.99,
    stock: 0,
    status: BookStatus.OUT_OF_STOCK,
    isbn: '9781617294549',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 19,
    title: 'Computer Networking',
    author: 'Andrew S. Tanenbaum',
    category: 'Networking',
    price: 55.99,
    stock: 5,
    status: BookStatus.AVAILABLE,
    isbn: '9780132126953',
    coverImage: 'images/no-preview.jpg'
  },
  {
    id: 20,
    title: 'System Design Interview',
    author: 'Alex Xu',
    category: 'System Design',
    price: 29.99,
    stock: 18,
    status: BookStatus.AVAILABLE,
    isbn: '9781736049112',
    coverImage: 'images/no-preview.jpg'
  }
];