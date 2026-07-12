export default async ({request, reply, db, validateBanInput}) => {
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
}