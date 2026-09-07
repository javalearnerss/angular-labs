import { Component } from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { RouterLink } from "@angular/router";

interface Category {
  id: number;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [IconComponent, RouterLink ],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.css'
})
export class CategoryFilterComponent {

  selectedCategory: number = 0;

  categories: Category[] = [
    {
      id: 0,
      name: 'All Categories',
      icon: 'book'
    },
    {
      id: 1,
      name: 'Fiction',
      icon: 'book'
    },
    {
      id: 2,
      name: 'Non-Fiction',
      icon: 'document'
    },
    {
      id: 3,
      name: 'Science',
      icon: 'science'
    },
    {
      id: 4,
      name: 'Technology',
      icon: 'technology'
    },
    {
      id: 5,
      name: 'Business',
      icon: 'business'
    },
    {
      id: 6,
      name: 'Biography',
      icon: 'person'
    },
    {
      id: 7,
      name: 'Self Help',
      icon: 'heart'
    },
    {
      id: 8,
      name: 'Children',
      icon: 'children'
    }
  ];

  selectCategory(categoryId : number) : void {
    this .selectedCategory = categoryId;
  }

}
