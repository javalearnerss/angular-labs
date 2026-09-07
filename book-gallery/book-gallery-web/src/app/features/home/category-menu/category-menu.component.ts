import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './category-menu.component.html',
  styleUrl: './category-menu.component.css'
})
export class CategoryMenuComponent {

  categories = [
  { name: 'Fiction', icon: '📖', active: true },
  { name: 'Non-Fiction', icon: '📄', active: false },
  { name: 'Science', icon: '⚛', active: false },
  { name: 'Technology', icon: '💻', active: false },
  { name: 'Business', icon: '▥', active: false },
  { name: 'Biography', icon: '♙', active: false },
  { name: 'Self Help', icon: '♧', active: false },
  { name: 'Children', icon: '☺', active: false },
  { name: 'More', icon: '⁙', active: false }
];

}
