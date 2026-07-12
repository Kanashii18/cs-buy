import { getFeedback } from './controllers/getFeedback';
import { getAllFeedback } from './controllers/getAllFeedback';
import { getRecentOrder } from './controllers/getRecentOrder';
import { getTotalSelled } from './controllers/getTotalSelled';
import { postFeedback } from './controllers/postFeedback';
import { getRating } from './controllers/getRating';

// ================== Feedback Controller ================== //

export default function gestionFeedback(db) {
     return {
          getFeedback: getFeedback({ request, reply, db }),
          getFeedback: getAllFeedback({ request, reply, db }),
          getRecentOrder: getRecentOrder({ request, reply, db }),
          getTotalSelled: getTotalSelled({ request, reply, db }),
          postFeedback: postFeedback({ request, reply, db }),
          getRating: getRating({ request, reply, db })
     };
}