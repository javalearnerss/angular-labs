import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../../../../shared/models/book.model';
import { TableColumnComponent } from '../components/table-column/table-column.component';




export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent implements AfterContentInit {

  @Input() books: Book[] = [];
  @Input() currentPageNumber = 1;
  @Input() pageSize = 5;

  @ContentChildren(TableColumnComponent)
  columnList!: QueryList<TableColumnComponent>;

  columns: TableColumnComponent[] = [];

  ngAfterContentInit(): void {
    this.columnList.toArray();
    this.columns = this.columnList.toArray();

    if (this.columns.length === 0) {
      console.error('DataTable: add at least one <app-column>');
    }

  }


  getCellValue(row: any, column: TableColumnComponent): string {
    const value = row[column.field];

    return value === null || value === undefined
      ? '-'
      : value;
  }


}
