import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  name: string = "Srinivasa Rao Gurram";
  role: string = "Software Developer";
  location: string = "Dallas, USA";
  linkedinUrl: string = "https://www.linkedin_profile_url.com";
  githubUrl: string = "https://github_profile_url.com";
  imageUrl:String ="sri.png"
}
