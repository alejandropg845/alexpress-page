import { Reviews } from "./product.interface"

export interface Order {
    id:number,
    paypalTransactionId:number,
    createdOn:string,
    orderedProducts:OrderedProduct[],
    summary:number,
    address:Address
    reviewContainerDto:Reviews
}

interface OrderedProduct {
    id:number,
    productId:number,
    quantity:number,
    imageUrl:string,
    couponName:string,
    discountValue:number,
    price:number,
    shippingPrice:number,
    isDeleted:boolean
}

export interface Address {
    id:number,
    fullName:string,
    phone:string,
    postalCode:string,
    residence:string,
    country:string,
    city:string
}