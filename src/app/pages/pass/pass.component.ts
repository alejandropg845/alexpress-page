import { Component } from '@angular/core';
import { PasswordService } from '../../services/password.service';

@Component({
  selector: 'app-pass',
  templateUrl: './pass.component.html',
  styles: ``
})
export class PassComponent {

  constructor(public passwordService:PasswordService){}

}
