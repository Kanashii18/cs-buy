export default async ({request, reply, db}) => {
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
}