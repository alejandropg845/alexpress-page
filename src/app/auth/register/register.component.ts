import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Subscription, tap } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { handleBackendErrorResponse } from '../../../error-handler';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: ``
})
export class RegisterComponent implements OnDestroy{

  emailValidator = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
  isLoading:boolean = false;
  dataSubscription$:Subscription | undefined;
  form:FormGroup = this.fb.group({
    username:[null,Validators.required],
    email:[null,[Validators.required, Validators.pattern(this.emailValidator)]],
    password:[null,[Validators.required]]
  });

  register(){
    if(!this.form.valid){
      this.toastr.error("Please, fill all fields", "Register error");
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.dataSubscription$ = this.authService.register(this.form.value)
    .pipe(
      tap( user => {
        if(user.ok){
          localStorage.setItem('token', user.token);
          this.router.navigateByUrl("/alexpress/home");
          this.isLoading = false;
        }
      })
    )
    .subscribe({
      next: (resp:any) => {
        this.toastr.success(resp.message);
        this.authService.token = resp.token;
        this.isLoading = false;
      },
      error: err => {
        handleBackendErrorResponse(err, this.toastr);
        this.isLoading = false;
      }
    });
  }

  validateField(field:string){
    return (this.form.get(field)?.touched && !this.form.get(field)?.valid) ? 'border-2 border-red-500' : 'border-black';
  }

  isVisible:boolean = false;

  showPass(){
    this.isVisible = !this.isVisible;
  }

  theme = localStorage.getItem('color-theme');

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

    this.form.get('username')?.setValue(username);
    this.form.get('email')?.setValue(email);
    this.form.get('password')?.setValue(password);

    this.form.get('email')?.updateValueAndValidity();

  }

  constructor(private fb:FormBuilder, 
              private toastr:ToastrService, 
              private authService:AuthService, 
              private router:Router,
              private cdr:ChangeDetectorRef){}

  ngOnDestroy(): void {
    this.dataSubscription$?.unsubscribe();
  }
}
