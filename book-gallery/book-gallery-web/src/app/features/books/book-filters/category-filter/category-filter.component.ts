import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface Category {
  id: number;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.css'
})
export class CategoryFilterComponent {

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  selectedCategories: string[] = [];

  readonly categories: Category[] = [
    { id: 1, name: 'Fiction', icon: 'book' },
    { id: 2, name: 'Non-Fiction', icon: 'document' },
    { id: 3, name: 'Science', icon: 'science' },
    { id: 4, name: 'Technology', icon: 'technology' },
    { id: 5, name: 'Business', icon: 'business' },
    { id: 6, name: 'Biography', icon: 'person' },
    { id: 7, name: 'Self Help', icon: 'heart' },
    { id: 8, name: 'Children', icon: 'children' }
  ];

  onCategoryChange(category: Category, checked: boolean): void {
    if (checked) {
      this.selectedCategories = [
        ...this.selectedCategories,
        category.name
      ];
    } else {
      this.selectedCategories = this.selectedCategories.filter(
        name => name !== category.name
      );
    }

    this.updateUrl();
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.updateUrl();
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categories: this.selectedCategories.length
          ? this.selectedCategories.join(',')
          : null
      },
      queryParamsHandling: 'merge'
    });
  }
}