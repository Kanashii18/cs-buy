

import check_session from '../scripts/check_session.js';

async function checkoutID_verify(request, reply) {
     if(!request.query.session_id) return reply.code(400).send({ error: 'Invalid Session' });
     const session_id = request.query.session_id;
     const userInfo = request.userInfo;

     // look for the product_id with the checkout session...
     let query = `
          SELECT
          product_id
          FROM Checkout_id
          WHERE id = ? AND user_id = ?
     `
     let resp_db = await db(query, [session_id, userInfo.id]);

     if(resp_db.length === 0) return reply.code(400).send({error: "Session not found, refrest and try again"});
     const product_id = resp_db[0].product_id;
     // look for the product info
     query = `
          SELECT
               price,
               user_id,
               category,
               title,
               image
          FROM Products
          WHERE product_id = ?
     `
     resp_db = await db(query, [product_id]);
     if(resp_db.length === 0) return reply.code(400).send({error: "Product not found, try later please"});

     request.product = { 
          price:resp_db[0].price,
          product_id:product_id,
          image:resp_db[0].image,
          title:resp_db[0].title,
          user_id:resp_db[0].user_id,
          category:resp_db[0].category,
     };
};

async function authMiddleware (request, reply){
     const r = await check_session(request, reply)
     // if response isn't 200
     if(r.code!==200) return reply.code(r.code).send({error:r.msg});
}

export {checkoutID_verify, authMiddleware};