export type PaymentDB = {
     payment_id: string;
     payment_gateway: string;
     amount: number;
     wallet_id: string;
};
export type OrderDB = {
     order_id: string;
     user_id: string;
     seller_id: string;
     product_id: string;
     product_image: string;
     product_title: string;
     product_type: string;
     asset_name: string;
     price_at_purchase: number;
     information: string;
     status: string;
     have_feedback: number;
     created_at: string;
};