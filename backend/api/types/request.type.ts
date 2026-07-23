import { FastifyRequest } from "fastify";
import { UUID } from "node:crypto";

export interface IdQuery {
     id: UUID;
}
export interface IdBody {
     id: UUID
}

export type UploadRequest = FastifyRequest & {
     file?: Express.Multer.File;
}