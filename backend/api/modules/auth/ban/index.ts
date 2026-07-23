// bans.controller.js
import create from "./controllers/create.ban.ts";
import revoke from "./controllers/revoke.ban.ts"; 
import list from "./controllers/list.ban.ts";
import status from "./controllers/status.ban.ts";
import linking from "./controllers/linking.ban.ts";
import { db } from "../../../scripts/db.ts";
import type { Ban } from "../../../types/modules/bans/bans.type.ts";
import type { User_ID } from "../../../types/user.type.ts";

export default function banController(){
     return {
          /** POST /api/bans
           *  Body: { subject_type: 'user'|'device'|'ip'|'email', subject_value: string, reason?: string, expires_at?: string|null }
           */
          create: ({subject_value, reason, expires_at} : Ban.created.Input) => create(db,{subject_value, reason, expires_at}),
          /** DELETE /api/bans
           *  Body: { subject_type: 'user'|'device'|'ip'|'email', subject_value: string }
           *  Soft-unban by deleting active bans for that subject.
           */
          revoke: (user_id : User_ID) => revoke({db, user_id}),

          /** GET /api/bans?type=user|device|ip&value=xxx&active=1&page=1&pageSize=50
           *  List bans with optional filters and pagination.
           */
          list: ({type}) => list({db, type}),

          /** GET /api/bans/status?userId=...&deviceId=...&ip=...
           *  Quick check if any subject is currently banned.
           */
          status: (device_id:string, user_id:User_ID, ip:string) => status({db, user_id, device_id, ip}),

          /**
           * Linking banned to the user
           */
          linking: (deviceId:string, user_id:User_ID, ip:string) => linking({db, deviceId, user_id, ip})
     } 
}; 