import "fastify"
import { User } from "./user.type.ts";

type UserInfo = {
     userInfo : User
} 
declare module "fastify" {
     interface FastifyRequest extends Partial<UserInfo> {}
}