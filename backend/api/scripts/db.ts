import mysql from "mysql2/promise";
import type { Pool, RowDataPacket } from "mysql2/promise";
import 'dotenv/config';
import { CA_PEM, SQL_PASSWORD } from "../config/env.ts";
import { DB } from "../types/db.type.ts";

// Load environment variables
// ======================== | DB | ======================== //

const db_conection : Pool = mysql.createPool({
     port: 19390,
     host: "mysql-a7f48e8-danieltlegaming-e8c0.h.aivencloud.com",
     user: "avnadmin",
     password: SQL_PASSWORD,
     database: "defaultdb",
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0,
     ssl: { ca: CA_PEM },
});

const db : DB = async <T>( query:string, params: unknown[] = [] ): Promise<T>=>    {
          if(typeof query !== "string" || Array.isArray(params)) {
               throw new Error("Invalid type query in db");
          }
          const [rows] = await db_conection.execute<RowDataPacket[]>(query, params);
          return rows as T;
     }
export {db, db_conection as pool };