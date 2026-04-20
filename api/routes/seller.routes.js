// routes/seller.routes.js
import { gestionProduct } from './controllers/seller.product.controller.js';
import { gestionFeedback } from "./controllers/feedback.controller.js";

export default function sellerRouter(db,ci,authMiddleware) {
     const { addProduct, 
          getProduct, 
          getProductById, 
          getNav_Product,
          getProductSelf, 
          getModifyProduct,

          pause,
          resume,
          remove,
          updateProduct } = gestionProduct(db,ci);
     const {
          getFeedback,
          postFeedback,
          getRating,
          getTotalSelled,
          getRecentOrder,
          getAllFeedback
           } = gestionFeedback(db);

     return async function (fastify) {
          fastify.register( async(scope) => {

               // PRIVATE ROUTES
               scope.addHook("preHandler", authMiddleware);
               // pause or resume product
               scope.put('/pause', pause);
               scope.put('/resume', resume);
               scope.delete('/delete', remove);

               // set product
               scope.post('/set-product', addProduct);

               scope.get('/self-product', getProductSelf);
               scope.put('/modify/product', updateProduct);
               scope.get('/get-modify', getModifyProduct);

               // private feedback information 
               scope.get('/all-feedback', getAllFeedback);
               scope.post('/set-feedback', postFeedback);
               scope.get('/rating',getRating);
               scope.get('/total-selled', getTotalSelled);
               scope.get('/order/recent', getRecentOrder);
          })

          // PUBLIC ROUTES
          fastify.post('/get-product', getProduct);
          // fastify.get('/get-product/accounts', getAccounts);
          // fastify.get('/get-product/services', getServices);
          // fastify.get('/get-product/assets', getAssets);

          fastify.get('/get-product/top', getNav_Product);
          fastify.get('/product__page', getProductById);

          fastify.post('/get-feedback', getFeedback);
     };
}