import userCheck from './controllers/user_check.controller.js';
import sellerCheck from './controllers/seller_check.controller.js';
import settingCheck from './controllers/setting_check.controller.js';
import imgCheck from './controllers/img_check.controller.js';
import moderationCheck from './controllers/moderation_check.controller.js';
import profile from './controllers/profile.controller.js';
import sessionCheck from "./controllers/session_check.js";

export default function userCheck_controller(db, ci){
     return {
          sessionCheck: sessionCheck({db,request, reply}),
          userCheck: userCheck({ db, request, reply }),
          sellerCheck: sellerCheck({ db, request, reply }),
          settingCheck: settingCheck({ db, request, reply }),
          imgCheck: imgCheck({ ci, reply }),
          moderationCheck: moderationCheck({ ci, request, reply }),
          profile: profile({ db, request, reply })
     };
};