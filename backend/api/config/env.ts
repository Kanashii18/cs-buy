import { Error_env } from "../types/config_types/errors_type.js";
import { Dev } from "../types/config_types/values_type.js";

const set_error = (indicated : string, value : Error_env | Dev ) => new Error(`${indicated} ${value}`);

// PORT

const PORT_crude = process.env.PORT;
if(typeof PORT_crude !== 'string'){
     set_error("PORT","Invalid type value");
}
const PORT = Number(PORT_crude);
if (!Number.isInteger(PORT)) {
     set_error("PORT","Need to be an integer");
}

// DEV

const DEV_MODE = process.env.DEV_MODE as Dev; // we expect production | testing
if (typeof DEV_MODE !== 'string') {
     set_error("DEV_MODE", "Invalid type value");
}
if (DEV_MODE!=="production" && DEV_MODE!=="testing"){
     set_error("DEV_MODE",`Invalid DEV value, expect "production" or "testing"` as Dev)
}
const DEV : boolean = DEV_MODE === "production" as Dev ? true : false;
if (typeof DEV !== 'boolean') {
     set_error("DEV_MODE", "Invalid type value");
}

export {DEV,PORT};