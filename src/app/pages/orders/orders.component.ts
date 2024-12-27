import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../interfaces/orders.interface';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { handleBackendErrorResponse } from '../../../error-handler';
import { NgxSpinnerService } from 'ngx-spinner';

interface ReviewModel {
  orderId:number,
  content:string,
  rating:number
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styles: `
  `
})
export class OrdersComponent implements AfterViewInit, OnDestroy{

  orders:Order[] = []
  isVisible:boolean = false;
  rating:number = 0;
  hoverRating:number = 0;
  textareaLength:number = 0;
  destroy$ = new Subject<void>();

  setTextAreaLength(textarea:HTMLTextAreaElement, limitCounter:HTMLSpanElement){
    this.textareaLength = textarea.value.trim().length;
    
    if(textarea.value.trim().length > 150){
      limitCounter.classList.add('text-red-600');
    } else {
      limitCounter.classList.remove('text-red-600');
    }
  }

  getOrders():void {
    this.authService.getUserOrders()
    .pipe(takeUntil(this.destroy$))
    .subscribe(orders => {
      this.orders = orders;
    });
  }

  rateProduct(value: number) {
    this.rating = value;
  }
  
  mouseHover(value: number) {
    this.hoverRating = value;
  }

  

  onSubmit(textarea:HTMLTextAreaElement, orderId:number){

    if(this.rating === 0){
      this.toastr.warning("You forgot to select a rating");
      return;
    }

    if(textarea.value.trim().length < 50){
      this.toastr.warning("Please, type at least 50 characters in your review");
      return;
    }

    if(textarea.value.trim().length > 150){
      this.toastr.error("You exceeded the review limit");
      return;
    }

    const model:ReviewModel = {
      content : textarea.value.trim(),
      orderId : orderId,
      rating  : this.rating
    }


    this.authService.submitOrderReview(model)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (suc:any) => {
        this.toastr.success(suc.message);
        this.getOrders();
        this.isVisible = false;
      },
      error: err => handleBackendErrorResponse(err, this.toastr)
    })

  }

  alreadyVoted(order:Order):boolean{
    if(order.reviewContainerDto){
      return true;
    }
    return false;
  }
  
  OnRateOrder(){
    this.isVisible = true;
  }

  OnCancelRate(){
    this.isVisible = false;
    this.rating = 0;
  }

  getDiscount(price:number,couponName:string,discountValue:number){

    let discount = 0;

    if(couponName && couponName==="50OffOneProduct"){
      discount = price * 0.5;
    } else if (couponName && couponName.includes('%')){
      discount =  price * (1 - discountValue / 100);
    }

    return discount;
  }

  constructor(private authService:AuthService, private toastr:ToastrService, private spinner:NgxSpinnerService){}

  ngAfterViewInit(): void {
    this.getOrders();
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
