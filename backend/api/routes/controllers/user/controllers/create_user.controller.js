import { BCRYPT_COST, SECRET_PEPPER } from "../../../../config/bcrypt";
import conditional from "../../../../modules/user_functions/conditional";
import ban_controller from "../../ban";
import Generate_Username from "../../../../modules/user_functions/generate_name";
import { randomUUID } from "node:crypto";

// =============== Create User =============== //
/**
 * Registers a new user with username, email, and password.
 * Assigns a random profile image and creates a wallet.
 */
export default async ({db, request, reply}) => {
     const { email, password } = request.body;

     if (!email || !password) {
          return reply.code(400).send({ error: 'Missing required fields.' });
     }

     const isEmail = email.includes("@");

     isEmail ?
     (()=>{
          let error = conditional.email_conditional(email);
          if (error) return reply.code(400).send({ error });
     })()
     :
     (()=>{
          let error = conditional.username_conditional(email);
          if (error) return reply.code(400).send({ error });
     })()

     let error = conditional.password_conditional(password);
     if (error) return reply.code(400).send({ error });

     try {
          // Check if user already exists
          const existingUserStmt = `
               SELECT user_id, email FROM Users WHERE email = ?
          `;

          try {
               const existing = await db(existingUserStmt, [email]);
               if (existing?.length) {
                    return reply.code(409).send({ error: "User already exists" });
               }

               const ip = (request.headers["x-forwarded-for"] || request.socket.remoteAddress || "")
                    .toString()
                    .split(",")[0]
                    .trim();
               const deviceId = request.deviceId;
               if (await isBanned(db, { userId: "", deviceId, ip })) {
                    return reply.code(403).send({ error: "Access denied." });
               }


               const username = Generate_Username()
               const hash = await bcrypt.hash(password + SECRET_PEPPER, BCRYPT_COST);

               const user = {
                    user_id: randomUUID(),
                    username,
                    email,
                    password:hash,
                    img: `../data/images/profiles-images/${Math.floor(Math.random() * 8) + 1}.png`,
                    time: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    description: "There's nothing here yet... or maybe you're just not seeing it right.",
                    role: 'user',
                    rate: 0,
               };

               const insertUserStmt = `
                    INSERT INTO Users (user_id, username, email, password, img, time, description, role, rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               `;
               await db(insertUserStmt, [
                    user.user_id,
                    user.username,
                    user.email,
                    user.password,
                    user.img,
                    user.time,
                    user.description,   
                    user.role,
                    user.rate
               ]);
               await ban_controller.linking(db, user.user_id, deviceId, ip);

               // Create wallet for the user
               const wallet = {
                    wallet_id: randomUUID(),
                    user_id: user.user_id,
                    balance: 0,
                    created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
               };

               const insertWalletStmt = `
                    INSERT INTO Wallets (wallet_id, user_id, balance, created_at)
                    VALUES (?, ?, ?, ?)
               `;
               await db(insertWalletStmt, [
                    wallet.wallet_id,
                    wallet.user_id,
                    wallet.balance,
                    wallet.created_at
               ]);

               // Generate JWT token for the new user
               const payload = { id: user.user_id, email: user.email, username: user.username, role: user.role };
               const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });

               reply.cookie('session_token', token, {    
                    httpOnly: false,
                    secure: false,
                    path: '/',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
               });
               return reply.code(200).send({
                    username: user.username,
                    loggedIn: true,
                    img: user.img,
                    message: 'OK',
                    role:"client",
                    user_id: user.user_id
               });
          } catch (err) {
               console.error('Error checking or inserting user:', err);
               return reply.code(500).send({ error: 'Database error' });
          }
     } catch (err) {
          console.log('Error creating user:', err);
          return reply.code(500).send({ error: `Server error while creating user: ${err.message}` });
     }
}