import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Subscription, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { handleBackendErrorResponse } from '../../../error-handler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent implements OnDestroy{

  form:FormGroup = this.fb.group({
    email:[null,[Validators.required]],
    password:[null,[Validators.required]]
  });

  theme = localStorage.getItem('color-theme');
  dataSubscription:Subscription | undefined;
  isLoading:boolean = false;

  logIn(){
    if(!this.form.valid){
      this.toastr.error("Fill all fields to log in", "Error");
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;

    this.dataSubscription = this.authService.logIn(this.form.value)
    .subscribe({
      next: resp =>{
        this.isLoading = false;
        this.authService.token = resp.token;
        this.router.navigateByUrl("/alexpress/home");
      },
      error: err => {
        handleBackendErrorResponse(err, this.toastr);
        this.isLoading = false;
      }
    });
  }

  validateField(field:string){
    if(this.theme === 'light'){
      return (this.form.get(field)?.touched && !this.form.get(field)?.valid) ? 'border-2 border-red-500' : 'border-black';
    } else {
      return (this.form.get(field)?.touched && !this.form.get(field)?.valid) ? 'dark:border-2 border-red-500' : 'border-black';
    }
  }

  isVisible:boolean = false;

  showPass(){
    this.isVisible = !this.isVisible;
  }

  randomizedAccount() {
    let username = '';
    const characters = "ABCDEFGHIJKLMNOPQRSTVWXYZabcdefghiklmnopqrstvwxyz123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < 5; i++) {
        username += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    // Generar email
    const emailDomain = ["example.com", "test.com", "mail.com"];
    const randomDomain = emailDomain[Math.floor(Math.random() * emailDomain.length)];
    const email = `${username}${Math.floor(Math.random() * 100)}@${randomDomain}`;

    // Generar contraseña
    let password = '';
    const passwordLength = 8;
    for (let i = 0; i < passwordLength; i++) {
        password += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    const credentials = {
      username, email, password
    };

    this.dataSubscription = this.authService.register(credentials)
    .pipe(
      tap( user => {
        if(user.ok){
          localStorage.setItem('token', user.token);
          this.router.navigateByUrl("/alexpress/home");
        }
      })
    )
    .subscribe({
      next: (resp:any) => {
        this.toastr.success("Registered succesfully");
        this.authService.token = resp.token;
      },
      error: err =>{
        handleBackendErrorResponse(err, this.toastr)
      }
    });
    

  }

  constructor(private fb:FormBuilder, private authService:AuthService, private toastr:ToastrService, private router:Router, private activatedRoute:ActivatedRoute){}
  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }


}
