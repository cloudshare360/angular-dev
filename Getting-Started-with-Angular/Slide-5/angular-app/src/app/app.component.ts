import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RestaurantMenuComponent } from './restaurant-menu/restaurant-menu.component';

@Component({
  selector: 'app-root',
  imports: [RestaurantMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-app';
}
