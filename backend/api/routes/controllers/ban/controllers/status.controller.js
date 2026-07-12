export default async ({request, reply, db}) => {
     try {
          const userId = request.userId;
          const deviceId = request.deviceId;
          if(!userId || !deviceId) return res.code(404).send("Unauthorized");
          const rows = await db(
          `SELECT 1 FROM Bans
               WHERE (subject_type='user'   AND subject_value = ?)
               OR (subject_type='device' AND subject_value = ?)
               OR (subject_type='ip'     AND subject_value = ?)
               AND (expires_at IS NULL OR expires_at > NOW())
               LIMIT 1`,
          [userId, deviceId, request.ip]
          );
          return reply.code(200).send({ banned: rows.length > 0 });
     } catch (e) {
          return reply.code(500).send({ error: "Internal error checking status." });
     }
}