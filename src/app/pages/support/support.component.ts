import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { TokenInfo } from '../../interfaces/tokenInfo.interface';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { handleBackendErrorResponse } from '../../../error-handler';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styles: ``
})
export class SupportComponent implements OnDestroy, AfterViewInit{

  textareaValue:number = 0;
  userCredentials!:TokenInfo;
  dataSubscription$:Subscription | undefined;
  token = localStorage.getItem('token');
  
  setLength(textarea:HTMLTextAreaElement, span:HTMLSpanElement){
    this.textareaValue = textarea.value.length;
    if(this.textareaValue > 200){
      span.classList.add('text-red-600');
    } else span.classList.remove('text-red-600');
  }

  getCurrentUserCredentials(){
   if(this.token){
    this.dataSubscription$ = this.authService.getCurrentUserCredentials()
   .subscribe(credentials => this.userCredentials = credentials);
   }
  }

  requestSupport(textarea:HTMLTextAreaElement){
    if(textarea.value.length < 30 || textarea.value.length > 200){
      this.toastr.info("Please, type within 30 and 200 characters in your help request");
      return;
    }
    if(!this.token){
      this.toastr.info("Log in to do this action");
      return;
    }

    this.dataSubscription$ = this.authService
    .sendSupportEmail(this.userCredentials.email, this.userCredentials.username,textarea.value)!
    .subscribe({
      next: (suc:any) => {
        this.toastr.success(suc.message);

        textarea.value = "";
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

  constructor(private toastr:ToastrService, private authService:AuthService){}

  ngOnDestroy(): void {
    this.dataSubscription$?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getCurrentUserCredentials();
  }

}
