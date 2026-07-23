import type { UUID } from "node:crypto";
import type { DB } from "../../../../types/db.type.ts";
import type { QueryResult } from "mysql2";
import { Ban } from "../../../../types/modules/bans/bans.type.ts";

export default async ({db, user_id} : Ban.RevokeParams) : Promise<void| {error: string }> => {
     try {
          if  (typeof user_id !== "string") {
               return { error: "Invalid user_id" };
          }

          const resp = await db<QueryResult[]>(
               `DELETE FROM Bans
               WHERE user_id = ?`,
               [user_id]
          );
          if(resp.length === 0) {
               return { error: "No ban found for the given user_id." };
          }
     } catch (e) {
          return { error: "Internal error revoking ban." };
     }
}