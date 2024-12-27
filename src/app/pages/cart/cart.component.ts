import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartProducts } from '../../interfaces/cartProduct.interface';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styles: ``
})
export class CartComponent implements OnInit, OnDestroy{

  cartProducts:CartProducts[] = [];
  summary!:number;
  destroy$ = new Subject<void>();
  token = localStorage.getItem('token');

  getUserCart(){
    this.authService.userCartObservable.pipe(takeUntil(this.destroy$))
    .subscribe(cart => {
      this.cartProducts = cart!;
      this.getSummary(cart!)
      .then(summary => this.summary = summary);
    });
  }

  async getSummary(cart:CartProducts[]):Promise<number>{
    let summary = 0;
    if(this.cartProducts){

      for (let i = 0; i < cart.length; i++) {

        const couponName = cart[i].discountName, 
        shipping = cart[i].product?.shippingPrice,
        productQuantity = cart[i].quantity,
        productPrice = cart[i].product!.price;

        if(couponName && couponName==="50OffOneProduct"){
          const off50 = ((productQuantity! - 1) * productPrice) + shipping! + (productPrice * 0.5);
          summary +=off50;
        } else if (couponName && couponName==="FreeShipping"){
          const freeshipping = (productQuantity! * productPrice);
          summary += freeshipping;
        } else if (couponName && couponName.includes('%')){
          const discount = cart[i].discount;
          const custom = ((productQuantity! * productPrice) * (1 - discount / 100)) + shipping!;
          summary += custom;
        } else {
          const noDiscount = (productQuantity! * productPrice) + shipping!;
          summary += noDiscount;
        }
      
        summary;
      }
    }
    
    return summary;
  }

  deleteCartProduct(id:number){
    this.authService.removeFromCart(id);
  }

  productQuantity(productId:number, quantity:number){
    const product:CartProducts = this.cartProducts.find(p => p.productId === productId)!;

    if(product.discountName === "50OffOneProduct" && product.quantity===2 && quantity<0){
      this.toastr.info("The coupon of this product requires 2 or more.","Cannot decrease quantity");
      return;
    }
    this.authService.modifyProductQuantity(productId,quantity);
  }

  addToWishList(productId:number){
    this.authService.addToUserWishList(productId);
  }

  constructor(private authService:AuthService,
              private toastr:ToastrService
  ){}

  ngOnInit(): void {
    this.authService.getUserCart();
    this.getUserCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
