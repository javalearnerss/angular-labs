import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {

  @Input() currentPageNumber!: number;
  @Input() totalPages!: number;

  @Output() pageChanged = new EventEmitter<number>();

  get pages(): number[] {
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      return Array.from(
        { length: this.totalPages },
        (_, index) => index + 1
      );
    }

    let startPage = this.currentPageNumber - 2;

    if (startPage < 1) {
      startPage = 1;
    }

    if (startPage + maxVisiblePages - 1 > this.totalPages) {
      startPage = this.totalPages - maxVisiblePages + 1;
    }

    return Array.from(
      { length: maxVisiblePages },
      (_, index) => startPage + index
    );
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