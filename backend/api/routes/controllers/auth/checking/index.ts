import userCheck from './controllers/user_check.controller.ts';
import sellerCheck from './controllers/seller_check.controller.ts';
import settingCheck from './controllers/setting_check.controller.ts';
import imgCheck from './controllers/img_check.controller.ts';
import moderationCheck from './controllers/moderation_check.controller.ts';
import profile from './controllers/profile.controller.ts';
import sessionCheck from "./controllers/session_check.ts";
import type { DB } from '../../../../types/db.type.ts';
import type { Filter } from '../../../../types/config_types/filter.type.ts';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IdBody, IdQuery, UploadRequest } from '../../../../types/request.type.ts';

export default function userCheck_controller(db : DB, ci: Filter){
     return {
          sessionCheck: (request : FastifyRequest, reply : FastifyReply) => sessionCheck({db, request, reply}),
          userCheck: (request : FastifyRequest<{Querystring:IdQuery}>, reply : FastifyReply) => userCheck({ db, request, reply }),
          sellerCheck: (request : FastifyRequest<{Body:IdBody}>, reply : FastifyReply) => sellerCheck({ request, reply, db }),
          settingCheck: (request : FastifyRequest<{Querystring:IdQuery}>, reply : FastifyReply) => settingCheck({ request, reply, db }),
          imgCheck: (request : FastifyRequest<{Querystring:IdQuery}>, reply : FastifyReply) => imgCheck({ request, reply, ci }),
          moderationCheck: (request : UploadRequest, reply : FastifyReply) => moderationCheck({ ci, request, reply }),
          profile: (request : FastifyRequest<{Querystring:IdQuery}>, reply : FastifyReply) => profile({ db, request, reply })
     };
};