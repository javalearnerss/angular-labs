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
  @Input() totalPages! : number;
  @Output() pageChanged = new EventEmitter<number>();

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPageNumber = page;
    this.pageChanged.emit(this.currentPageNumber);
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