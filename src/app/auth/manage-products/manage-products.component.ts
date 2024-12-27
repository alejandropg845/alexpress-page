import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../interfaces/product.interface';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { handleBackendErrorResponse } from '../../../error-handler';
import { ProductsAdmin } from '../../interfaces/infoAdmin.interface';
import { PasswordService } from '../../services/password.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-manage-products',
  templateUrl: './manage-products.component.html',
  styles: ``
})
export class ManageProductsComponent implements OnInit, OnDestroy{

  products:ProductsAdmin[] = [];
  users:{userName:string, id:string}[] = [];
  deletedProducts:ProductsAdmin[] = [];
  disabledUsers:{userName:string, id:string}[] = [];
  isAuthorized:boolean = false;
  noStockProducts:ProductsAdmin[] = [];

  loaded:boolean = false;
  destroy$ = new Subject<void>();

  sections = {
    products: false,
    disabledUsers: false,
    updateStock: false
  };

  toggleSection(section: keyof typeof this.sections) {
    this.sections[section] = !this.sections[section];
  }

  getProducts(){
    this.productsService.getProducts()
    .pipe(takeUntil(this.destroy$))
    .subscribe(prods => this.products = prods);
  }

  getAll(){
    this.getDeletedProducts();
    this.getDisabledUsers();
    this.getProducts();
    this.getUsers();
    this.getNoStockProducts();
  }

  getUsers(){
    this.productsService.getUsers()
    .pipe(takeUntil(this.destroy$))
    .subscribe(users => this.users = users);
  }

  getDisabledUsers(){
    this.productsService.getDisabledUsers()
    .pipe(takeUntil(this.destroy$))
    .subscribe(users => this.disabledUsers = users);
  }

  getDeletedProducts(){
    this.productsService.getDeletedProducts()
    .pipe(takeUntil(this.destroy$))
    .subscribe(products => this.deletedProducts = products);
  }

  getNoStockProducts(){
    this.productsService.getNoStockProducts()
    .pipe(takeUntil(this.destroy$))
    .subscribe(products => this.noStockProducts = products);
  }

  async submitPassword(){

    const value = await firstValueFrom(this.passwordService.openDialog());

    if(value){
      this.productsService.submitPass(value)
      .subscribe({
        next: _ => {
          this.getAll();
          this.isAuthorized = true;
        },
        error: err => {
          handleBackendErrorResponse(err, this.toastr);
          this.router.navigate(["alexpress/home"]);
        }
      });
    }

    
  }

  async disableUser(userId:string){
    
    const isConfirmed = await firstValueFrom(this.confirm.openDialog());

    if(isConfirmed){
      this.productsService.disableUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.toastr.success(res.message);
          this.getUsers();
          this.getDisabledUsers();
        },
        error: err => {
          handleBackendErrorResponse(err, this.toastr);
          this.router.navigate(["alexpress/home"]);
        }
      });
    }
    
  }

  async deleteProduct(productId:number){

    const isConfirmed = await firstValueFrom(this.confirm.openDialog());

    if(isConfirmed){
      this.productsService.deleteProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.toastr.success(res.message);
          this.getDeletedProducts();
          this.getProducts();
        },
        error: err => {
          handleBackendErrorResponse(err, this.toastr);
          this.router.navigate(["alexpress/home"]);
        }
      });
    }

  }

  async updateProductStock(productId:number){

    const isConfirmed = await firstValueFrom(this.confirm.openDialog());

    if(isConfirmed) {

      this.productsService.updateNoStockProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.toastr.success(res.message);
          this.getProducts();
          this.getNoStockProducts();
        },
        error: err => handleBackendErrorResponse(err, this.toastr)
      });
      
    }
  }



  constructor(private toastr:ToastrService,
              private productsService:ProductsService,
              private router:Router,
              private passwordService:PasswordService,
              private confirm:ConfirmDialogService) {}

  ngOnInit(): void {
    this.submitPassword();
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
