import {pool} from "./db.ts";

export default async function (): Promise<void> {
    
    // Clear checkout session token every 
    await pool.execute(`
        DELETE FROM Checkout_id
        WHERE expires_at < NOW()
    `);
    await pool.end();
}