export default async ({request, reply, db}) => {
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
}