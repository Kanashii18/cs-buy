import { User_Scheme } from "../user.type.js";

export type Verify_query = {
     session_id: string
}
export type Verify_body = {
     userInfo: User_Scheme;
}