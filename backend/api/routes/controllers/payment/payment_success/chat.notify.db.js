import { randomUUID } from 'crypto';

export default async function finallyOrder(reply, db, product, userInfo, io, users){
     const chat_id = randomUUID();

     const checkQuery = `
          SELECT COUNT(*) AS count
          FROM chat_user_room_status
          WHERE (user_id = ? AND other_id = ?) OR (user_id = ? AND other_id = ?)
     `;

     const chatRoomResult = await db(checkQuery, [userInfo.id, product.user_id, product.user_id, userInfo.id]);

     if (chatRoomResult[0].count === 0) {
          // Create chat
          const query_chat = `
               INSERT INTO chat_user_room_status (
                    id,
                    user_id,
                    other_id,
                    listing_id,
                    timestamp
               )
               VALUES (?, ?, ?, ?, ?)
          `;
          await db(query_chat, [
               chat_id,
               userInfo.id,
               product.user_id,
               product.product_id,
               new Date().toISOString().slice(0, 19).replace('T', ' ')
          ]);
     }

     const notification = `
          INSERT INTO Notifications (
               id,
               user_id,
               product_id,
               image,
               title,
               price,
               buyer
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
     `;

     const id = randomUUID();

     // console.table([
     //      product.user_id,
     //      product.product_id,
     //      product.image,
     //      product.title,
     //      product.price,
     //      userInfo.username,
     // ])
     // console.log(product);

     await db(notification, [
          id,
          product.user_id,
          product.product_id,
          product.image,
          product.title,
          product.price,
          userInfo.username,
     ]);
     const receiverSocketId = users[product.user_id];
     if (receiverSocketId) {
          const receiverSocket = io.sockets.sockets.get(receiverSocketId);
          if (receiverSocket) {
               console.log(`Socket ${product.user_id} enviado`);
               receiverSocket.emit('notification', {receiver: product.user_id,
                                                       message:'buyed',
                                                       quantity:1}); // Enviamos el mensaje
          } else {
               console.log(`Socket ${product.user_id} no está conectado.`);
          }
     } else {
          console.log(`Usuario ${product.user_id} no encontrado.`);
     }
}