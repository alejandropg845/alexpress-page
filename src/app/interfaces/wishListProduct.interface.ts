
export interface WishListProduct{
    id:number,
    productId:number,
    product: ProductInWishList
}

interface ProductInWishList {
    image:string,
    title:string,
    isDeleted:boolean
}