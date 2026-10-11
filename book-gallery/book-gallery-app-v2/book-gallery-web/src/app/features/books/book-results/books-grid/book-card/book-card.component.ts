import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { CartService } from '../../../../../core/services/cart.service';
import { BookWithReviewSummary } from '../../../../../shared/models/book.model';


@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {

  @Input() book!: BookWithReviewSummary;

  get coverTheme(): string {
    const category = this.book.category?.toLowerCase() ?? '';
    const themes: Record<string, string> = {
      fiction: 'cover-forest',
      'non-fiction': 'cover-ochre',
      science: 'cover-ocean',
      technology: 'cover-midnight',
      business: 'cover-clay',
      biography: 'cover-plum',
      'self help': 'cover-sage',
      children: 'cover-coral'
    };

    return themes[category] ?? this.getDefaultCoverTheme();
  }

  constructor(private cartService: CartService) { }

  private getDefaultCoverTheme(): string {
    const title = this.book.title ?? '';
    const hash = Array.from(title).reduce((value, character) => (
      (value * 31 + character.charCodeAt(0)) >>> 0
    ), 0);
    const themes = ['cover-forest', 'cover-ochre', 'cover-ocean', 'cover-midnight', 'cover-clay', 'cover-plum'];
    return themes[hash % themes.length];
  }

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
