import conditional from "../../../../modules/user_functions/conditional";

// =============== Modify User =============== //
/**
 * modify user img, username, password etc...
 * need JWT token for authenticated user.
 */
export default async ({db, request, reply, ci}) => {
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