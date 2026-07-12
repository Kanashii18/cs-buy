import { get_purchased_by_user } from './controllers/get_purchased_by_user';
import { get_specific_product } from './controllers/get_specific_product';
import { confirm_product } from './controllers/confirm_product';

// ================== Order Controller ================== //

export function orderController( db ) {
     return {
          getPurchasedByUser: get_purchased_by_user({ request, reply, db }),
          getSpecificProduct: get_specific_product({ request, reply, db }),
          confirmProduct: confirm_product({ request, reply, db }),
     };
}