export type DB = <T>(
     query:string,
     params:unknown[]
) => Promise<T>;