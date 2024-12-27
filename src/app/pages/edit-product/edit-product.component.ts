import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, switchMap, takeUntil } from 'rxjs';
import { Product } from '../../interfaces/product.interface';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { handleBackendErrorResponse } from '../../../error-handler';

interface createCoupon {
  
  name?:string,
  is50Discount?:boolean,
  isDiscount?:boolean
  discount?:number
  isShippingFree?:boolean

}

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styles: ``
})
export class EditProductComponent implements OnInit, OnDestroy{

  files: File[] = [];
  formulario: FormGroup = this.fb.group({
    images        : [["","","",""]],
    title         : [null, [Validators.required, Validators.maxLength(160)]],
    description   : [null, [Validators.required, Validators.maxLength(2000)]],
    coupon        : this.fb.group({
      is50Discount  : [null],
      isDiscount    : [null],
      isShippingFree: [null],
      name          : [null, [Validators.minLength(7), Validators.maxLength(7), this.validateCouponName()]],
      discount      : [undefined, [Validators.min(0), Validators.max(100), this.validateCouponValue()]],
    }),
    price         : [null, [Validators.required, Validators.min(1), Validators.max(50000)]],
    categoryId    : ["",   [Validators.required, Validators.min(1)]],
    conditionId   : ["",   [Validators.required, Validators.min(1)]],
    shippingPrice : [null, [Validators.required, Validators.min(0), Validators.max(10000)]],
    quantity      : [null, [Validators.required, Validators.min(1), Validators.max(10000)]],
  });

  product!:Product;
  destroy$ = new Subject<void>();
  isVisible:boolean = false;
  loadProductById(){
    this.activatedRoute.params.pipe(takeUntil(this.destroy$),
    switchMap(({id}) => this.productsService.loadProductById(id)))
    .subscribe(product => {
      this.product = product;
      this.setFormValues(product);
      const productImages = product.images;
      this.loadImagesFromUrls(productImages);
    });
  }

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

  setFormValues(product:Product){
    this.formulario.get('title')?.setValue(product.title);
    this.formulario.get('description')?.setValue(product.description);
    this.formulario.get('price')?.setValue(product.price);

    this.formulario.get('coupon.name')?.setValue(product.coupon.name);

    this.discount50 = this.product.coupon.is50Discount;
    this.freeShipping = this.product.coupon.isShippingFree;
    this.discount = this.product.coupon.isDiscount;

    this.setCategoryValue(product.category);
    this.setConditionValue(product.condition);
    this.formulario.get('quantity')?.setValue(product.quantity);
    this.formulario.get('shippingPrice')?.setValue(product.shippingPrice);
    this.titleLength = this.formulario.get('title')?.value.length;
    this.descriptionLength = this.formulario.get('description')?.value.length;
  }

  setCategoryValue(category:string){
    const categoryId = this.formulario.get("categoryId");
    switch(category){
      case "Watches": categoryId?.setValue(1);
      break;
      case "Clothes": categoryId?.setValue(2);
      break;
      case "Shoes": categoryId?.setValue(3);
      break;
      case "Pet Toys": categoryId?.setValue(4);
      break;
      case "Phones & Tablets": categoryId?.setValue(5);
      break;
      case "TV & Home": categoryId?.setValue(6);
      break;
      case "Audio & Sound": categoryId?.setValue(7);
      break;
    }
  }

  setConditionValue(condition:string){
    const conditionId = this.formulario.get("conditionId");
    switch(condition){
      case "Used": conditionId?.setValue(1);
      break;
      case "Refurbished": conditionId?.setValue(2);
      break;
      case "New": conditionId?.setValue(3);
      break;
    }
  }

  appendCouponToForm():boolean{
    
    if(this.discount){
      

      if(!this.getName?.value){

        this.formulario.get('coupon.name')?.setErrors({'emptyName':true});
        
        return false;
      }

      if(!this.getDiscount?.value){

        this.formulario.get('coupon.discount')?.setErrors({'emptyDiscount':true});
        
        return false;
      }
    
      
    }

    if(!this.discount){
      this.discount = false;
      this.formulario.get('coupon.discount')?.setValue(0);
      this.formulario.get('coupon.name')?.setValue("");
    }
    
    this.couponModel.isDiscount = this.discount;
    this.couponModel.discount = this.formulario.get('coupon.discount')?.value;
    this.couponModel.name = this.formulario.get('coupon.name')?.value;
    this.couponModel.is50Discount = this.discount50;
    this.couponModel.isShippingFree = this.freeShipping;
    this.formulario.setErrors(null);
    this.formulario.get('coupon')?.setValue(this.couponModel);
    
    
    return true;
  }

