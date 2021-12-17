import { Pool } from "pg";
import { InternalExceptionCodes } from "../000_sharedData/exception";
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
    ssl: {
        rejectUnauthorized: false,
    },
});
export const addUserToDB = async (username: string, hashedPassword: string) => {
    let client;
    try {
        const query = {
            text: "INSERT INTO accounts (username, password) VALUES($1, $2)",
            values: [username, hashedPassword],
        };
        client = await pool.connect();
        await client.query(query);
        client.release();
        console.log("[DB][ACCOUNTS] add new user. done");
        return true;
    } catch (exception) {
        client.release();
        console.log("[DB][ACCOUNTS] add new user. exception occurs ", JSON.stringify(exception));
        throw InternalExceptionCodes.INTERNAL_ERROR;
    }
};

export const updateHashedPasswordToDB = async (username: string, hashedPassword: string) => {
    // update
    let client;
    try {
        console.log("[DB][ACCOUNTS] update password");
        const query = {
            text: "UPDATE accounts SET password = $2 WHERE username = $1",
            values: [username, hashedPassword],
        };
        client = await pool.connect();
        await client.query(query);
        client.release();
        console.log("[DB][ACCOUNTS] update password. done");
    } catch (exception) {
        client.release();
        console.log("[DB][ACCOUNTS] update password. exception occurs ", JSON.stringify(exception));
        throw InternalExceptionCodes.INTERNAL_ERROR;
    }
};

export type GetHashedPasswordFromDBResponse = {
    username: string;
    hashedPassword: string;
};
export const getHashedPasswordFromDB = async (username: string): Promise<GetHashedPasswordFromDBResponse[]> => {
    let client;
    try {
        console.log("[DB][ACCOUNTS] get hashedpassword");
        const query = {
            text: "SELECT * FROM accounts WHERE username = $1",
            values: [username],
        };
        client = await pool.connect();
        const res = await client.query(query);
        client.release();

        console.log("[DB][ACCOUNTS] get hashedpassword done");
        const hashedPasswords: GetHashedPasswordFromDBResponse[] = res.rows.map((x) => {
            const res: GetHashedPasswordFromDBResponse = {
                username: x.username,
                hashedPassword: x.password,
            };
            return res;
        });
        return hashedPasswords;
    } catch (exception) {
        client.release();
        console.log("[DB][ACCOUNTS] get hashedpassword. exception occurs ", JSON.stringify(exception));
        throw InternalExceptionCodes.INTERNAL_ERROR;
    }
};
