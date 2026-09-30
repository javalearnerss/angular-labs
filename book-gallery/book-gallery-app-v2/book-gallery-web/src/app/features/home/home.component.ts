import { Component } from '@angular/core';
import { HeroBannerComponent } from "./hero-banner/hero-banner.component";
import { CategoryMenuComponent } from "./category-menu/category-menu.component";
import { BestSellersComponent } from "./best-sellers/best-sellers.component";
import { RecommendationsComponent } from './recommendations/recommendations.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroBannerComponent, CategoryMenuComponent, BestSellersComponent, RecommendationsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
