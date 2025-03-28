import { Component } from '@angular/core';
import { UserComponent } from '../user/user.component'

@Component({
  selector: 'demo-app',
  standalone: true,
  imports: [UserComponent],
  templateUrl: './demo-app.component.html',
  styleUrl: './demo-app.component.css'
})
export class DemoAppComponent {

}
