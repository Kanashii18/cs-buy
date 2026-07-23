import type { UUID } from "node:crypto";
import type { RowDataPacket } from "mysql2";

export interface UserRow {
     user_id: UUID, 
     username: string,
     role: "customer"|"admin",
     img: string|null
}

