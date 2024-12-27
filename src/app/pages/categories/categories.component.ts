import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import { ProductsService } from '../../services/products.service';
import { AuthService } from '../../services/auth.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styles: ``
})
export class CategoriesComponent implements OnDestroy, OnInit{

  productsByCategory:Product[] = [];
  destroy$ = new Subject<void>();
  title: string = "";
  addToCart(productId:number){
    this.authService.addProductToUserCart(productId);
  }

  addToWishList(productId:number){
    this.authService.addToUserWishList(productId);
  }

  getProductsByCategory(){

    this.activatedRoute.params
    .pipe(
      switchMap(({id}) => this.productsService.getProductsByCategory(id)),
      takeUntil(this.destroy$)
      )
    .subscribe(products => {
      this.productsByCategory = products;
      this.title = products[0]?.category;
      
    });
  }

  constructor(private productsService:ProductsService, 
              private authService:AuthService, 
              private activatedRoute:ActivatedRoute){}
  
  ngOnInit(): void {
    
    this.getProductsByCategory();

    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
