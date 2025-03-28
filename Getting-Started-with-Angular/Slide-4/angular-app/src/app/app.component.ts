import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { RestaurantMenuComponent } from './restaurant-menu/restaurant-menu.component';

@Component({
  selector: 'app-root',
  imports: [UserProfileComponent, RestaurantMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-app';
}
