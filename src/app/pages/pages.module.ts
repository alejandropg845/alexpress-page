import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { SharedModule } from '../shared/shared.module';
import { PagesRoutingModule } from './pages.routes';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { ProductsComponent } from './products/products.component';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';
import { OrdersComponent } from './orders/orders.component';
import { WishListComponent } from './wish-list/wish-list.component';
import { CartComponent } from './cart/cart.component';
import { AddProductComponent } from './add-product/add-product.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MyProductsComponent } from './my-products/my-products.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { LessComponent } from './less/less.component';
import { SupportComponent } from './support/support.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PaymentComponent } from './payment/payment.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { PaymentDoneComponent } from './payment-done/payment-done.component';
import { AddressesComponent } from './addresses/addresses.component';
import { CategoriesSliderComponent } from './categories-slider/categories-slider.component';
import { ManageProductsComponent } from '../auth/manage-products/manage-products.component';
import { PassComponent } from './pass/pass.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { SafetyDialogComponent } from './safety-dialog/safety-dialog.component';

@NgModule({
  declarations: [
    MainComponent,
    CategoriesComponent,
    HomeComponent,
    ProductsComponent,
    ProductComponent,
    OrdersComponent,

    WishListComponent,
    CartComponent,
    AddProductComponent,
    MyProductsComponent,
    EditProductComponent,
    LessComponent,
    SupportComponent,
    PaymentComponent,
    PaymentDoneComponent,
    AddressesComponent,
    CategoriesSliderComponent,
    ManageProductsComponent,
    PassComponent,
    ConfirmDialogComponent,
    SafetyDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesRoutingModule,
    RouterOutlet,
    RouterLink,
    RouterModule,
    ReactiveFormsModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    NgxPayPalModule
  ],
})
export class PagesModule { }
