import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../interfaces/product.interface';
import { ProductsService } from '../../services/products.service';
import { finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { handleBackendErrorResponse } from '../../../error-handler';
import { NgxSpinnerService } from 'ngx-spinner';



@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styles: ``
})
export class ProductComponent implements OnInit, OnDestroy{


  quantity:number = 1;
  description:boolean = true;
  comments:boolean = false;
  product!:Product;
  destroy$ = new Subject<void>();

  isFreeShippingSelected:boolean | null = null;
  isBuy2Selected        :boolean | null = null;
  isCustomSelected      :boolean | null = null;

  addQuantity(num:number){
    this.quantity = this.quantity - num;
    if(this.quantity === 0){
      this.quantity = 1;
    }
    if(this.quantity === 1){
      this.isBuy2Selected = null;
    }
  }

  descriptionClick(){
    this.description = true;
    this.comments = false
  }

  commentsClick(){
    this.description = false;
    this.comments = true;
  }

  addToWishlist(productId:number){
    this.authService.addToUserWishList(productId);
  }

  addToUserCart(id:number){
    if(this.quantity <= 0){
      return;
    }
    this.authService.addProductToUserCart(id, this.quantity, this.coupon);
  }

  


  coupon?:string;

  selectedCoupon(reference:string){
    if(reference==="FreeShipping") {
      if(this.isFreeShippingSelected){
        this.isFreeShippingSelected = null;
        this.isCustomSelected = null;
        this.isBuy2Selected = null;
        this.coupon = "";
      } else {
        this.coupon = "FreeShipping";
        this.isBuy2Selected = false;
        this.isCustomSelected = false;
        this.isFreeShippingSelected = true;
      }
      
    } else
    if(reference==="50OffOneProduct") {
      if(this.quantity<2){
        this.toastr.info('You must add 2 or more products to use this coupon', 'Coupon info');
        return;
      }
      if(this.isBuy2Selected){
      this.isFreeShippingSelected = null;
      this.isCustomSelected = null;
      this.isBuy2Selected = null;
      this.coupon = undefined;
      } else {
      this.coupon = "50OffOneProduct";
      this.isFreeShippingSelected = false;
      this.isCustomSelected = false;
      this.isBuy2Selected = true;
      }
      
    } else {
      if(this.isCustomSelected){
        this.isFreeShippingSelected = null;
        this.isCustomSelected = null;
        this.isBuy2Selected = null;
        this.coupon = undefined;
      } else {
      this.coupon = this.product.coupon.discount.toString();
      this.isFreeShippingSelected = false;
      this.isBuy2Selected = false;
      this.isCustomSelected = true;
      }
      
    }

  }

  couponExists:boolean | null = null;

  verifyExistingCouponInCart(){
    this.authService.userCartObservable
    .pipe(takeUntil(this.destroy$))
    .subscribe(cart => {
      if(cart){
        const productCouponInCart = cart.some(p => p.productId === this.product.id && p.discountName);
      if(productCouponInCart) {
        this.couponExists = true;
      } else {
        this.couponExists = null;
        this.isBuy2Selected = null;
        this.isCustomSelected = null;
        this.isFreeShippingSelected = null;
        this.coupon=undefined;
      }
      }
    });
  }

  

  calculateStarRating(product:Product){
    return product.accumulated / product.votes;
  }

  constructor(private activatedRoute:ActivatedRoute, 
              private productsService:ProductsService, 
              private authService:AuthService,
              private toastr:ToastrService,
              private spinnerService:NgxSpinnerService){}

  ngOnInit(): void {
    this.spinnerService.show();
    this.activatedRoute.params.pipe(switchMap(({id}) => this.productsService.loadProductById(id)))
    .pipe(takeUntil(this.destroy$), finalize(() => this.spinnerService.hide()))
    .subscribe({
      next: product => {
        this.product = product;
        this.verifyExistingCouponInCart();
      },
      error: err => {
        handleBackendErrorResponse(err,this.toastr);
        console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
