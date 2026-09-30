import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-menu',
  standalone : true,
  imports : [CommonModule, RouterModule],
  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.css'
})
export class AdminMenuComponent {

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '⌂',
      route: '/admin/dashboard'
    },
    {
      label: 'Books',
      icon: '▣',
      route: '/admin/books'
    },
    {
      label: 'Authors',
      icon: '♙',
      route: '/admin/authors'
    },
    {
      label: 'Categories',
      icon: '▦',
      route: '/admin/categories'
    },
    {
      label: 'Orders',
      icon: '🛒',
      route: '/admin/orders'
    },
    {
      label: 'Users',
      icon: '♙',
      route: '/admin/users'
    },
    {
      label: 'Reviews',
      icon: '☆',
      route: '/admin/reviews'
    },
    {
      label: 'Settings',
      icon: '⚙',
      route: '/admin/settings'
    }
  ];

  footerItems: MenuItem[] = [
    {
      label: 'Back to Store',
      icon: '↗',
      route: '/'
    }
  ];
}