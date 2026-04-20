import fs from 'fs';

// ========================== || User Checker || ========================== //

export async function user_check(db, request, reply) {
     const userId = request.query.id;

     if (!userId) {
          return reply.status(400).send({ error: 'User id is required' });
     }

     try {
          // Consultar la base de datos usando mysql2
          const query = `
               SELECT user_id, username, img, description
               FROM Users
               WHERE user_id = ?
          `;

          try {
               const results = await db(query, [userId]);

               if (results.length === 0) {
                    return reply.status(404).send({ error: 'User not found' });
               }

               return reply.send(results[0]);
          } catch (err) {
               console.error('Error querying users table:', err);
               return reply.status(500).send({ error: 'Internal server error' });
          }


     } catch (error) {
          console.error('Unexpected error:', error);
          return reply.status(500).send({ error: 'Internal server error' });
     }
     }

     // ========================== || Seller Checker || ========================== //

export async function seller_check(db, request, reply) {
     const { user_id } = request.body; // Extraer user_id del cuerpo de la solicitud

     if (!user_id) {
          return reply.status(400).send({ error: 'user_id is required in request body' });
     }

     try {
          // Consultar la base de datos usando mysql2
          const query = `
               SELECT rate, user_id, username, img
               FROM Users
               WHERE user_id = ?
          `;

          try {
               const results = await db(query, [user_id]);

               if (results.length === 0) {
                    return reply.status(404).send({ error: 'User not found' });
               }
               reply.send(results[0]);
          } catch (err) {
               console.error('Error querying users table:', err);
               return reply.status(500).send({ error: 'Database query error' });
          }

     } catch (error) {
          console.error('Unexpected error:', error);
          reply.status(500).send({ error: 'Database query error' });
     }
}

     export async function setting_check(db, request, reply) {
          const userId = request.query.id;

          if (!userId) {
               return reply.status(400).send({ error: 'User id is required' });
          }

          try {
               const p = `
                    SELECT user_id, username, img, description, email
                    FROM Users
                    WHERE user_id = ?
               `
               const result = await db(p,[userId]);

               if (!result) {
                    console.error('Error querying users table:', err);
                    return reply.status(500).send({ error: 'Internal server error' });
               }

               if (result.length === 0) {
                    return reply.status(404).send({ error: 'User not found' });
               }

               // Devolver los datos
               return reply.send(result[0]);

          } catch (error) {
               console.error('Unexpected error:', error);
               return reply.status(500).send({ error: 'Internal server error' });
          }
     }

export function img_check(db, ci, request, reply) {

     const timestamp = Math.floor(Date.now() / 1000);
     const signature = ci.utils.api_sign_request(
          {
               timestamp: timestamp,
               folder: "imagen_set",
               moderation: "webpurify",
          },
          process.env.CLOUDINARY_API_SECRET
     );
     reply.send({ signature, timestamp });
}
export async function moderation_check (db, ci, request, reply) {
     const imagePath = request.file.path;  // Ruta de la imagen subida (esto depende de cómo subas la imagen)
     
     const model = await loadModel();
     
     const predictions = await analyzeImage(imagePath, model);
     console.log('Predicciones de moderación:', predictions);
     
     const isNSFW = predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';

     if (isNSFW) {
          reply.status(400).send({ message: 'Imagen inapropiada detectada' });
     } else {
          try {
               const uploadResult = await ci.uploader.upload(imagePath, {
                    folder: 'imagen_set',
               });
               
               fs.unlinkSync(imagePath);

               reply.send({
                    message: 'Imagen aprobada y subida a Cloudinary',
                    secure_url: uploadResult.secure_url,
               });
          } catch (uploadError) {
               console.error('Error al subir la imagen a Cloudinary:', uploadError);
               reply.status(500).send({ message: 'Error al subir la imagen a Cloudinary' });
          }
     }
};

export async function profile(db, request, reply) {
     const userId = request.query.id;

     if (!userId) {
          return reply.status(400).send({ error: 'User id is required' });
     }

     try {
          // Consultar la base de datos usando mysql2
          const query = `
               SELECT user_id, username, img, description, accounts_selled, assets_selled, services_selled
               FROM Users
               WHERE user_id = ?
          `;

          try {
          const results = await db(query, [userId]);

          if (results.length === 0) {
               return reply.status(404).send({ error: 'User not found' });
          }

          return reply.send(results[0]);
          } catch (err) {
               console.error('Error querying users table:', err);
               return reply.status(500).send({ error: 'Internal server error' });
          }

     } catch (error) {
          console.error('Unexpected error:', error);
          return reply.status(500).send({ error: 'Internal server error' });
     }
}