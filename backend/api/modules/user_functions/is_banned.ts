import { DB } from "../../types/db.type.ts";

// check if user is banned
export default async function isBanned(db : DB, { userId = "", deviceId = "", ip = "" }) {

     const rows = await db(
          `SELECT 1
               FROM Bans
               WHERE (
                    (subject_type='user_id'   AND subject_value=?)
                    AND (subject_type='device' AND subject_value=?)
                    AND (subject_type='ip'     AND subject_value=?)
                    )
               AND (expires_at IS NULL OR expires_at > NOW())
               LIMIT 1`,
          [userId, deviceId, ip]
     );
     if(!Array.isArray(rows)){
          throw new Error("Invalid database response");
     }
     return rows.length > 0;
}
