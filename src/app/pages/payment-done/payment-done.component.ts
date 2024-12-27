import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment-done',
  templateUrl: './payment-done.component.html',
  styles: ``
})
export class PaymentDoneComponent implements OnInit{

  constructor(
    private authService:AuthService){}

  ngOnInit():void {
    this.authService.userCartSubject.next([]);
    this.authService.userCartObservable
    .subscribe();


  }

}
