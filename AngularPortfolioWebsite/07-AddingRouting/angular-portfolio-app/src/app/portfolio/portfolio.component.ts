import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {
  //import { Title } from '@angular/platform-browser'
  constructor(private titleServce: Title){
    this.titleServce.setTitle("Sri - Portfolio");
  }
}
