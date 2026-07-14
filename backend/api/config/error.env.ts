import type { Error_env } from "../types/config_types/errors_type.ts";
import type { Dev_Mode } from "../types/config_types/values_type.ts";

export default function set_error (indicated : string, value : Error_env | Dev_Mode ) { throw new Error(`${indicated} ${value}`)};
