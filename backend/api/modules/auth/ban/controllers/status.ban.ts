import { QueryResult } from "mysql2";
import { Ban } from "../../../../types/modules/bans/bans.type.ts";

export default async ({db, user_id, device_id, ip} : Ban.StatusParams) => {
     try {
          if(!user_id) return { error: "Unauthorized" };
          const rows = await db<QueryResult[]>(
               `SELECT 1 FROM Bans
                    WHERE (subject_type='user'   AND subject_value = ?)
                    AND (subject_type='device' AND subject_value = ?)
                    OR (subject_type='ip'     AND subject_value = ?)
                    AND (expires_at IS NULL OR expires_at > NOW())
                    LIMIT 1`,
               [user_id, device_id, ip]
          );
          if(rows.length > 0) {
               return { banned: true };
          }

     } catch (e) {
          return { error: "Internal error checking status." };
     }
}