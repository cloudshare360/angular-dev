import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoAppComponent } from './demo-app/demo-app.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DemoAppComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-app';
}
