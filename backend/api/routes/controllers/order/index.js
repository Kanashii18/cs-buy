import getPurchased_by_user from './controllers/get_purchased_by_user';
import getSpecific_product from './controllers/get_specific_product';
import confirmProduct  from './controllers/confirm_product';

// ================== Order Controller ================== //

export function orderController( request, reply, db ) {
     return {
          getPurchasedByUser: getPurchased_by_user({ request, reply, db }),
          getSpecificProduct: getSpecific_product({ request, reply, db }),
          confirmProduct: confirmProduct({ request, reply, db }),
     };
}