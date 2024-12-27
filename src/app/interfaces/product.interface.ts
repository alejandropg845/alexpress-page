export interface Product{
    id:number,
    username:string,
    images:string[],
    title:string,
    description:string,
    price:number,
    accumulated:number,
    votes:number,
    category:string,
    condition:string,
    shippingPrice:number,
    quantity:number,
    sold:number,
    coupon:Coupon,
    reviews: Reviews[],
    isDeleted: boolean
}

export interface Reviews {
    id:number,
    productId:number,
    rating:number,
    comment: Comment
}

interface Comment {
    id:number,
    author:string,
    content:string,
    createdOn:string,
}

interface Coupon{
    id:number,
    name:string,
    discount:number,
    is50Discount:boolean,
    isDiscount:boolean,
    isShippingFree:boolean
}