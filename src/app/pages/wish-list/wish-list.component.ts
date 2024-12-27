import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { WishListProduct } from '../../interfaces/wishListProduct.interface';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wish-list',
  templateUrl: './wish-list.component.html',
  styles: ``
})
export class WishListComponent implements OnInit, OnDestroy{

  userWishList:WishListProduct[] = [];
  dataSubscription$:Subscription | undefined;

  addToCart(productId:number){
    this.authService.addProductToUserCart(productId);
  }

  removeFromWishlist(id:number){
    this.authService.removeFromUserWishList(id);
  }

  loadWishlist(){
    this.dataSubscription$ = this.authService.userWishListObservable
    .subscribe(wishlist => {
      this.userWishList = wishlist;
    });
  }
  
  constructor(private authService:AuthService, private toastr:ToastrService){}

  ngOnInit(): void {
    this.authService.getUserWishList();
    this.loadWishlist();
  }

  ngOnDestroy(): void {
    this.dataSubscription$?.unsubscribe();
  }

}
