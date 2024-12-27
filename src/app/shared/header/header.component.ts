import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../interfaces/product.interface';
import { Router } from '@angular/router';
import { TokenInfo } from '../../interfaces/tokenInfo.interface';
import { AuthService } from '../../services/auth.service';


import { CartProducts } from '../../interfaces/cartProduct.interface';
import { WishListProduct } from '../../interfaces/wishListProduct.interface';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: ``
})
export class HeaderComponent implements OnInit, OnDestroy{

  userCredentials!:TokenInfo | null;
  termino!:string;
  productsSearchResponse:Product[] = [];
  cart?:CartProducts[] = [];
  wishList:WishListProduct[] = [];
  summary!:number;
  theme = localStorage.getItem('color-theme');
  destroy$ = new Subject<void>();

  searchProducts() : void{
    if(this.termino.length===0){return;};
    this.productsService.getProductByTitle(this.termino)
    .pipe(takeUntil(this.destroy$))
    .subscribe(products => {
      this.productsSearchResponse = products;
    });
  }

  logOut(): void{
    localStorage.removeItem('token');
    this.authService.token = null;
    this.userCredentials = null;
    this.authService.userCartSubject.next([]);
    this.authService.userWishListSubject.next([]);
    
  }

  category(cat:number) : void{
    this.productsService.getProductsByCategory(cat);
  }

  scrollToBottom(): void{
    const height = document.body.scrollHeight;
    window.scrollTo({top:height, behavior:'smooth'});
  }

  token = localStorage.getItem('token');

  getCartProducts(){
    if(this.token){
      this.authService.getUserCart();
    this.authService.userCartObservable
    .pipe(takeUntil(this.destroy$))
    .subscribe(cart => {
      this.cart = cart!;
      this.summary = this.getSummary(cart!);
    });
    }
    
  }

  productQuantity(productId:number,quantity:number){
    const cartProduct:CartProducts | undefined = this.cart?.find(p => p.productId === productId);

    if(cartProduct?.quantity! > 10) {
      this.toastr.info("You can add a quantity of 10 or less");
      return;
    }

    if(cartProduct?.discountName === "50OffOneProduct" && cartProduct.quantity === 2 && quantity < 0){
      this.toastr.info("You cannot remove this product because its coupon requires at least two products")
      return;
    }

    this.authService.modifyProductQuantityFromWindow(productId,quantity);
  }

  getSummary(cart:CartProducts[]){
    let summary = 0;
    if(this.cart){

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

        } else if (couponName && couponName.includes('off')){
          
          const discount = cart[i].discount;
          const custom = (productQuantity! * productPrice) * (1 - discount / 100) + shipping!;
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


  loadWishList(){
    if(this.token){
      this.authService.getUserWishList();
      this.authService.userWishListObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe(wishlist => {
        this.wishList = wishlist;
      });
    }
  }

  addToWishList(productId:number){
    this.authService.addToWishListFromWindow(productId);
  }

  removeFromCart(id:number){
    this.authService.removeProductFromCartFromWindow(id);
  }

  darkModeToggle(){
  var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
  var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

  // Change the icons inside the button based on previous settings
  if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      themeToggleLightIcon!.classList.remove('hidden');
  } else {
      themeToggleDarkIcon!.classList.remove('hidden');
  }

  var themeToggleBtn = document.getElementById('theme-toggle');

  themeToggleBtn!.addEventListener('click', function() {

      // toggle icons inside button
      themeToggleDarkIcon!.classList.toggle('hidden');
      themeToggleLightIcon!.classList.toggle('hidden');

      // if set via local storage previously
      if (localStorage.getItem('color-theme')) {
          if (localStorage.getItem('color-theme') === 'light') {
              document.documentElement.classList.add('dark');
              localStorage.setItem('color-theme', 'dark');
          } else {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('color-theme', 'light');
          }

      // if NOT set via local storage previously
      } else {
          if (document.documentElement.classList.contains('dark')) {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('color-theme', 'light');
          } else {
              document.documentElement.classList.add('dark');
              localStorage.setItem('color-theme', 'dark');
          }
      }
      
  });
  }

  showResponses(input:HTMLInputElement,productsList:HTMLUListElement){
    if(input.value.length > 0){
      productsList.classList.remove('hidden');
    } else { 
      productsList.classList.add('hidden');
    }
  }

  getCurrentUserCredentials(){
    if(this.token){
      this.authService.getCurrentUserCredentials()
    .pipe(takeUntil(this.destroy$))
    .subscribe(userCredentials => this.userCredentials = userCredentials);
    }
  }

  toggleDropmenu(ul:HTMLElement){

    const element = ul as HTMLElement;

    if(element.classList.contains('block')){
      element.classList.remove('block');
      element.classList.add('hidden');
    } else {
      element.classList.add('block');
      element.classList.remove('hidden');
    }
  }

  hideAndShowCart(){

    const windows_container = document.getElementById('windows-container');

    if(window.innerWidth < 768) return;
    

    if(windows_container) {

      if(windows_container.classList.contains('hidden')){
        windows_container.classList.remove('hidden');
        windows_container.classList.add('block');
      } else {
        windows_container.classList.remove('block');
        windows_container.classList.add('hidden');
      }

    }
  }

  hideCart(){

    if(window.innerWidth < 768) return;

    const windows_container = document.getElementById('windows-container');

    if(windows_container) windows_container.classList.add('hidden');

  }

  showCart() {
    if(window.innerWidth < 768) return;

    const windows_container = document.getElementById('windows-container');

    if(windows_container) windows_container.classList.remove('hidden');
  }

  checkRedirection(){
    if(window.innerWidth < 768) this.router.navigate(["/alexpress/cart"]);
  }

  checkIfLoggedIn(ul:HTMLElement){
    if(this.userCredentials) 
    ul.classList.remove('hidden');
    
  }

  hideAndShowDropMenu(element:HTMLElement) {
    if(element.classList.contains('hidden')) {
      element.classList.remove('hidden');
      element.classList.add('block');
    } else {
      element.classList.remove('block');
      element.classList.add('hidden');
    }
  }

  constructor(private productsService:ProductsService, 
    private authService:AuthService, 
    private toastr:ToastrService,
    private router:Router){}

  ngOnInit(): void {
    this.getCartProducts();
    this.loadWishList();
    this.darkModeToggle();
    this.getCurrentUserCredentials();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
