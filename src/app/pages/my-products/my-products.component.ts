import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../interfaces/product.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styles: ``
})
export class MyProductsComponent implements OnInit, OnDestroy{

  userProducts:Product[] = [];
  dataSubscription$:Subscription | undefined;

  loadUserProducts(){
    this.dataSubscription$ = this.authService.userProductsObservable
    .subscribe(res => this.userProducts = res
    );
  }

  removeMyProduct(productId:number){
    this.authService.removeFromMyProducts(productId);
  }

  constructor(private authService:AuthService){}

  ngOnInit(): void {
    this.authService.getUserProducts();
    this.loadUserProducts();
  }

  ngOnDestroy(): void {
    this.dataSubscription$?.unsubscribe();
  }

}
