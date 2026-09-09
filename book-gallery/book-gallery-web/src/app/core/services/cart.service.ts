import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Book } from '../../features/books/models/book.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    private cartItems: CartItem[] = [];

    private cartCountSubject = new BehaviorSubject<number>(0);

    readonly cartCount$ = this.cartCountSubject.asObservable();

    addToCart(book: Book) {
        var cartItem = this.cartItems.find((item: CartItem) => item.book.id == book.id);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            this.cartItems.push({ book: book, quantity: 1 });
        }
        this.updateCartCount();
    }

    increaseQuantity(bookId: number): void {
        const cartItem = this.cartItems.find(
            item => item.book.id === bookId
        );

        if (cartItem) {
            cartItem.quantity++;
            this.updateCartCount();
        }
    }

    decreaseQuantity(bookId: number): void {
        const cartItem = this.cartItems.find(
            item => item.book.id === bookId
        );

        if (!cartItem) {
            return;
        }

        if (cartItem.quantity > 1) {
            cartItem.quantity--;
        } else {
            this.removeFromCart(bookId);
            return;
        }

        this.updateCartCount();
    }

    removeFromCart(bookId: number): void {
        this.cartItems = this.cartItems.filter(
            item => item.book.id !== bookId
        );

        this.updateCartCount();
    }

    private updateCartCount(): void {
        const totalQuantity = this.cartItems.reduce(
            (total, item) => total + item.quantity,
            0
        );

        this.cartCountSubject.next(totalQuantity);
    }

    getCartItems(): CartItem[] {
        return [...this.cartItems];
    }

    getQuantity(bookId: number): number {
        const cartItem = this.cartItems.find(
            item => item.book.id === bookId
        );

        return cartItem?.quantity ?? 0;
    }

}