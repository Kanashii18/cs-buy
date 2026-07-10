

import type {FastifyRequest, FastifyReply} from "fastify";
import type { UUID } from 'node:crypto';
import {db} from "../scripts/db.js";
import { Checkout_body, Checkout_verify, Product, Product_id } from "../types/middleware/checkout_verify.type.js";
import { User_Scheme } from "../types/user.type.js";

async function checkoutID_verify(request:FastifyRequest<{Querystring:Checkout_verify}> & Checkout_body, reply:FastifyReply) {
     if(!request.query.session_id) return reply.code(401).send({ error: 'Invalid Session' });
     const session_id : UUID = request.query.session_id;
     const userInfo : User_Scheme = request.userInfo;

     // look for the product_id with the checkout session...
     const is_session = await db<Product_id[]>(`
          SELECT
          product_id
          FROM Checkout_id
          WHERE id = ? AND user_id = ?
     `, [session_id, userInfo.id]);

     if(is_session.length === 0) return reply.code(404).send({error: "Session not found, refresh and try again"});
     const product_id = is_session[0].product_id;
     // look for the product info
     const product_info = await db<Product[]>(`
          SELECT
               price,
               user_id,
               category,
               title,
               image
          FROM Products
          WHERE product_id = ?
     `, [product_id]);
     if(product_info.length === 0) return reply.code(404).send({error: "Product not found, try later please"});

     request.product = { 
          price:product_info[0].price,
          product_id:product_id,
          image:product_info[0].image,
          title:product_info[0].title,
          user_id:product_info[0].user_id,
          category:product_info[0].category,
     };
};

export default checkoutID_verify;