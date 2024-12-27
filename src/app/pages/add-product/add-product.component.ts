import { ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { handleBackendErrorResponse } from '../../../error-handler';
import { SafetyService } from '../../services/safety.service';



interface createCoupon {
  
  name?:string,
  is50Discount?:boolean,
  isDiscount?:boolean
  discount?:number
  isShippingFree?:boolean

}

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styles: ``
})
export class AddProductComponent implements OnDestroy{

  isValid:boolean = true;
  urls:string[] = [];
  files: File[] = [];
  titleLength:number = 0;
  descriptionLength:number = 0;
  isVisible:boolean = false;
  destroy$ = new Subject<void>();
  discount50  :boolean = false;
  discount    :boolean = false;
  freeShipping:boolean = false;

  formulario: FormGroup = this.fb.group({
    images        : [["","","",""]],
    title         : [null, [Validators.required, Validators.maxLength(160)]],
    description   : [null, [Validators.required, Validators.maxLength(2000)]],
    coupon        : this.fb.group({
      is50Discount  : [null],
      isDiscount    : [null],
      isShippingFree: [null],
      name          : [null, [Validators.minLength(7), Validators.maxLength(7), this.validateCouponName()]],
      discount      : [undefined,[Validators.min(0), Validators.max(100), this.validateCouponValue()]],
    }),
    price         : [null, [Validators.required, Validators.min(1), Validators.max(50000)]],
    categoryId    : ["",   [Validators.required, Validators.min(1)]],
    conditionId   : ["",   [Validators.required, Validators.min(1)]],
    shippingPrice : [null, [Validators.required, Validators.min(0), Validators.max(10000)]],
    quantity      : [null, [Validators.required, Validators.min(1), Validators.max(9999)]],
  });

  
  
  

  get getShippingPrice(){
    return this.formulario.get('shippingPrice');
  }

  get getPrice(){
    return this.formulario.get('price');
  }

  get getQuantity(){
    return this.formulario.get('quantity');
  }

  get getName(){
    return this.formulario.get('coupon.name');
  }

  get getDiscount(){
    return this.formulario.get('coupon.discount');
  }

  checkLength(controlName:string){
    const control = this.formulario.get(controlName)?.value.length;
    if(controlName==='title') this.titleLength = control;
    if(controlName==='description') this.descriptionLength = control;
  }

