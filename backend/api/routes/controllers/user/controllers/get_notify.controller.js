export default async ({db,request,reply}) => {
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