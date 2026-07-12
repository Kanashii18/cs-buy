import addProduct from './controllers/addProduct.controller.js';
import updateProduct from './controllers/updateProduct.controller.js';
import getModifyProduct from './controllers/getModifyProduct.controller.js';
import getProduct from './controllers/getProduct.controller.js';
import pause from './controllers/pause.controller.js';
import resume from './controllers/resume.controller.js';
import remove from './controllers/remove.controller.js';
import getNav_Product from './controllers/getNav_Product.controller.js';
import getProductById from './controllers/getProductById.controller.js';
import getProductSelf from './controllers/getProductSelf.controller.js';
import getAccounts from './controllers/getAccounts.controller.js';
import getServices from './controllers/getServices.controller.js';
import getAssets from './controllers/getAssets.controller.js';

export default function sellerController(db, ci, request, reply){
     return {
          addProduct: addProduct({ db, ci, request, reply }),
          updateProduct: updateProduct({ db, ci, request, reply }),
          getModifyProduct: getModifyProduct({ db, request, reply }),
          getProduct: getProduct({ db, request, reply }),
          pause: pause({ db, request, reply }),
          resume: resume({ db, request, reply }),
          remove: remove({ db, request, reply }),
          getNav_Product: getNav_Product({ db, request, reply }),
          getProductById: getProductById({ db, request, reply }),
          getProductSelf: getProductSelf({ db, request, reply }),
          getAccounts: getAccounts({ db, reply }),
          getServices: getServices({ db, reply }),
          getAssets: getAssets({ db, reply }),
     };
}

