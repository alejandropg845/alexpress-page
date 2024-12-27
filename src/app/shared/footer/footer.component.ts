import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styles: ``
})
export class FooterComponent {

  theme = localStorage.getItem('color-theme');
  
}
