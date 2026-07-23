import type { DB } from "../../../../types/db.type.ts";
import type { Ban, Subject_value } from "../../../../types/modules/bans/bans.type.ts";

/** Validate ban payload */
const VALID_TYPES = new Set(["userId", "deviceId", "ip", "email"]);

/** Validate ban input */
function validateBanInput({subject_value, reason, expires_at } : Ban.created.Input) : string | null {
     const subject_type = Object.keys(subject_value).find(key => VALID_TYPES.has(key));
     if (!subject_type) return "subject_value is required.";
     if(!subject_type["user_id"]) return "user_id is required.";
     if (reason && reason.length > 255) return "reason too long (max 255).";
     if (expires_at && Number.isNaN(Date.parse(expires_at))) return "expires_at must be ISO date or null.";
     return null;
}

/** Create a new ban */
export default async (db : DB, {subject_value, reason = null, expires_at = null } : Ban.created.Input) : Promise<void | { error: string; }> => {
     try {
          const err = validateBanInput({subject_value, reason, expires_at });
          if (err) return {error:err};

          await db(
               `INSERT INTO Bans ( user_id, email, ip, deviceId, reason, expires_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
               [    
                    subject_value.user_id,
                    subject_value.email,
                    subject_value.ip,
                    subject_value.deviceId,
                    reason,
                    expires_at
               ]
          );
     } catch (e) {
          return { error: "Internal error creating ban." };
     }
}