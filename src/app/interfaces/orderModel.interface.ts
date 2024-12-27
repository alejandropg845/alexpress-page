export interface OrderModel {
    paypalTransactionId:string,
    createdOn:string,
    orderedProducts:OrderedProduct[],
    summary:number,
    addressId:number
}

export interface OrderedProduct {
    productId:number,
    quantity:number,
    price:number,
    shippingPrice:number,
    imageUrl:string,
    couponName:string,
    discountValue:number
}