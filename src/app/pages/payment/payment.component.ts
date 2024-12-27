import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartProducts } from '../../interfaces/cartProduct.interface';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import {
  IPayPalConfig,
  ICreateOrderRequest
} from 'ngx-paypal';


import { ToastrService } from 'ngx-toastr';
import { OrderedProduct, OrderModel } from '../../interfaces/orderModel.interface';
import { Router } from '@angular/router';
import { Address } from '../../interfaces/orders.interface';
import { TokenInfo } from '../../interfaces/tokenInfo.interface';
import { Subject, takeUntil } from 'rxjs';
import { handleBackendErrorResponse } from '../../../error-handler';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styles: ``
})
export class PaymentComponent implements AfterViewInit, OnInit, OnDestroy{

  next:boolean = false;
  addresses:Address[] = [];
  userCart:CartProducts[] = [];
  summary:number = 0;
  theme = localStorage.getItem('color-theme');
  payPalConfig ? : IPayPalConfig;
  showSuccess:boolean = false;
  showCancel :boolean = false;
  showError  :boolean = false;
  destroy$ = new Subject<void>();
  userCredentials!:TokenInfo;
  isLoading:boolean = false;
  paymentDone:boolean = false;

  orderModel:OrderModel = {
    paypalTransactionId: '',
    createdOn: '',
    orderedProducts: [],
    summary: 0,
    addressId: 0
  }

  

