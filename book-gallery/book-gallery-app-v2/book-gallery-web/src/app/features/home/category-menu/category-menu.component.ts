import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-menu.component.html',
  styleUrl: './category-menu.component.css'
})
export class CategoryMenuComponent {

  readonly categories = [
    { name: 'Fiction' },
    { name: 'Non-Fiction' },
    { name: 'Science' },
    { name: 'Technology' },
    { name: 'Business' },
    { name: 'Biography' },
    { name: 'Self Help' },
    { name: 'Children' }
  ];

}