  OnSelectedImages(event:any){
    let files = event.target.files;

    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if(file.size>5242880){
        this.toastr.error('Image size must be less than 5MB', 'File size error');
        continue;
      }
      if(!file.type.includes('image')){
        this.toastr.error('That\'s not an image', 'File format error');
        continue;
      }
      this.files.push(file);
    }
    
    
  }

  setValueToSrc(img:HTMLImageElement, file:File){
    const url = URL.createObjectURL(file);
    img.setAttribute('src', url);
  }

  removeImage(i:number){
    this.files.splice(i,1);
  }

  onDropImages(event:DragEvent){
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files;
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('border-cyan-600','border-4');
    this.addFilesToDropZone(file!);
  }

  onDragOverImages(event:DragEvent){
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('border-cyan-600', 'transition', 'ease-in-out', 'duration-300', 'border-4');
    dropZone.classList.remove('border-red-600');
  }

  onDragLeaveImages(event:DragEvent){
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('border-black','border');
    dropZone.classList.remove('border-cyan-600', 'border-4');
  }


  addFilesToDropZone(files:FileList){

    for (let i = 0; i < files.length; i++) {
      
      let file = files[i];
      
      if(file.size>5242880){
        this.toastr.error('Image size must be less than 5MB', 'File size error');
        continue;
      }

      if(!file.type.includes('image')){
        this.toastr.error('That\'s not an image', 'File format error');
        continue;
      }
      
      if(!this.files.includes(file)){
        this.files.push(file);
      }

    }
    
    
  }

  onSelectedDiscount(){
    this.discount = !this.discount;
    if(!this.discount){
      this.formulario.get('coupon.discount')?.reset();
      this.formulario.get('coupon.name')?.reset();
    }
    this.cdr.detectChanges();
  }

  onSelectedFreeShipping(){
    this.freeShipping = !this.freeShipping;
    if(this.freeShipping && this.getShippingPrice?.value === 0){
      this.toastr.info("You can't select this coupon because your shipping price is 0");
      this.freeShipping = false;
      return;
    }
  }

  verifyShippingPrice(){
    if(this.formulario.get('shippingPrice')?.value === 0){
      this.freeShipping = false;
    }
  }
  
  validateCouponValue():ValidatorFn{

    return (control:AbstractControl):ValidationErrors | null => {
    const discountValue = control.value;
  
    let isDiscountValid:boolean = true;

    if(this.discount){
      if(!discountValue){
        isDiscountValid = false;
      }
    } else
    //User clicks when discount is true (it means he turned it to false)
    {
      isDiscountValid = true;
    }

    return (isDiscountValid)?null:{invalidDiscountValue:true};
    }
    
  }


  validateCouponName():ValidatorFn{

    return (control:AbstractControl):ValidationErrors | null => {

      const discountName = control.value;

      let isDiscountValid:boolean = true;
  
      if(this.discount){
        if(!discountName){
          isDiscountValid = false
        }
      } else
      //User clicks when discount is true (it means he turned it to false)
      {
        isDiscountValid = true;
      }
  
      return (isDiscountValid)?null:{invalidDiscountName:true};

    }

  }
  
  
  
  onSubmit(){

    if(!this.files[0]){ this.toastr.error("You forgot to select an image", "No image selected"); return;}
    if(this.files.length!==4){
      this.toastr.error("You must upload 4 images, you have uploaded "+this.files.length);
      return;
    }

    if(!this.formulario.valid){
      this.toastr.error("Make sure you filled all fields correctly", "Fields error");
      this.formulario.markAllAsTouched();
      return;
    }

    if(!this.discount){
      this.formulario.get('coupon.discount')?.setValue(0);
      this.formulario.get('coupon.name')?.setValue("");
    }

    const couponModel:createCoupon = {
      discount       : this.formulario.get('coupon.discount')?.value,
      is50Discount   : this.discount50,
      isDiscount     : this.discount,
      isShippingFree : this.freeShipping,
      name           : this.formulario.get('coupon.name')?.value
    }
    this.formulario.get('coupon')?.setValue(couponModel);

    this.isVisible = true;
    //Send images to Cloudinary
    let selectedImagesObservable = this.files.map(file =>{
      let data = new FormData();
      data.append('file',file); 
      data.append('upload_preset', 'cloudinary_products');
      return this.productsService.uploadImage(data); //Prepare an observable to subscribe each selected image
    });

    forkJoin(selectedImagesObservable).pipe(takeUntil(this.destroy$)).subscribe({
      next: cloudinaryInfo =>{
        this.urls = cloudinaryInfo.map(info => info.secure_url);
        this.formulario.get("images")?.setValue(this.urls);
        
        this.safetyService.showSafety();
        // Send all info to database
        this.productsService.onSubmitForm(this.formulario.value)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: _ => {
            this.toastr.success("Your product has been succesfully added");
            this.formulario.reset();
            this.formulario.get("conditionId")?.setValue("");
            this.formulario.get("categoryId")?.setValue("");
            this.files.splice(0);
            this.urls.splice(0);
            this.isVisible = false;
            this.router.navigateByUrl("/alexpress/my_products");
            this.safetyService.hideSafety();
        },
        error: err => {
          this.safetyService.hideSafety();
          this.isVisible = false;
          handleBackendErrorResponse(err, this.toastr);

        }});
      },
      error: err => {
        handleBackendErrorResponse(err, this.toastr);
        this.isVisible = false;
      }
    });
    
    
  }

  validateField(field:string){
    return (this.formulario.get(field)?.touched && !this.formulario.get(field)?.valid) 
    ? 'border-red-600 dark:border-red-600' : 'border-black dark:border-cyan-300';;
  }


  constructor(private fb:FormBuilder, 
              private productsService:ProductsService, 
              private toastr:ToastrService,
              private router:Router,
              private cdr:ChangeDetectorRef,
              private safetyService:SafetyService){}
  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
