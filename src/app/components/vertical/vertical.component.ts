import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.css']
})
export class VerticalComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
  goToSearch() {
    this.router.navigate(['/search']);
  }
  goToHome() {
    this.router.navigate(['/home']);
  }
  goToMl() {
    this.router.navigate(['/ml']);
  }
  goToGraph() {
    this.router.navigate(['/graph']);
  }
  goToDocs() {
    this.router.navigate(['/docs']);
  }
  goToSecondExample() {
    this.router.navigate(['/example2']);
  }
}
