import { Component } from '@angular/core';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-menu.component.html',
  styleUrl: './restaurant-menu.component.css'
})
export class RestaurantMenuComponent {

  dishes = [
    {
      name: "Pizza Margherita",
      description: "Classic pizza with tomatoes, mozzarella, and basil.",
      imageUrl:
        "https://static-assets.codecademy.com/Courses/learn-angular/01-angular-introduction/images/menu_item_2.jpg",
    },
    {
      name: "Pasta Carbonara",
      description: "Creamy pasta with pancetta, eggs, and cheese.",
      imageUrl:
        "https://static-assets.codecademy.com/Courses/learn-angular/01-angular-introduction/images/menu_item_1.jpg",
    },
  ];

}