  onSelectedDiscount(){
    this.discount = !this.discount;
    if(!this.discount){
      this.formulario.get('coupon.discount')?.reset();
      this.formulario.get('coupon.name')?.reset();
    }
    this.cdr.detectChanges();
  }

  titleLength:number = 0;
  descriptionLength:number = 0;


  discount50  :boolean = false;
  discount    :boolean = false;
  freeShipping:boolean = false;

  couponModel:createCoupon = {
    is50Discount   :this.discount50,
    isDiscount     :this.discount,
    isShippingFree :this.freeShipping,
    name           :this.formulario.get('coupon.name')?.value,
    discount       :this.formulario.get('coupon.discount')?.value
  }

  get shippingPrice(){
    return this.formulario.get('shippingPrice');
  }

  get price(){
    return this.formulario.get('price');
  }

  get quantity(){
    return this.formulario.get('quantity');
  }

  checkLength(controlName:string){
    const control = this.formulario.get(controlName)?.value.length;
    if(controlName==='title') this.titleLength = control;
    if(controlName==='description') this.descriptionLength = control;
  }

  loadImagesFromUrls(imageUrls: string[]) {
    
    const imgUrlsObservable = imageUrls.map(url => {
      return this.urlToFile(url);
    });
    forkJoin(imgUrlsObservable)
    .pipe(takeUntil(this.destroy$))
    .subscribe(file => {
      this.files.push(...file);
    });
    
  }

  async urlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    const filename = url.split('/').pop() || 'file.jpg'; // Obtén un nombre para el archivo
    return new File([blob], filename, { type: blob.type });
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

  onSelect(event:any) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event:any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  urls:any[] = [];

  onSubmit(){

    if(!this.files[0]){ this.toastr.error("You forgot to select an image", "No image selected"); return;}
    if(this.files.length!==4){
      this.toastr.error("You must upload 4 images, you have uploaded "+this.files.length);
      return;
    }

    if(!this.appendCouponToForm()){
      this.toastr.error("Make sure you filled all fields correctly", "Fields error");
      return;
    }

    if(!this.formulario.valid){
      this.toastr.error("Make sure you filled all fields correctly", "Fields error");
      this.formulario.markAllAsTouched();
      return;
    }

    this.isVisible = true;

    //Send images to Cloudinary
    let selectedImagesObservable = this.files.map(file =>{
      let data = new FormData();
      data.append('file',file); 
      data.append('upload_preset', 'cloudinary_products');
      return this.productsService.uploadImage(data); //Prepare an observable to subscribe each selected image
    });

    forkJoin(selectedImagesObservable)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: cloudinaryInfo =>{
        this.urls = cloudinaryInfo.map(info => info.secure_url);
        this.formulario.get("images")?.setValue(this.urls);
        this.isVisible = false;

        // Send all info to database
        this.authService.updateUserProduct(this.product.id!,this.formulario.value);
        this.formulario.reset();
        this.formulario.get("conditionId")?.setValue("");
        this.formulario.get("categoryId")?.setValue("");
        this.files.splice(0);
        this.urls.splice(0);
        this.router.navigateByUrl("alexpress/my_products");
      },
      error: err => {
      this.isVisible = false;
      handleBackendErrorResponse(err, this.toastr);
    }});
    
  }

  OnSelectedImages(event:any){
    let files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if(file.size>5242880){
        this.toastr.error('Image size must be less than 5MB', 'File size error');
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
    dropZone.classList.remove('border-cyan-600','border-2');
    this.addFilesToDropZone(file!);
  }

  onDragOverImages(event:DragEvent){
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('border-cyan-600','border-2');
    dropZone.classList.remove('border-red-600');
  }

  onDragLeaveImages(event:DragEvent){
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('border-black','border');
    dropZone.classList.remove('border-cyan-600', 'border-2');
  }

  onDropZoneClick(event:MouseEvent){
    const click = event.currentTarget as HTMLElement;
    click.click
  }

  addFilesToDropZone(files:FileList){
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      if(!this.files.includes(file)){
        this.files.push(file);
      }
    }
  }

  validateField(field:string){
    const themeLS = localStorage.getItem('color-theme');
    let theme = '';
    if(themeLS==='light') {
      theme = (this.formulario.get(field)?.touched && !this.formulario.get(field)?.valid) ? 'border-red-600' : 'border-black';
    }else{
      theme = (this.formulario.get(field)?.touched && !this.formulario.get(field)?.valid) ? 'dark:border-red-600' : 'border-cyan-300';
    }
    return theme;
  }

  
  constructor(private fb:FormBuilder, 
              private productsService:ProductsService, 
              private toastr:ToastrService, 
              private activatedRoute:ActivatedRoute,
              private router:Router,
              private authService:AuthService,
              private cdr:ChangeDetectorRef
              ){}

  ngOnInit(): void {
    this.loadProductById();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
