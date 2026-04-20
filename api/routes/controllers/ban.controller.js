// bans.controller.js
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

const BanController = {
     /** POST /api/bans
      *  Body: { subject_type: 'user'|'device'|'ip', subject_value: string, reason?: string, expires_at?: string|null }
      */
     create: async (request, reply, db) => {
          try {
               const { subject_type, subject_value, reason = null, expires_at = null } = request.body || {};
               const err = validateBanInput({ subject_type, subject_value, reason, expires_at });
               if (err) return reply.code(400).send({ error: err });

               await db(
               `INSERT INTO Bans (subject_type, subject_value, reason, expires_at)
               VALUES (?, ?, ?, ?)`,
               [subject_type, subject_value, reason, expires_at]
               );

               return reply.code(201).send({ message: "Ban created." });
          } catch (e) {
               return reply.code(500).send({ error: "Internal error creating ban." });
          }
     },

     /** DELETE /api/bans
      *  Body: { subject_type: 'user'|'device'|'ip', subject_value: string }
      *  Soft-unban by deleting active bans for that subject.
      */
     revoke: async (request, reply, db) => {
          try {
               const { subject_type, subject_value } = request.body || {};
               if (!VALID_TYPES.has(subject_type) || !subject_value) {
               return reply.code(400).send({ error: "Invalid subject_type or subject_value." });
               }

               const result = await db(
               `DELETE FROM Bans
                    WHERE subject_type = ?
                    AND subject_value = ?`,
               [subject_type, subject_value]
               );

               return reply.code(200).send({ message: "Ban revoked.", affected: result.affectedRows || 0 });
          } catch (e) {
               return reply.code(500).send({ error: "Internal error revoking ban." });
          }
     },

     /** GET /api/bans?type=user|device|ip&value=xxx&active=1&page=1&pageSize=50
      *  List bans with optional filters and pagination.
      */
     list: async (request, reply, db) => {
          try {
               const { type, value, active, page = 1, pageSize = 50 } = request.query || {};
               const where = [];
               const params = [];

               if (type) {
               if (!VALID_TYPES.has(type)) return reply.code(400).send({ error: "Invalid type." });
               where.push(`subject_type = ?`); params.push(type);
               }
               if (value) { where.push(`subject_value = ?`); params.push(value); }
               if (active === "1") where.push(`(expires_at IS NULL OR expires_at > NOW())`);

               const limit = Math.min(Math.max(parseInt(pageSize, 10) || 50, 1), 200);
               const offset = Math.max((parseInt(page, 10) || 1) - 1, 0) * limit;

               const rows = await db(
               `SELECT id, subject_type, subject_value, reason, created_at, expires_at
                    FROM Bans
                    ${where.length ? "WHERE " + where.join(" AND ") : ""}
                    ORDER BY id DESC
                    LIMIT ? OFFSET ?`,
               [...params, limit, offset]
               );

               return reply.code(200).send({ items: rows, page: Number(page), pageSize: limit });
          } catch (e) {
               return reply.code(500).send({ error: "Internal error listing bans." });
          }
     },

     /** GET /api/bans/status?userId=...&deviceId=...&ip=...
      *  Quick check if any subject is currently banned.
      */
     status: async (request, reply, db) => {
          try {
               const { userId = "", deviceId = "", ip = "" } = request.query || {};
               const rows = await db(
               `SELECT 1 FROM Bans
                    WHERE (subject_type='user'   AND subject_value = ?)
                    OR (subject_type='device' AND subject_value = ?)
                    OR (subject_type='ip'     AND subject_value = ?)
                    AND (expires_at IS NULL OR expires_at > NOW())
                    LIMIT 1`,
               [userId, deviceId, ip]
               );
               return reply.code(200).send({ banned: rows.length > 0 });
          } catch (e) {
               return reply.code(500).send({ error: "Internal error checking status." });
          }
     },
};

export default BanController;