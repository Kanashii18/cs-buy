import type { Error_env } from "../types/config_types/errors_type.ts";
import type { Dev_Mode } from "../types/config_types/values_type.ts";
import "dotenv/config";

const set_error = (indicated : string, value : Error_env | Dev_Mode ) =>{ throw new Error(`${indicated} ${value}`)};

// PORT

const PORT_crude = process.env.PORT;
if(typeof PORT_crude !== 'string')
set_error("PORT","Invalid type value");

const PORT = Number(PORT_crude);
if (!Number.isInteger(PORT)) 
set_error("PORT","Need to be an integer");

// DEV

const DEV_MODE = process.env.DEV_MODE as Dev_Mode; // we expect production | testing
if (typeof DEV_MODE !== 'string')
set_error("DEV_MODE", "Invalid type value");

if (DEV_MODE!=="production" && DEV_MODE!=="testing") 
set_error("DEV_MODE",`Invalid DEV value, expect "production" or "testing"` as Dev_Mode)

const Dev : boolean = DEV_MODE === "production" as Dev_Mode ? true : false;
if (typeof Dev !== 'boolean')
set_error("DEV_MODE", "Invalid type value");

// SECRET_KEY

const SECRET_KEY = process.env.SECRET_KEY;
if(typeof SECRET_KEY !== "string") 
set_error("SECRET_KEY","Invalid type value");

// CLOUDINARY

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
if(typeof CLOUDINARY_API_KEY !== "string") 
set_error("CLOUDINARY_API_KEY","Invalid type value");

const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
if(typeof CLOUDINARY_API_SECRET !== "string") 
set_error("CLOUDINARY_API_SECRET","Invalid type value");

export { Dev,PORT,SECRET_KEY,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET};
