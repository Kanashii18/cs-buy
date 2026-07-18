import getProductController from "./controllers/get_product.controller.js";
import markAsReadController from "./controllers/mark_as_read.controller.js";
import overviewController from "./controllers/overview.controller.js";

export default function overviewsController(db, request, reply) {
     return {
          // Ver overview de los chats
          overview: overviewController({ request, reply, db }),
          // Marcar un mensaje como leído
          markAsRead: markAsReadController({ request, reply, db }),
          // Get specific product information
          getProduct: getProductController({ request, reply, db })
     };
}
;