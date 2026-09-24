import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [PageHeaderComponent, SearchInputComponent, DataTableComponent, PaginationComponent],
  templateUrl: './books-page.component.html',
  styleUrl: './books-page.component.css'
})
export class BooksPageComponent {

  buttonText : string = 'Add New Book';
  
}
