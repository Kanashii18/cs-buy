import jwt from 'jsonwebtoken';
import { randomUUID, createHmac } from 'crypto';
import vision from '@google-cloud/vision';
import bcrypt from "bcrypt";
import fs from "fs";
import multer from 'multer';
const upload = multer({ dest: 'uploads/' }).single('image');
const COOKIE = "__did";
const SECRET = process.env.DEVICE_SECRET;
const sign = v => createHmac("sha256", SECRET).update(v).digest("base64url");

export function ensureDevice(request, reply, next) {
     const c = request.cookies?.[COOKIE];
     if (c) {
          const [id, sig] = c.split(".");
          if (id && sig && sig === sign(id)) { request.deviceId = id; return next(); }
     }
     const id = randomUUID();
     reply.cookie(COOKIE, `${id}.${sign(id)}`, {
          httpOnly: false, sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 31536000000, path: "/"
     });
     request.deviceId = id;
     next();
}

const BanController = {
     create: async (request, reply) => {
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
     revoke: async function (request, reply, db) {
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
     linking: async (db, userId, deviceId, ip) => {
          await db(`INSERT IGNORE INTO Devices (device_id) VALUES (?)`, [deviceId]);
          await db(`INSERT INTO UserDevices (user_id, device_id) VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE last_seen = NOW()`,
               [userId, deviceId]
          );
          await db(
               `INSERT INTO DeviceIPs (device_id, ip) VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE last_seen = NOW()`,
               [deviceId, ip]
          );
     }
};

export async function isBanned(db, { userId = "", deviceId = "", ip = "" }) {

     const rows = await db(
          `SELECT 1
               FROM Bans
               WHERE (
                    (subject_type='user_id'   AND subject_value=?)
                    AND (subject_type='device' AND subject_value=?)
                    AND (subject_type='ip'     AND subject_value=?)
                    )
               AND (expires_at IS NULL OR expires_at > NOW())
               LIMIT 1`,
          [userId, deviceId, ip]
     );

     return rows.length > 0;
}

const conditional = {
     email_conditional: (email) => {
          let valid_email = /^[A-Za-z0-9._%+-]+@[A-Za-z]{1,6}\.[A-Za-z]{1,3}$/;
          valid_email = valid_email.test(email);
          
          let valid_range = /^[A-Za-z0-9._%+-]{8,}@/;
          valid_range = valid_range.test(email);

          if (!valid_email) {
               return "Your email have a invalid structure. example@gmail.com";
          }
          if (!valid_range) {
               return "Your email must have at least 8 characters before '@'.";
          }
          if (email.length > 55){
               return "Your email cannot have more than 55 characters.";
          }
     },
     password_conditional: (password) => {
          if(password.length < 6 || password.length > 30){
               return 'Your password must be between 6 and 30 characters.';
          }
     },
     username_conditional: (username) => {
          if(username.length >= 16){
               return 'Your username cannot have more than 16 characters.';
          }
     },
     description_conditional: (description) => {
          if(description.length >= 130){
               return 'Your description cannot have more than y characters.';
          }
     }
};

function Generate_Username() {
     const words = [
          "raiden", "akira", "nezuko", "shinobi", "ryuji", "hollow", "kuro", "sakura",
          "vortex", "onyx", "kaizen", "asura", "phantasm", "reaper", "tensei", "yurei",
          "kitsune", "void", "zeke", "seraph", "nova", "aegis", "scar", "storm",
          "bane", "flame", "glitch", "rider", "phantom", "havoc", "curse", "ronin"
     ];

     const part1 = words[Math.floor(Math.random() * words.length)];
     let part2 = words[Math.floor(Math.random() * words.length)];

     while (part2 === part1) {
          part2 = words[Math.floor(Math.random() * words.length)];
     }

     const number = Math.floor(1000 + Math.random() * 9000);
     return `${part1}_${number}`;
}

// ================== User Controller ================== //

export function userController(db, ci) {

     const BCRYPT_COST = 12;
     const SECRET_PEPPER = process.env.SECRET_PEPPER || "";

     return {
          // =============== Login User =============== //
          /**
           * Authenticates user with username or email and password.
           * Returns a JWT token for authenticated users.
           */
          loginUser: async (request, reply) => {
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
                    await BanController.linking(db, user.user_id, deviceId, ip);

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
          },

          // =============== Create User =============== //
          /**
           * Registers a new user with username, email, and password.
           * Assigns a random profile image and creates a wallet.
           */
          createUser: async (request, reply) => {
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
                         await BanController.linking(db, user.user_id, deviceId, ip);

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
          },

          // =============== Delete User =============== //
          /**
           * Deletes a user by verifying username and password using the database.
           */
          deleteUser: async (request, reply) => {
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
          },
          // =============== Modify User =============== //
          /**
           * modify user img, username, password etc...
           * need JWT token for authenticated user.
           */
          modifyUser: async (request, reply) => {
               try {
                    const userInfo = request.userInfo;

                    const ALLOWED_IMAGE = new Set([
                         "image/jpeg",
                         "image/png",
                         "image/gif",
                         "image/bmp",
                         "image/jpg",
                         "image/webp",
                    ]);

                    // --- FASTIFY MULTIPART (igual estilo que addProduct) ---
                    const parts = request.parts();
                    const body = {};
                    let image = null;

                    for await (const part of parts) {
                         if (part.type === "file") {
                         const fileBuffer = await part.toBuffer(); // <-- CLAVE: consume el stream
                         if (!fileBuffer || fileBuffer.length === 0) {
                              return reply.code(400).send({ error: `${part.fieldname} is empty (0 bytes)` });
                         }

                         if (part.fieldname === "image") {
                              image = {
                              buffer: fileBuffer,
                              mimetype: part.mimetype,
                              filename: part.filename || part.originalFilename || "image",
                              };
                         }
                         } else {
                         body[part.fieldname] = part.value;
                         }
                    }

                    const { username, email, description, password, security } = body;

                    if (image && !ALLOWED_IMAGE.has(image.mimetype)) {
                         return reply.code(400).send({ error: `Unsupported image type: ${image.mimetype}. Please upload Other Type.` });
                    }

                    // Verify Password from user
                    const valid_password = `
                         SELECT password 
                         FROM Users 
                         WHERE user_id = ?
                    `;

                    const response = await db(valid_password, [userInfo.id]);
                    const isvalid = await bcrypt.compare(security + (SECRET_PEPPER), response[0].password);


                    if (!isvalid) {
                         return reply.code(401).send({ message: "Incorrect password" });
                    }

                    let duplicateField = null;
                    // Verificar si el username o email ya existen (pero no el del usuario actual)
                    const exist_credential = `
                         SELECT 
                         CASE 
                              WHEN username = ? THEN 'username' 
                              WHEN email = ? THEN 'email' 
                              ELSE NULL 
                         END AS duplicateField
                         FROM Users
                         WHERE (username = ? OR email = ?) AND user_id != ?
                    `;

                    try {
                         if (description) {
                              let error = conditional.description_conditional(description);
                              if (error) return reply.code(400).send({ error });
                         }
                         if (email) {
                              let error = conditional.email_conditional(email);
                              if (error) return reply.code(400).send({ error });
                         }
                         if (password) {
                              let error = conditional.password_conditional(password);
                              if (error) return reply.code(400).send({ error });
                         }
                         if (username) {
                              let error = conditional.username_conditional(username);
                              if (error) return reply.code(400).send({ error });
                         }

                         if (username || email) {
                         if (duplicateField) {
                              const result = await db(exist_credential, [username, email, username, email, userInfo.id]);
                              if (result[0].duplicateField === 'username') {
                              return reply.code(400).send({ message: 'El nombre de usuario ya está en uso' });
                              }
                              if (result[0].duplicateField === 'email') {
                              return reply.code(400).send({ message: 'El correo electrónico ya está en uso' });
                              }
                         }
                         }

                         //Si se ha enviado una imagen, analizar su contenido
                         // if (image) {
                         //      const client = new vision.ImageAnnotatorClient({
                         //           apiKey: process.env.GOOGLE_VISION
                         //      });

                         //      const encodedImage = image.buffer.toString("base64");

                         //      // Llamar a la API de Google Vision para la detección de contenido explícito
                         //      const [result] = await client.safeSearchDetection({
                         //           image: { content: encodedImage },
                         //      });

                         //      const safeSearch = result.safeSearchAnnotation;
                         //      console.log(safeSearch);

                         //      if (
                         //           safeSearch.adult === "VERY_LIKELY" ||
                         //           safeSearch.violence === "VERY_LIKELY" ||
                         //           safeSearch.medical == "VERY_LIKELY" ||
                         //           safeSearch.medical == "LIKELY"
                         //      ) {
                         //           return reply.code(401).send({ message: "inappropriate image" });
                         //      }
                         // }

                         // Encriptar la contraseña si se actualiza
                         if (password) {
                         const hashedPassword = bcrypt.hashSync(password + SECRET_PEPPER, BCRYPT_COST);
                         // antes usabas request.body.password; ahora body.password
                         body.password = hashedPassword;
                         }

                         let updatedFields = { username, email, description, password: body.password };

                         if (image) {
                         // subir a cloudinary desde buffer (como en addProduct)
                         const uploadToCloudinary = (buffer, options) =>
                              new Promise((resolve, reject) => {
                              const up = ci.v2.uploader.upload_stream(options, (err, result) => {
                              if (err) reject(err);
                              else resolve(result);
                              });
                              up.end(buffer);
                              });

                         const result = await uploadToCloudinary(image.buffer, {
                              folder: 'images',
                              resource_type: 'image',
                         });

                         updatedFields.img = result.secure_url;

                         const filteredUpdatedFields = Object.fromEntries(
                              Object.entries(updatedFields).filter(([key, value]) => value !== undefined)
                         );

                         const setClause = Object.entries(filteredUpdatedFields)
                              .map(([key, value]) => `${key} = ?`)
                              .join(', ');

                         const query = `UPDATE Users SET ${setClause} WHERE user_id = ?`;

                         await db(query, [...Object.values(filteredUpdatedFields), userInfo.id]);

                         reply.send({ message: 'Datos actualizados correctamente' });
                         } else {
                         const filteredUpdatedFields = Object.fromEntries(
                              Object.entries(updatedFields).filter(([key, value]) => value !== undefined)
                         );

                         const setClause = Object.entries(filteredUpdatedFields)
                              .map(([key, value]) => `${key} = ?`)
                              .join(', ');

                         const query = `UPDATE Users SET ${setClause} WHERE user_id = ?`;

                         await db(query, [...Object.values(filteredUpdatedFields), userInfo.id]);

                         reply.send({ message: 'Datos actualizados correctamente' });
                         }
                    } catch (err) {
                         console.error('Error al verificar o actualizar los datos:', err);
                         return reply.code(500).send({ message: 'Error al procesar la solicitud' });
                    }
                    } catch (error) {
                         console.log(error);
                         return reply.code(401).send({ error: 'Invalid token' });
                    }
               }
          ,
          get_unread: async (request, reply) => {
               const id = request.query.id;
               const query = `
                    SELECT user_id, other_id, unread_count_user_1, unread_count_user_2
                    FROM chat_user_room_status
                    WHERE (user_id = ? OR other_id = ?)
               `;

               const response = await db(query, [id, id]);

               if (response.length === 0) {
               return reply.code(200).send({ unread: 0 });
               } else {
               let totalUnread = 0;

               // recopilar todos los unread correspondientes
               for (let row of response) {
                    if (row.user_id === id) {
                         totalUnread += row.unread_count_user_1;
                    }
                    if (row.other_id === id) {
                         totalUnread += row.unread_count_user_2;
                    }
               }
               return reply.code(200).send({ unread: totalUnread });
               }
          },
          getNotify: async (request,reply) => {
               const userInfo = request.userInfo;

               const q = `
                    SELECT image, price, buyer, title, timestamp
                    FROM Notifications
                    WHERE user_id = ?;
               `
               const response = await db(q,[userInfo.id]);
               const r = `
                    UPDATE Notifications
                    SET unread = FALSE
                    WHERE user_id = ?;
               `
               await db(r,[userInfo.id]);

               return reply.code(200).send(response);
          }
     };
};