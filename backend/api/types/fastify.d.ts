import "fastify"
import type { User } from "./user.type.ts";
import type { UUID } from "node:crypto";

type UserInfo = {
     userInfo : User
} 
declare module "fastify" {
     interface FastifyRequest extends Partial<UserInfo> {}
}
export namespace Body {
     export type user_id = { user_id: UUID };
}