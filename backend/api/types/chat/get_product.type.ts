import { UUID } from "node:crypto"

export type ChatQuery = {
     id: UUID,
     actual_user: UUID,
     other_user: UUID
}

export type DbChat = {
     title: string,
     image: string,
     product_id: UUID,
}