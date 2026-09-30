import { Component } from '@angular/core';
import { MainContentComponent } from '../../../layout/main-content/main-content.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-store-container',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './store-container.component.html',
  styleUrl: './store-container.component.css'
})
export class StoreContainerComponent {

}
