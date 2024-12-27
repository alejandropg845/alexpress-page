import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(private spinner:NgxSpinnerService, private router:Router, private authService:AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let clonedRequest = req;
    if(req.url.startsWith(environment.url)){
      if (localStorage.getItem('token')) {

        if(!this.authService.interactingFromWindow) {
          if(!this.router.url.includes("add") || this.router.url.includes("my_products")){
            this.spinner.show();
          }
        }

        clonedRequest = req.clone({
          setHeaders: {
            Authorization: `bearer ${localStorage.getItem('token')}`
          }
        });
      }
    }
    return next.handle(clonedRequest).pipe(
      catchError((error:HttpErrorResponse) => {
        if(error.status === 401){
          localStorage.removeItem('token');
          this.router.navigate(["auth/login"]);
        }
          
        return throwError(() => error);
      }),
      finalize(() => {
        this.spinner.hide();
        this.authService.interactingFromWindow = false;
      }));
  }
}
