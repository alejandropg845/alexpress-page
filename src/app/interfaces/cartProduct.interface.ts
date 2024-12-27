
export interface CartProducts{
    id:number,
    productId:number,
    quantity:number,
    product:ProductInCart,
    discount:number,
    discountName:string
}

interface ProductInCart {
    price: number,
    image: string,
    title: string,
    shippingPrice:number,
    isDeleted: boolean
}


