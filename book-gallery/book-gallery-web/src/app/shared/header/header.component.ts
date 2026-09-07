import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  navItems = [
    { label: 'Home', route: '/home' },
    { label: 'Books', route: '/books' },
    { label: 'Authors', route: '/authors' },
    { label: 'About', route: '/about' }
  ];

  searchText: string = '';
  cartCount: number = 5;
  wishlistCount: number = 2;
  notificationCount: number = 3;

  searchBooks() {

  }

}
