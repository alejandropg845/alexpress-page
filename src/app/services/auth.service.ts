import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, finalize, firstValueFrom, Observable, Subject, takeUntil, tap } from 'rxjs';
import { UserCredentials } from '../interfaces/userCredentials.interface';
import { TokenInfo } from '../interfaces/tokenInfo.interface';
import { CartProducts } from '../interfaces/cartProduct.interface';
import { WishListProduct } from '../interfaces/wishListProduct.interface';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../interfaces/product.interface';
import { Router } from '@angular/router';
import { CartComponent } from '../pages/cart/cart.component';
import { OrderModel } from '../interfaces/orderModel.interface';
import { Address, Order } from '../interfaces/orders.interface';
import { LocationStrategy } from '@angular/common';
import { handleBackendErrorResponse } from '../../error-handler';
import { SafetyService } from './safety.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy{

  destroy$ = new Subject<void>();

  get getToken(){
    return localStorage.getItem('token');
  }


  url:string = environment.url+"/user/login";
  urlUSer:string = environment.url+"/user"
  urlRegister:string = environment.url+"/user/register";
  urlUserCart:string = environment.url+"/user/cart/";
  urlWishList:string = environment.url+"/user/wishlist/";
  urlUserProducts:string = environment.url+"/products/my_products/";
  urlUserProduct:string = environment.url+"/products/";
  urlUserAddresses:string = environment.url+"/addresses";
  urlUserOrder:string = environment.url+"/orders";
  urlUserReviews:string = environment.url+"/reviews";
  urlSendEmail:string = environment.url+"/email";
  token = localStorage.getItem('token');
  interactingFromWindow:boolean = false;

  register(data:{username:string, email:string, password:string}):Observable<UserCredentials>{
    return this.http.post<UserCredentials>(this.urlRegister, data);
  }

  logIn(data:FormGroup):Observable<UserCredentials>{
    return this.http.post<UserCredentials>(this.url,data).pipe(
      tap(userResponse => {
        if(userResponse.ok){
          localStorage.setItem('token', userResponse.token);
        }
      })
    );
  }

  userWishListSubject = new BehaviorSubject<WishListProduct[]>([]);
  userWishListObservable = this.userWishListSubject.asObservable();

  getUserWishList(){
    this.http.get<WishListProduct[]>(this.urlWishList)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: wishlist => {
        this.userWishListSubject.next(wishlist);
      },
    });
  }

  submitOrderReview(ReviewModel:any){
    return this.http.post(this.urlUserReviews, ReviewModel);
  }

  addToUserWishList(productId:number){
    if(!this.token){
      this.toastr.info("Log in to do this action first");
      return;
    }
    this.http.post(this.urlWishList+productId,{})
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success:any) => {
        this.toastr.success(success.message,"Great");
        this.getUserWishList();
      },
      error: (error:HttpErrorResponse) => {
        if(error.status === 401){
          this.toastr.error("User is not logged in");
          return;
        }
        handleBackendErrorResponse(error, this.toastr)
      }
    })
  }

  updateUserProduct(productId:number, form:FormGroup){

    this.safetyService.showSafety();

    this.http.put(this.urlUserProduct+productId,form)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success:any) => {
        this.toastr.success(success.message, "Product updated");
        this.router.navigateByUrl("/alexpress/my_products");
        this.getUserProducts();
        this.safetyService.hideSafety();
      },
      error: (error:any) => {
        this.safetyService.hideSafety();
        handleBackendErrorResponse(error, this.toastr);
      }
    });
  }

  getCurrentUserCredentials():Observable<TokenInfo>{
    return this.http.get<TokenInfo>(this.urlUSer);
  }

  removeFromUserWishList(id:number){
  this.http.delete(this.urlWishList+id)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (res:any) => {
      this.toastr.success(res.message, "Done");
      this.getUserWishList();
    },
    error: err => handleBackendErrorResponse(err, this.toastr)
  });
  }

  userCartSubject = new BehaviorSubject<CartProducts[]>([]);
  userCartObservable = this.userCartSubject.asObservable();
  getUserCart(){
    this.http.get<CartProducts[]>(this.urlUserCart)
    .pipe(takeUntil(this.destroy$))
    .subscribe(userCart => {
      this.userCartSubject.next(userCart);
    });
  }

  addingToCartProcesses = new Set<number>;

  addProductToUserCart(productId:number, quantity?:number, discount?:string){

    if(this.addingToCartProcesses.has(productId)) return;

    this.addingToCartProcesses.add(productId);

    if(!this.token){
      this.toastr.info("Log in to do this action first");
      return;
    }
    
    let request;

    //The user is adding product from product preview and no coupons
    if(quantity && !discount) {
      request = this.http.post(this.urlUserCart+productId+"?quantity="+quantity,{});
    } else
    //The user is adding product from products section
    if(!quantity) {
      request = this.http.post(this.urlUserCart+productId,{});
    } else
    //The user selects a discount coupon
    if(quantity && discount) {
      request = this.http.post(this.urlUserCart+productId+"?quantity="+quantity+"&discountName="+discount,{});
    }
    

    request!.pipe(takeUntil(this.destroy$), 
    finalize(() => this.addingToCartProcesses
    .delete(productId))).subscribe({
      next: (success:any) => {
        this.toastr.success(success.message, "Done");
        this.getUserCart();
      },
      error: (error:HttpErrorResponse) => {
        if(error.status === 401){
          this.toastr.error("User is not logged in");
          return;
        }
        handleBackendErrorResponse(error, this.toastr);
      }
    });
  }

  modifyProcesses = new Set<number>;

  modifyProductQuantity(productId:number, quantity?:number){

    if(this.modifyProcesses.has(productId)) return;

    this.modifyProcesses.add(productId);

    this.http.post(this.urlUserCart+productId+"?quantity="+quantity,{})
    .pipe(takeUntil(this.destroy$),
    finalize(() => this.modifyProcesses.delete(productId)))
    .subscribe({
      next: suc => this.getUserCart(),
      error: err => handleBackendErrorResponse(err, this.toastr)
    });
  }

  verifyCart(){
    this.http.get<CartProducts[]>(this.urlUserCart)
    .pipe(takeUntil(this.destroy$))
    .subscribe(cart => {
      if(cart.length === 0){
        this.router.navigateByUrl("/alexpress/home");
      }
    });
  }

  removeFromCart(id:number){
    this.http.delete(this.urlUserCart+id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success:any) => {
        this.toastr.success(success.message,"Done");
        this.getUserCart();
        if(this.locationStrategy.path()==='/alexpress/payment'){
          this.verifyCart();
        }
      },
      error: err => handleBackendErrorResponse(err, this.toastr)
    })
  }

  

  userProductsSubject = new BehaviorSubject<Product[]>([]);
  userProductsObservable = this.userProductsSubject.asObservable();

  getUserProducts(){
    this.http.get<Product[]>(this.urlUserProducts)
    .pipe(takeUntil(this.destroy$))
    .subscribe(userProducts => {
      this.userProductsSubject.next(userProducts);
    });
  }

  removeFromMyProducts(productId:number){
    this.http.delete(this.urlUserProduct+productId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success:any) => {
        this.toastr.success(success.message,"Done");
        this.getUserProducts();
      },
      error: err => handleBackendErrorResponse(err, this.toastr)
    });
  }

  createAddress(form:FormGroup){
    return this.http.post(this.urlUserAddresses, form.value);
  }
  
  createUserOrder(model:OrderModel){
    return this.http.post(this.urlUserOrder,model);
  }

  getUserOrders():Observable<Order[]>{
    return this.http.get<Order[]>(this.urlUserOrder);
  }

  getUserAddresses():Observable<Address[]> {
    return this.http.get<Address[]>(this.urlUserAddresses);
  }

  editAddress(id:number, form:FormGroup){
    return this.http.put<Address>(this.urlUserAddresses+"/"+id, form.value);
  }

  sendSummaryEmail(orderId:number, email:string){

    const emailDto = {
      orderId,
      to : email
    }
    
    return this.http.post(this.urlSendEmail, emailDto);
    
  }

  sendSupportEmail(email:string, username:string, content:string){


    if(!this.token){
      this.toastr.info("You must be logged in to do this action");
      return;
    }

    const support = {
      email,
      username,
      content
    }
    

    return this.http.post(this.urlSendEmail+"/support", support);
    
  }

  getAllUsers():Observable<{username:string,id:number}[]>{
    return this.http.get<{username:string,id:number}[]>(`${this.urlUSer}/getAllUsers`);
  }

  /* Evitar que el window se cierre por lo que agregamos métodos exclusivos del cart window.
  El usuario no puede especificar quantity, por lo que no enviamos. Siempre puede añadir de 1 en 1. 
  */

  modifyProductQuantityFromWindow(productId:number, quantity:number) {

    this.interactingFromWindow = true;

    if(this.modifyProcesses.has(productId)) return;

    this.modifyProcesses.add(productId);

    this.http.post(this.urlUserCart+productId+'?quantity='+quantity,{})
    .pipe(takeUntil(this.destroy$),
    finalize(() => this.modifyProcesses.delete(productId)))
    .subscribe({
      next: suc => this.getUserCart(),
      error: err => handleBackendErrorResponse(err, this.toastr)
    });

  }

  removeProductFromCartFromWindow(id:number){

    this.interactingFromWindow = true;

    this.http.delete(this.urlUserCart+id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success:any) => {
        this.toastr.success(success.message,"Done");
        this.getUserCart();
        if(this.locationStrategy.path()==='/alexpress/payment'){
          this.verifyCart();
        }
      },
      error: err => handleBackendErrorResponse(err, this.toastr)
    })
  }

  addToWishListFromWindow(productId:number){

    this.interactingFromWindow = true;


    if(!this.token){
      this.toastr.info("Log in to do this action first");
      return;
    }
    this.http.post(this.urlWishList+productId,{})
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success:any) => {
        this.toastr.success(success.message,"Great");
        this.getUserWishList();
      },
      error: (error:HttpErrorResponse) => {
        if(error.status === 401){
          this.toastr.error("User is not logged in");
          return;
        }
        handleBackendErrorResponse(error, this.toastr)
      }
    });
  }

  constructor(private http:HttpClient, 
    private toastr:ToastrService, 
    private router:Router, 
    private locationStrategy:LocationStrategy,
    private safetyService:SafetyService) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
