// routes/seller.routes.js
import gestionProduct from './controllers/seller/index.js';
import gestionFeedback from './controllers/feedback/index.js';
import authMiddleware from '../middleware/verify_session.ts';
import type { DB } from '../types/db.type.ts';
import type { Filter } from '../types/config_types/filter.type.ts';
import type { FastifyInstance } from 'fastify';

export default function sellerRouter(db : DB, ci:Filter) {

     const product = gestionProduct(db, ci);
     const feedback = gestionFeedback(db);

     return async function (fastify : FastifyInstance) {
          fastify.register(async (scope) => {
               scope.addHook('preHandler', authMiddleware);
               scope.put('/pause', product.pause);
               scope.put('/resume', product.resume);
               scope.delete('/delete', product.remove);

               scope.post('/set-product', product.addProduct);
               scope.get('/self-product', product.getProductSelf);
               scope.put('/modify/product', product.updateProduct);
               scope.get('/get-modify', product.getModifyProduct);

               scope.get('/all-feedback', feedback.getAllFeedback);
               fastify.post('/get-feedback', feedback.getFeedback);
               scope.post('/set-feedback', feedback.postFeedback);

               scope.get('/rating', feedback.getRating);
               scope.get('/total-selled', feedback.getTotalSelled);
               scope.get('/order/recent', feedback.getRecentOrder);
          });

          fastify.post('/get-product', product.getProduct);
          fastify.get('/get-product/top', product.gedgetNav_Product);
          fastify.get('/product__page', product.getProductById);
     };
}