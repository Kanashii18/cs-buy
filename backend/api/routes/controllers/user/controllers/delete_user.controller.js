// =============== Delete User =============== //
/**
 * Deletes a user by verifying username and password using the database.
 */
export default async ({db, request, reply}) => {
     const { username, password } = request.body;

     if (!username || !password) {
          return reply.code(400).send({ error: "Missing required fields." });
     }

     try {
          const selectUserStmt = `
               SELECT * FROM Users
               WHERE username = ? AND password = ?
          `;

          const user = await db(selectUserStmt, [username, password]);

          if (user.length === 0) {
               return reply.code(400).send({
                    message: "Incorrect username or password",
                    error: "Invalid credentials"
               });
          }

          const deleteUserStmt = `
               DELETE FROM Users
               WHERE user_id = ?
          `;

          await db(deleteUserStmt, [user[0].user_id]);

          const deleteWalletStmt = `
               DELETE FROM Wallets
               WHERE user_id = ?
          `;

          await db(deleteWalletStmt, [user[0].user_id]);

          return reply.code(200).send({
               message: "User successfully deleted"
          });

     } catch (err) {
          console.error("Error deleting user:", err);
          return reply.code(500).send({
               error: "Server error while deleting user"
          });
     }
}