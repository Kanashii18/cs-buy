import fs from 'fs';
import mysql from "mysql2/promise";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
// ======================== | DB | ======================== //



const pool = mysql.createPool({
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

const db = async(query, params) => {
          const [rows] = await db_conection.execute(query, params);
          return rows;
     }

export {db, pool};

