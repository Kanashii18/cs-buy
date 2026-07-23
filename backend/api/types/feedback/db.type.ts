export type GetRecentDB = {
     product_image: string,
     product_title: string,
     price_at_purchase: number,
     created_at: Date,
}
export type PostFeedback = {
     product_id: string,
     seller_id: string,
}