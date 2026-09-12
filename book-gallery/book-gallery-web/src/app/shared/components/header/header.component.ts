import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';

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

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = new FormControl('', {
    nonNullable: true
  });

  cartCount = 0;
  wishlistCount = 0;
  notificationCount = 0;

  readonly navItems = [
    { label: 'Home', route: '/home' },
    { label: 'Books', route: '/books' },
    { label: 'Authors', route: '/authors' },
    { label: 'About', route: '/about' }
  ];

  constructor() {
    this.setupCartSubscription();
    this.setupSearchSubscription();
  }

  private setupCartSubscription(): void {
    this.cartService.cartCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(count => {
        this.cartCount = count;
      });
  }

  private setupSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(searchText => {
        this.navigateToSearch(searchText);
      });
  }

  private navigateToSearch(searchText: string): void {
    const query = searchText.trim();

    this.router.navigate(['/books'], {
      queryParams: {
        query: query || null
      }, 
      queryParamsHandling: 'merge'
    });
  }
}