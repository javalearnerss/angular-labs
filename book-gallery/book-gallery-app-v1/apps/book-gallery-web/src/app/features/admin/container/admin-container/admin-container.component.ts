import { Component } from '@angular/core';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-container',
  standalone: true,
  imports: [AdminMenuComponent, AdminHeaderComponent, RouterOutlet],
  templateUrl: './admin-container.component.html',
  styleUrl: './admin-container.component.css'
})
export class AdminContainerComponent {

}
