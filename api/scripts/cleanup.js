import sql from "./db";
export default async function () {
    
    // Clear checkout session token every 
    await sql.pool.execute(`
        DELETE FROM Checkout_id
        WHERE expires_at < NOW()
    `);
    await sql.pool.end();
}
