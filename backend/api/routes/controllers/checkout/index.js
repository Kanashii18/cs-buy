import getSession from './functions/get_session.controller.js';
import getCheckoutProduct from './functions/getCheckoutProduct.controller.js';
import getOrder from './functions/get_order.controller.js';
import postOrder from './functions/post_order.controller.js';

export default function checkoutController(db, io, users){
     return {
          get_session: getSession({ db, request, reply }),
          getCheckoutProduct: getCheckoutProduct({ db, request, reply }),
          get_order: getOrder({ db, request, reply }),
          post_order: postOrder({ db, io, users, request, reply }),
     };
};