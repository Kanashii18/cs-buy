import mysql, { Pool } from "mysql2/promise";
import 'dotenv/config';

// Load environment variables
// ======================== | DB | ======================== //

const db_conection : Pool = mysql.createPool({
     port: 19390,
     host: "mysql-a7f48e8-danieltlegaming-e8c0.h.aivencloud.com",
     user: "avnadmin",
     password: process.env.SQL_PASSWORD,
     database: "defaultdb",
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0,
     ssl: { ca: process.env.CA_PEM },
});

const db = async <T>( query:string, params: unknown[] = [] ): Promise<T>=>    {
          if(typeof query !== "string" || Array.isArray(params)) {
               throw new Error("Invalid type query in db");
          }
          const [rows] = await db_conection.execute(query, params);
          return rows as T;
     }

export {db, db_conection as pool };

