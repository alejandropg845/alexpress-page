import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../interfaces/product.interface';
import { AuthService } from '../../services/auth.service';
import { finalize, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit, OnDestroy{

  dataSubscription$:Subscription | undefined;

  allProducts       :Product[] = [];
  lessFourProducts  :Product[] = [];
  newProducts       :Product[] = [];
  fewUnits          :Product[] = [];

  loadProductsFromService(){
    this.spinnerService.show();
    this.dataSubscription$ = this.productsService.loadProducts()
    .pipe(finalize(() => this.spinnerService.hide())).subscribe(products => {
      this.allProducts = products;
      this.fewUnits = products.filter(p => p.quantity < 10);
      this.lessFourProducts = products.filter(p => p.price <= 3.99).splice(0,4);
      this.newProducts = products.sort((a,b) => b.id! - a.id!).splice(0,4);
    });
  };

  constructor(private productsService:ProductsService, private spinnerService:NgxSpinnerService){}

  ngOnInit(): void {
    this.loadProductsFromService();
  }

  ngOnDestroy(): void {
    this.dataSubscription$?.unsubscribe();
  }
}
