export default async function({db, request, reply}){
     const deviceId = request.deviceId;
     const userId = request.userId;
     if(!deviceId | !userId) {
          return reply.code(404).send("Unauthenticated");
     } 
     await db(`INSERT IGNORE INTO Devices (device_id) VALUES (?)`, [deviceId]);
     await db(`INSERT INTO UserDevices (user_id, device_id) VALUES (?, ?)
               ON DUPLICATE KEY UPDATE last_seen = NOW()`,
          [userId, deviceId]
     );
     await db(
          `INSERT INTO DeviceIPs (device_id, ip) VALUES (?, ?)
               ON DUPLICATE KEY UPDATE last_seen = NOW()`,
          [deviceId, request.ip]
     );
}