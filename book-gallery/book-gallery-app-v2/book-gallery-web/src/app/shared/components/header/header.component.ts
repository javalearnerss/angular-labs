import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';

/**
 * Provides the main navigation and user actions for the BookStore application.
 *
 * <p>The header provides:</p>
 * <ul>
 *   <li>Application branding.</li>
 *   <li>Primary application navigation.</li>
 *   <li>Global book search.</li>
 *   <li>Shopping cart count.</li>
 *   <li>Wishlist and notification indicators.</li>
 *   <li>Login or authenticated-user information.</li>
 * </ul>
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  /**
   * Angular Router used to navigate to application routes.
   */
  private readonly router = inject(Router);

  /**
   * Service responsible for maintaining the shopping cart state.
   */
  private readonly cartService = inject(CartService);

  /**
   * Angular lifecycle reference used to automatically unsubscribe
   * from observables when the component is destroyed.
   */
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Search input used for global book, author, and ISBN searches.
   *
   * <p>The control is non-nullable so its value is always a string.</p>
   */
  readonly searchControl = new FormControl('', {
    nonNullable: true
  });

  /**
   * Indicates whether the current user is authenticated.
   *
   * <p>This is currently a temporary value for integrating the Login UI.
   * It should later be supplied by the application's authentication service.</p>
   */
  isLoggedIn = false;

  /**
   * Number of items currently present in the shopping cart.
   */
  cartCount = 0;

  /**
   * Number of items currently present in the user's wishlist.
   */
  wishlistCount = 0;

  /**
   * Number of unread notifications for the current user.
   */
  notificationCount = 0;

  /**
   * Primary navigation items displayed in the application header.
   */
  readonly navItems = [
    { label: 'Home', route: '/home' },
    { label: 'Books', route: '/books' },
    { label: 'Authors', route: '/authors' },
    { label: 'About', route: '/about' },
    { label: 'Admin', route: '/admin' }
  ];

  /**
   * Initializes the header subscriptions.
   */
  constructor() {

    // Subscribe to changes in the shopping cart count.
    this.setupCartSubscription();

    // Subscribe to changes in the global search field.
    this.setupSearchSubscription();
  }

  /**
   * Subscribes to the cart count observable and keeps the header
   * synchronized with the current number of cart items.
   */
  private setupCartSubscription(): void {

    // Subscribe to the cart count maintained by CartService.
    this.cartService.cartCount$
      .pipe(

        // Automatically unsubscribe when this component is destroyed.
        takeUntilDestroyed(this.destroyRef)

      )
      .subscribe(count => {

        // Update the count displayed on the cart icon.
        this.cartCount = count;
      });
  }

  /**
   * Subscribes to changes in the global search input.
   *
   * <p>The search is debounced to prevent navigation on every
   * individual keystroke.</p>
   */
  private setupSearchSubscription(): void {

    // Listen for changes made to the search input.
    this.searchControl.valueChanges
      .pipe(

        // Wait until the user pauses typing for 300 milliseconds.
        debounceTime(300),

        // Ignore consecutive identical search values.
        distinctUntilChanged(),

        // Automatically unsubscribe when this component is destroyed.
        takeUntilDestroyed(this.destroyRef)

      )
      .subscribe(searchText => {

        // Navigate to the books page using the entered search keyword.
        this.navigateToSearch(searchText);
      });
  }

  /**
   * Navigates to the Books page using the supplied search keyword.
   *
   * @param searchKeywordValue raw value entered into the search field
   */
  private navigateToSearch(searchKeywordValue: string): void {

    // Remove leading and trailing whitespace from the search value.
    const searchKeyword = searchKeywordValue.trim();

    // Navigate to the Books page and update the search query parameter.
    this.router.navigate(['/books'], {

      // Use the entered keyword as the searchQuery parameter.
      queryParams: {
        searchQuery: searchKeyword || null
      },

      // Preserve other query parameters already present in the URL.
      queryParamsHandling: 'merge'
    });
  }
}