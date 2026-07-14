import type { Dev_Mode } from "../types/config_types/values_type.ts";

import "dotenv/config";
import set_error from "./error.env.ts";

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

// PAYPAL

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
if(typeof PAYPAL_CLIENT_ID !== "string") 
set_error("PAYPAL_CLIENT_ID","Invalid type value");

const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;
if(typeof PAYPAL_SECRET_KEY !== "string") 
set_error("PAYPAL_SECRET_KEY","Invalid type value");

// STRIPE

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if(typeof STRIPE_SECRET_KEY !== "string") 
set_error("STRIPE_SECRET_KEY","Invalid type value");

// DATABASE

const SQL_PASSWORD = process.env.SQL_PASSWORD;
if(typeof SQL_PASSWORD !== "string") 
set_error("SQL_PASSWORD","Invalid type value");

const CA_PEM = process.env.CA_PEM;
if(typeof CA_PEM !== "string") 
set_error("CA_PEM","Invalid type value");

// GOOGle

const GOOGLE_VISION = process.env.GOOGLE_VISION;
if(typeof GOOGLE_VISION !== "string") 
set_error("GOOGLE_VISION","Invalid type value");


export { 
     Dev,
     PORT,
     SECRET_KEY,
     CLOUDINARY_API_KEY,
     CLOUDINARY_API_SECRET,
     STRIPE_SECRET_KEY, 
     PAYPAL_CLIENT_ID,
     PAYPAL_SECRET_KEY,
     SQL_PASSWORD,
     GOOGLE_VISION,
     CA_PEM
};
