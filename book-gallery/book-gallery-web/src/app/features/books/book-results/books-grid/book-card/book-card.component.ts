import { Component, Input } from '@angular/core';
import { environment } from '../../../../../../environments/environments';
import { CartService } from '../../../../../core/services/cart.service';
import { Book } from '../../../models/book.model';



@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {

  @Input() book!: Book;

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
