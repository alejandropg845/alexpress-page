import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../interfaces/orders.interface';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, tap } from 'rxjs';
import { handleBackendErrorResponse } from '../../../error-handler';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styles: ``
})
export class AddressesComponent implements AfterViewInit, OnDestroy{

  addressForm:FormGroup = this.fb.group({
    fullName: [null, [Validators.required, Validators.maxLength(40)]],
    phone   : [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), this.validatePhone()]],
    postalCode : [null, [Validators.required, Validators.maxLength(10)]],
    residence  : [null, [Validators.required, Validators.maxLength(60)]],
    country    : [null, [Validators.required, Validators.maxLength(15)]],
    city       : [null, [Validators.required, Validators.maxLength(25)]]
  });

  isLoading:boolean = false;

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
  

  destroy$ = new Subject<void>();

  addresses:Address[] = [];
  isVisible:boolean = false;
  theme = localStorage.getItem('color-theme');
  isEdit:boolean = false;
  addressId!:number;

  getUserAddresses():void{
    this.authService.getUserAddresses().pipe(takeUntil(this.destroy$))
    .subscribe(addresses => {
      this.addresses = addresses;
    });
  }

  onEditclick(addressId:number){
    this.isEdit = true;
    this.isVisible = true;
    this.setAddressValues(addressId);
  }

  onSubmit(){
    
    if(!this.addressForm.valid){
      this.toastr.error("There are missing fields", "Missing fields");
      this.addressForm.markAllAsTouched();
      return;
    }

    if(!this.isEdit){

      this.isLoading = true;

      this.authService.createAddress(this.addressForm).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (suc:any) => {
          this.isVisible = false;
          this.isLoading = false;
          this.toastr.success(suc.message);
          this.getUserAddresses();
        },
        error: err => {
          handleBackendErrorResponse(err, this.toastr);
          this.isLoading = false;
        }
      });

    } else {

      this.isLoading = true;

      this.authService.editAddress(this.addressId, this.addressForm)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (suc:any) => {
          this.isVisible = false;
          this.isLoading = false;
          this.toastr.success(suc.message);
          this.getUserAddresses();
        },
        error: err => {
          this.isLoading = false;
          handleBackendErrorResponse(err, this.toastr);
        }
      });
    }
  }


  setAddressValues(id:number){
    this.addressId = id;
    const addressInfo:Address = this.addresses.find(a => a.id === id)!;

    this.addressForm.get('fullName')?.setValue(addressInfo.fullName);
    this.addressForm.get('phone')?.setValue(addressInfo.phone);
    this.addressForm.get('postalCode')?.setValue(addressInfo.postalCode);
    this.addressForm.get('city')?.setValue(addressInfo.city);
    this.addressForm.get('residence')?.setValue(addressInfo.residence);
    this.addressForm.get('country')?.setValue(addressInfo.country);

  }

  cancel(){
    this.isVisible = false;
    this.addressForm.reset();
  }

  validateField(controlName:string){
    const formControl = this.addressForm.get(controlName);
    if(this.theme==='light'){
      return (!formControl?.valid && formControl?.touched)?'border-red-600':'border-black';
    }else {
      return (!formControl?.valid && formControl?.touched)?'dark:border-red-600':'border-cyan-300';
    }
  }

  constructor(private authService:AuthService, private fb:FormBuilder, private toastr:ToastrService){}

  ngAfterViewInit(): void {
    this.getUserAddresses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
