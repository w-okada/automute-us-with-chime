"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHashedPasswordFromDB = exports.updateHashedPasswordToDB = exports.addUserToDB = void 0;
const pg_1 = require("pg");
const exception_1 = require("../000_sharedData/exception");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
    ssl: {
        rejectUnauthorized: false,
    },
});
const addUserToDB = async (username, hashedPassword) => {
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
    }
    catch (exception) {
        client.release();
        console.log("[DB][ACCOUNTS] add new user. exception occurs ", JSON.stringify(exception));
        throw exception_1.InternalExceptionCodes.INTERNAL_ERROR;
    }
};
exports.addUserToDB = addUserToDB;
const updateHashedPasswordToDB = async (username, hashedPassword) => {
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
    }
    catch (exception) {
        client.release();
        console.log("[DB][ACCOUNTS] update password. exception occurs ", JSON.stringify(exception));
        throw exception_1.InternalExceptionCodes.INTERNAL_ERROR;
    }
};
exports.updateHashedPasswordToDB = updateHashedPasswordToDB;
const getHashedPasswordFromDB = async (username) => {
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
        const hashedPasswords = res.rows.map((x) => {
            const res = {
                username: x.username,
                hashedPassword: x.password,
            };
            return res;
        });
        return hashedPasswords;
    }
    catch (exception) {
        client.release();
        console.log("[DB][ACCOUNTS] get hashedpassword. exception occurs ", JSON.stringify(exception));
        throw exception_1.InternalExceptionCodes.INTERNAL_ERROR;
    }
};
exports.getHashedPasswordFromDB = getHashedPasswordFromDB;
