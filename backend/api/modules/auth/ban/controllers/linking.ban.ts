import type { Ban } from "../../../../types/modules/bans/bans.type.ts";

//** Link user, device, and IP in the database */
export default async function({db, deviceId, user_id, ip} : Ban.LinkingParams) : Promise<void | {error: string}> {
     if(!user_id && !deviceId || !ip) {
          return {error: "Missing required parameters: user_id, deviceId, and ip are required."};
     } 
     await db(`INSERT IGNORE INTO Devices (device_id) VALUES (?)`, [deviceId]);
     await db(`INSERT INTO UserDevices (user_id, device_id) VALUES (?, ?)
               ON DUPLICATE KEY UPDATE last_seen = NOW()`,
          [user_id, deviceId]
     );
     await db(
          `INSERT INTO DeviceIPs (device_id, ip) VALUES (?, ?)
               ON DUPLICATE KEY UPDATE last_seen = NOW()`,
          [deviceId, ip]
     );
}