  paymentForm:FormGroup = this.fb.group({
    fullName   : [null, [Validators.required, Validators.maxLength(40)]],
    phone      : [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), this.validatePhone()]],
    postalCode : [null, [Validators.required, Validators.maxLength(10)]],
    residence  : [null, [Validators.required, Validators.maxLength(60)]],
    country    : [null, [Validators.required, Validators.maxLength(15)]],
    city       : [null, [Validators.required, Validators.maxLength(25)]]
  });

  orderId:number = 0;

  validatePhone():ValidatorFn {
    return (control:AbstractControl):ValidationErrors | null => {
      
      const phone = control.value as string;

      if(!phone) return null;

      let isValid : boolean = true;

      for (let i = 0; i < phone.length; i++) {

        const character = phone[i];
        const characterNumber = parseInt(character);

        if(isNaN(characterNumber)){

          isValid = false;
          break;

        }
      }

      return (isValid) ? null : { phoneError:true }

    }
  }

  sendShippingAddress(paypalId?:string,create_time?:string){
    
    if(this.selectedAddress){
      
      this.orderModel.createdOn = create_time!;
      this.orderModel.addressId = this.addressId!;
      this.orderModel.paypalTransactionId = paypalId!;
      this.orderModel.summary = this.summary;
      this.getCartProducts(this.userCart);

      this.authService.createUserOrder(this.orderModel)
      .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (succ:any) => {

          this.paymentDone = true;

          this.authService.sendSummaryEmail(succ.orderId,this.userCredentials.email)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (suc:any) => {
              this.toastr.success(suc.message);
              this.authService.userCartSubject.next([]);
              
            },
            error: (err:any) => {
              handleBackendErrorResponse(err, this.toastr)
            }
          });

          this.toastr.success(succ.message, "Done");
        },
        error: err => handleBackendErrorResponse(err, this.toastr)
      });

    } else {

      if(!this.paymentForm.valid){
        this.toastr.error("You forgot some fields");
        this.paymentForm.markAllAsTouched();
        return;
      }

      this.authService.createAddress(this.paymentForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (succ:any) => {
  
          const addressId = succ.addedAddress;
  
          //Set model values
          this.orderModel.createdOn = create_time!;
          this.orderModel.paypalTransactionId = paypalId!;
          this.orderModel.summary = this.summary;
          this.orderModel.addressId = addressId;
          this.getCartProducts(this.userCart);

          this.authService.createUserOrder(this.orderModel)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (succ:any) => {
              this.paymentDone = true;
              this.authService.sendSummaryEmail(succ.orderId,this.userCredentials.email)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (suc:any) => {
                  this.toastr.success(suc.message);
                  this.authService.userCartSubject.next([]);
                  
                },
                error: err => handleBackendErrorResponse(err, this.toastr)
              });
              this.toastr.success(succ.message, "Done")
              this.authService.userCartSubject.next([]);
              
            },
            error: err => handleBackendErrorResponse(err, this.toastr)
          });
        },
        error: err => handleBackendErrorResponse(err, this.toastr)
      });

    }
    

  }

  validateField(controlName:string){
    
    const formControl = this.paymentForm.get(controlName);
    if(this.theme==='light') {
      return (formControl?.touched && !formControl.valid)?'border-red-600':'border-black';
    } else {
      return (formControl?.touched && !formControl.valid)?'dark:border-red-600':'border-cyan-300';
    }
    
  }
  
  productQuantity(productId:number,quantity:number){
    this.authService.modifyProductQuantity(productId,quantity);
  }

  orderedProducts:OrderedProduct[] = [];

  getUserCart(){
    this.authService.userCartObservable
    .pipe(takeUntil(this.destroy$))
    .subscribe(cart => {
      this.userCart = cart!;
      this.getSummary(cart!)
      .then(summary => this.summary = summary);
      this.cdr.detectChanges();
    });
  }

  getCartProducts(cart:CartProducts[]){

    cart.forEach(cart => {

      let product:OrderedProduct = {
        couponName: '',
        discountValue: 0,
        imageUrl: '',
        price: 0,
        shippingPrice: 0,
        productId: 0,
        quantity: 0
      }
      
      product.couponName = cart.discountName;
      product.discountValue = cart.discount;
      product.imageUrl = cart.product?.image!;
      product.price = cart.product?.price!;
      product.shippingPrice = cart.product?.shippingPrice!;
      product.quantity = cart.quantity!;
      product.productId = cart.productId!;

      this.orderedProducts.push(product);
    });
    this.orderModel.orderedProducts = this.orderedProducts;

    
    
  }

  async getSummary(cart:CartProducts[]):Promise<number>{

    let summary = 0;
    if(this.userCart){

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

  getUserAddresses(){
    this.authService.getUserAddresses()
    .pipe(takeUntil(this.destroy$))
    .subscribe(addresses => {
      this.addresses = addresses;
    });
  }


  addressId:number | null = null;
  selectedAddress:boolean = false;

  onSelectedAddress(addressId:number, reference:HTMLDivElement, arrowIcon:HTMLDivElement){
    if(this.selectedAddress){
      return;
    }
    if(this.userCart.length === 0){
      this.router.navigate(['/alexpress/home']);
      this.toastr.info("No products in cart");
      return;
    }
    //Add done decoration using DOM
    const element = reference as HTMLElement;
    const divContainer = arrowIcon as HTMLElement;
    const i = document.createElement('i');
    i.classList.add('fa-solid', 'fa-check', 'px-1', 'bg-cyan-300', 'text-black','border-2','border-cyan-500', 'rounded-full');
    divContainer.appendChild(i);
    element.classList.add('bg-cyan-300');

    //Logic
    this.addressId = addressId;
    this.selectedAddress = true;
    this.paymentForm.reset();
  }

  private initConfig(): void {
    this.payPalConfig = {
      
        currency: 'USD',
        clientId: environment.clientId,
        createOrderOnClient: (data) =>  < ICreateOrderRequest > {

          application_context: {
            shipping_preference: 'NO_SHIPPING'
          },
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: this.summary.toFixed(2),
                  }
            }]
        },
        advanced: {
            commit: 'true',
            extraQueryParams: [{
              name: "disable-funding",
              value: "credit,card"
            }]
        },
        style: {
            label: 'paypal',
            tagline: false,
            layout: 'horizontal'
        },
        onApprove: (data, actions) => {
        
          actions.order.get().then((details:any) => {
            const paypalId = details.id;
            const create_time = details.create_time;
              this.sendShippingAddress(paypalId, create_time);
          });

        },
        onCancel: (data, actions) => {
            this.toastr.info("Payment proccess not completed");
            this.showCancel = true;
        },
        onError: err => {
            this.toastr.error(err || "There was an error", "Error");
            this.showError = true;
        },
        onClick: (data, actions) => {
          
          this.resetStatus();
          
        }
    };
  }

  resetStatus():void {
    this.showCancel = false;
    this.showSuccess = false;
    this.showError = false;
  }

  getCurrentUserCredentials(){
    this.authService.getCurrentUserCredentials()
    .pipe(takeUntil(this.destroy$))
    .subscribe(credentials => this.userCredentials = credentials);
  }

  constructor(private authService:AuthService, 
              private fb:FormBuilder, 
              private toastr:ToastrService,
              private router:Router,
              private cdr:ChangeDetectorRef){}

  ngAfterViewInit(): void {
    this.getUserCart();
    this.getUserAddresses();

  }

  ngOnInit(): void {
    this.getCurrentUserCredentials();
    this.initConfig();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
