import ban_controller from "../../ban";
import conditional from "../../../../modules/user_functions/conditional";

// =============== Login User =============== //
/**
 * Authenticates user with username or email and password.
 * Returns a JWT token for authenticated users.
 */
export default async ({db, request, reply}) => {
     const { username, password } = request.body;

     if (!username || !password) {
          return reply.code(400).send({ 
               message:"Please provide both username and password.",
               error: 'Missing username or password fields.'
          });
     }

     // verify that the password are between 6 and 30 characters
     let error = conditional.password_conditional(password);
     if (error) return reply.code(400).send({ message: error, error: "Password too short or long" });

     const ip = (request.headers["x-forwarded-for"] || request.socket.remoteAddress || "").toString().split(",")[0].trim();
     const deviceId = request.deviceId;
     if (await isBanned(db, { userId: null, deviceId, ip })) {
          return reply.code(403).send({ error: "Access denied." });
     }

     try {
          // requiere: import bcrypt from "bcrypt" (arriba del archivo) kanashiiii

          const query = `
               SELECT user_id, email, username, password, role, img
               FROM Users
               WHERE username = ? OR email = ?
          `;
          const rows = await db(query, [username, username]);

          if (rows?.length <= 0) {
               return reply.code(400).send({ message: 'Incorrect username/email.', error: 'Invalid credentials' });
          }

          const user = rows[0]; 

          const ok = await bcrypt.compare(password + (SECRET_PEPPER), user.password);
          if (!ok) {
               return reply.code(400).send({ message: 'Incorrect Password.', error: 'Invalid credentials' });
          }

          //linkeamos ip y deviceid al usuario
          await ban_controller.linking(db, user.user_id, deviceId, ip);

          const payload = { id: user.user_id, email: user.email, username: user.username, role: user.role };
          const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
          reply.cookie('session_token', token, {    
               httpOnly: false,
               secure: false,
               path: '/',
               sameSite: 'lax',
               maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return reply.code(200).send({ user:{ id:user.user_id, username:user.username, img:user.img, role:user.role },
                                        message: 'successful',
                                        loggedIn:true });
     } catch (error) {
          console.error('Login error:', error);
          return reply.code(500).send({ error: 'Internal server error' });
     }
}