// bans.controller.js
import create from "./controllers/create.controller.js";
import revoke from "./controllers/revoke.controller.js"; 
import list from "./controllers/list.controller.js";
import status from "./controllers/status.controller.js";
import linking from "./controllers/linking.controller.js";
// All comments/docs in English per your rule.

const VALID_TYPES = new Set(["user", "device", "ip"]);

/** Validate ban payload */
function validateBanInput({ subject_type, subject_value, reason, expires_at }) {
     if (!VALID_TYPES.has(subject_type)) return "Invalid subject_type. Use 'user' | 'device' | 'ip'.";
     if (!subject_value || typeof subject_value !== "string") return "subject_value is required.";
     if (reason && reason.length > 255) return "reason too long (max 255).";
     if (expires_at && Number.isNaN(Date.parse(expires_at))) return "expires_at must be ISO date or null.";
     return null;
}

export default function banController(request, reply, db){
     return {
          /** POST /api/bans
           *  Body: { subject_type: 'user'|'device'|'ip', subject_value: string, reason?: string, expires_at?: string|null }
           */
          create: create({ request, reply, db, validateBanInput }),
          /** DELETE /api/bans
           *  Body: { subject_type: 'user'|'device'|'ip', subject_value: string }
           *  Soft-unban by deleting active bans for that subject.
           */
          revoke: revoke({ request, reply, db }),

          /** GET /api/bans?type=user|device|ip&value=xxx&active=1&page=1&pageSize=50
           *  List bans with optional filters and pagination.
           */
          list: list({ request, reply, db }),

          /** GET /api/bans/status?userId=...&deviceId=...&ip=...
           *  Quick check if any subject is currently banned.
           */
          status: status({ request, reply, db }),

          /**
           * Linking banned to the user
           */
          linking: linking({request, reply, db})
     } 
}; 