import { UUID } from "node:crypto"
import { User_Scheme } from "../user.type.js"

export type Checkout_verify = {
     session_id : UUID
}
export type Product = { 
     price:Number,
     product_id:UUID,
     image:string,
     title:string,
     user_id:UUID,
     category:"account"|"service",
}
export type Product_id = {
     product_id : UUID
}
export type Checkout_body = {
     userInfo: User_Scheme;
     product: Product;
}