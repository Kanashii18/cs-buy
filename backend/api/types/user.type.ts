import { UUID } from "node:crypto";
export type User_ID = UUID;

export type JWT_Scheme = 
     {
          id:UUID,
          img:string,
          username:string,
          role: "admin"|"customer"
     }
export type User = {
          id:UUID,
          img:string,
          username:string,
          role: "admin"|"customer"
     };
export type User_Scheme = 
     {
          id:UUID,
          img:string,
          username:string,
          role: "admin"|"customer"
     }|{ loggedIn: false };