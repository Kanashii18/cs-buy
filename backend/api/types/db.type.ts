import { QueryResult } from "mysql2";

export type DB = <T extends QueryResult>(
     query:string,
     params:unknown[]
) => Promise<T>;