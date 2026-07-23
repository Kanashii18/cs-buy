import { UUID } from "node:crypto";
import { DB } from "../../db.type.ts";

export type Subject_value = {user_id: UUID, email? : string, ip?: string, deviceId?: string };
/** Ban module types */
export namespace Ban {
     /** Ban creation input type */
     export namespace created {
          export type Input = {
               subject_value: Subject_value;
               reason?: string;
               expires_at?: string | null;
          };
     }
     /** Ban linking input type */
     export type LinkingParams = {
          db: DB;
          deviceId: string;
          user_id: UUID;
          ip: string;
     }
     /** Ban listing input type */
     export type ListParams = {
          db: DB;
          type: {userId: UUID, email? : string, ip?: string, deviceId?: string };
     }
     /** Ban revocation input type */
     export type RevokeParams = {
          db: DB;
          user_id: UUID;
     }
     /** Ban status input type */
     export type StatusParams = {
          db: DB;
          user_id: UUID;
          device_id: string;
          ip: string;
     }
}