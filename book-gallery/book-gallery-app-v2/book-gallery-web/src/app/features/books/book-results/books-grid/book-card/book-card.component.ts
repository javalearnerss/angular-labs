import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { CartService } from '../../../../../core/services/cart.service';
import { BookWithReviewSummary } from '../../../../../shared/models/book.model';
import { environment } from '../../../../../../environments/environments.developement';



@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {

  @Input() book!: BookWithReviewSummary;

  serverUrl : string = environment.serverUrl;

  constructor(private cartService: CartService) { }

  addToCart(): void {
    this.cartService.addToCart(this.book);
  }

  increaseQuantity(): void {
    this.cartService.increaseQuantity(this.book.id);
  }

  decreaseQuantity(): void {
    this.cartService.decreaseQuantity(this.book.id);
  }

  get quantity(): number {
    return this.cartService.getQuantity(this.book.id);
  }
}
