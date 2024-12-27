import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, takeUntil } from 'rxjs';
import { Product } from '../interfaces/product.interface';
import { FormGroup } from '@angular/forms';
import { ProductsAdmin } from '../interfaces/infoAdmin.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  allProducts: Product[] = [];
  dataSubscription:Subscription | undefined;
  loadProducts():Observable<Product[]>{
    return this.http.get<Product[]>(`${environment.url}/products`);
  }

  loadProductById(id:number){
    return this.http.get<Product>(`${environment.url}/products/`+id);
  }

  uploadImage(data:FormData):Observable<any>{
    return this.http.post(environment.cloudinary, data);
  }

  onSubmitForm(body:FormGroup){
    return this.http.post(`${environment.url}/products`, body);
  }

  getProductByTitle(query:string):Observable<Product[]>{
    return this.http.get<Product[]>(`${environment.url}/products?Title=`+query.trim());
  }

  getProductsByCategory(categoryId:number):Observable<Product[]>{
  
    const url = environment.url+"/products?categoryId="+categoryId;
    return this.http.get<Product[]>(url);
    
  }

  // ---------------------

  getProducts(){
    return this.http.get<ProductsAdmin[]>(`${environment.admin}/productsAdmin`);
  }

  getUsers(){
    return this.http.get<{userName:string, id:string}[]>(`${environment.admin}/usersAdmin`);
  }

  getDeletedProducts(){
    return this.http.get<ProductsAdmin[]>(`${environment.admin}/deletedProductsAdmin`);
  }

  getDisabledUsers(){
    return this.http.get<{userName:string, id:string}[]>(`${environment.admin}/disabledUsersAdmin`);
  }

  disableUser(userId:string){
    return this.http.put<any>(`${environment.admin}/disableUser/${userId}`, null);
  }

  deleteProduct(productId:number){
    return this.http.put<any>(`${environment.admin}/deleteProductAdmin/${productId}`, null);
  }

  submitPass(pass:string){
    return this.http.post<any>(`${environment.admin}/password/${pass}`, null);
  }

  getNoStockProducts(){
    return this.http.get<ProductsAdmin[]>(`${environment.admin}/noStockProducts`);
  }

  updateNoStockProduct(productId:number){
    return this.http.put<any>(`${environment.admin}/updateNoStockProduct/${productId}`, null);
  }

  constructor(private http:HttpClient) {}
}
