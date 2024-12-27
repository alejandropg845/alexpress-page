import { Component } from '@angular/core';
import { SafetyService } from '../../services/safety.service';

@Component({
  selector: 'app-safety-dialog',
  templateUrl: './safety-dialog.component.html',
  styles: ``
})
export class SafetyDialogComponent {

  constructor(public safetyService:SafetyService){}

}
