import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-table-column',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './table-column.component.html',
  styleUrl: './table-column.component.css'
})
export class TableColumnComponent {

  @Input() header!: string;

  @Input() field! : string;
}
