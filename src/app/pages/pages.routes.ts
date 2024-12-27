import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainComponent } from "./main/main.component";
import { HomeComponent } from "./home/home.component";
import { CategoriesComponent } from "./categories/categories.component";
import { ProductsComponent } from "./products/products.component";
import { ProductComponent } from "./product/product.component";
import { OrdersComponent } from "./orders/orders.component";
import { WishListComponent } from "./wish-list/wish-list.component";
import { CartComponent } from "./cart/cart.component";
import { AddProductComponent } from "./add-product/add-product.component";
import { MyProductsComponent } from "./my-products/my-products.component";
import { EditProductComponent } from "./edit-product/edit-product.component";
import { LessComponent } from "./less/less.component";
import { PaymentComponent } from "./payment/payment.component";
import { PaymentDoneComponent } from "./payment-done/payment-done.component";
import { AddressesComponent } from "./addresses/addresses.component";
import { cartGuard } from "./guards/cart.guard";
import { ManageProductsComponent } from "../auth/manage-products/manage-products.component";

const routes:Routes = [
    {
        path:'',
        component: MainComponent,
        children:[
            {
                path:'home',
                component: HomeComponent
            },
            {
                path:'categories/:id',
                component: CategoriesComponent
            },
            {
                path:'products',
                component: ProductsComponent
            },
            {
                path:'my_products',
                component: MyProductsComponent
            },
            {
                path:'wish_list',
                component: WishListComponent
            },
            {
                path:'cart',
                component: CartComponent
            },
            {
                path:'less',
                component: LessComponent
            },
            {
                path:'product/:id',
                component: ProductComponent
            },
            {
                path:'my_products/:id',
                component: EditProductComponent
            },
            {
                path:'add',
                component: AddProductComponent
            },
            {
                path:'orders',
                component: OrdersComponent
            },
            {
                path: 'payment',
                component: PaymentComponent,
                canActivate: [cartGuard]
            },
            {
                path:'admin-mode',
                component: ManageProductsComponent
            },
            {
                path: 'addresses',
                component: AddressesComponent
            },
            {
                path:'**',
                redirectTo: 'home'
            }
        ]
    },
    
]
@NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule]
})
export class PagesRoutingModule{}