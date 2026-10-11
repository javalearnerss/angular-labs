import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {

  @Input() currentPageNumber!: number;
  @Input() totalPages!: number;
  @Output() pageChanged = new EventEmitter<number>();

  pages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages'] || changes['currentPageNumber']) {
      this.pages = this.buildPages();
    }
  }

  private buildPages(): number[] {
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, this.currentPageNumber - 2);

    if (startPage + maxVisiblePages - 1 > this.totalPages) {
      startPage = this.totalPages - maxVisiblePages + 1;
    }

    return Array.from({ length: maxVisiblePages }, (_, i) => startPage + i);
  }

  goToPage(page: number): void {
    if (page === this.currentPageNumber) {
      return;
    }

    this.currentPageNumber = page;
    this.pageChanged.emit(page);
  }

  previousPage(): void {
    if (this.currentPageNumber > 1) {
      this.currentPageNumber--;
      this.pageChanged.emit(this.currentPageNumber);
    }
  }

  nextPage(): void {
    if (this.currentPageNumber < this.totalPages) {
      this.currentPageNumber++;
      this.pageChanged.emit(this.currentPageNumber);
    }
  }
}