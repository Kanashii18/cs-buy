import userCheck from './controllers/user_check.controller.ts';
import sellerCheck from './controllers/seller_check.controller.js';
import settingCheck from './controllers/setting_check.controller.js';
import imgCheck from './controllers/img_check.controller.ts';
import moderationCheck from './controllers/moderation_check.controller.js';
import profile from './controllers/profile.controller.js';
import sessionCheck from "./controllers/session_check.ts";
import type { DB } from '../../../../types/db.type.ts';
import type { Filter } from '../../../../types/config_types/filter.type.ts';
import { FastifyReply, FastifyRequest } from 'fastify';

export default function userCheck_controller(db : DB, ci: Filter){
     return {
          sessionCheck: sessionCheck({db,request, reply}),
          userCheck:  userCheck({ db, request, reply }),
          sellerCheck: sellerCheck({ db, request, reply }),
          settingCheck: settingCheck({ db, request, reply }),
          imgCheck: imgCheck({ ci, reply }),
          moderationCheck: moderationCheck({ ci, request, reply }),
          profile: profile({ db, request, reply })
     };
};