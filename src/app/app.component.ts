import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'WatsonHealth';
  faCoffee = faCoffee;
}
