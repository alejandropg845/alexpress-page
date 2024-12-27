import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import { ProductsService } from '../../services/products.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-less',
  templateUrl: './less.component.html',
  styles: ``
})
export class LessComponent implements OnInit, OnDestroy{

  products:Product[] = [];
  dataSubscription$:Subscription | undefined;

  loadLessProducts(){
    this.dataSubscription$ = this.productsService.loadProducts()
    .subscribe(products => {
      this.products = products.filter(p => p.price < 4);
    });
  }

  addToCart(productId:number){
    this.authService.addProductToUserCart(productId);
  }

  addToWishList(productId:number){
    this.authService.addToUserWishList(productId);
  }

  constructor(private productsService:ProductsService, private authService:AuthService){}

  ngOnInit(): void {
      this.loadLessProducts();
  }

  ngOnDestroy(): void {
    this.dataSubscription$?.unsubscribe();
  }

}
