import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../interfaces/product.interface';
import { AuthService } from '../../services/auth.service';
import { TokenInfo } from '../../interfaces/tokenInfo.interface';
import { Subject, takeUntil } from 'rxjs';
import { LocationStrategy } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styles: 
  `
  .css-layout {
    max-width: 256px;
    width: 160px;
  }

  @media (min-width:410px){
    .css-layout {
      width: 180px;
    }
  }

  @media (min-width:500px){
    .css-layout {
      width:220px;
    }
  }

  @media (min-width:610px){
    .css-layout {
      width:260px;
    }
  }

  @media (min-width:768px){
    .css-layout {
      width: 235px;
    }
  }

  @media (min-width:1024px){
    .css-layout {
      width: 235px;
    }
  }

  `
})
export class ProductsComponent implements OnInit, OnDestroy{

  @Input() title?:string = "All products";
  @Input() products:Product[] = [];
  
  userCredentials!:TokenInfo; 
  rating:number = 0;
  isRated:boolean = false;
  token = localStorage.getItem('token');
  destroy$ = new Subject<void>();

  rateProduct(value:number){
    this.rating = value;
    this.isRated = true;
  }

  addToCart(productId:number){
    
    this.authService.addProductToUserCart(productId);
    
  }

  addToWishList(productId:number){
    this.authService.addToUserWishList(productId);
  }

  sortingPrice :boolean | null= null;
  sortingRating:boolean | null= null;  
  sortingOrders:boolean | null= null;
  
  calculateStarRating(product:Product){
    return product.accumulated / product.votes;
  }
  
  deleteProductAdmin(productId:number, pos:number){
    this.authService.removeFromMyProducts(productId);
    this.products.splice(pos, 1);
  }

  getCurrentUserCredentials(){
    if(this.token){
      this.authService.getCurrentUserCredentials()
    .pipe(takeUntil(this.destroy$))
    .subscribe(credentials => this.userCredentials = credentials);
    }
  }

  orderBy(value:string){
    switch (value){

      case 'none': 
        this.products.sort((a,b) => a.id - b.id);
      break;
      
      case 'price' :
      this.sortingPrice = !this.sortingPrice;
      (this.sortingPrice) ? this.products.sort((a,b) => b.price - a.price)
        : this.products.sort((a,b) => a.price - b.price);
      break;

      case 'rating': 
      this.sortingRating = !this.sortingRating;
      (this.sortingRating) ? this.products.sort((a,b) => b.accumulated - a.accumulated)
        : this.products.sort((a,b) => a.accumulated - b.accumulated);
      break;

      case 'orders':
        this.sortingOrders = !this.sortingOrders;
        (this.sortingOrders) ? this.products.sort((a,b) => b.sold - a.sold)
        : this.products.sort((a,b) => a.sold - b.sold);
      break;
    }
  }

  constructor(private productsService:ProductsService, 
              private authService:AuthService,
              public locationStrategy:LocationStrategy,
              private router:Router){}

  ngOnInit(): void {
    const productsHome = "/alexpress/home";
    const products = "/alexpress/products";
    const product = "/alexpress/product/";
    const wishlist = "/alexpress/wish_list";
    if(this.locationStrategy.path().includes(productsHome) 
    || this.locationStrategy.path().includes(products)
    || this.router.url.includes(product)
    || this.locationStrategy.path().includes(wishlist)){
      this.productsService.loadProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
      this.products = products;
      });
    }
    this.getCurrentUserCredentials();
  };
  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
