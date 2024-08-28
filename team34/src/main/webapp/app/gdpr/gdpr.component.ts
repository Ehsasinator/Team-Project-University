import { Component } from '@angular/core';

@Component({
  selector: 'jhi-gdpr',
  templateUrl: './gdpr.component.html',
  styleUrls: ['./gdpr.component.scss'],
})
export class GDPRComponent {
  colour: boolean = true;

  changeColor() {
    this.colour = !this.colour;
  }
}
