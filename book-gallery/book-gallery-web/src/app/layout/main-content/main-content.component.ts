import { Component } from '@angular/core';
import { HomeComponent } from '../../features/home/home.component';
import { HeroBannerComponent } from '../../features/home/hero-banner/hero-banner.component';
import { BooksComponent } from '../../features/books/books.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.css'
})
export class MainContentComponent {

}
