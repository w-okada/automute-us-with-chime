"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllRoomsFromDB = exports.deleteRoomFromDB = exports.updateRoomToDB = exports.saveNewRoomToDB = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
///////////////////////////
// (1) ROOM
///////////////////////////
const saveNewRoomToDB = async (roomInfo) => {
    let client;
    try {
        console.log("[DB][ROOMS] generate new room");
        const query = {
            text: "INSERT INTO rooms (room_name, room_info) VALUES($1, $2)",
            values: [roomInfo.roomName, JSON.stringify(roomInfo)],
        };
        client = await pool.connect();
        await client.query(query);
        client.release();
        console.log("[DB][ROOMS] generate new room done");
        return roomInfo;
    }
    catch (exception) {
        console.log("[DB][ROOMS] generate new room. exception occurs ", JSON.stringify(exception));
        client.release();
    }
};
exports.saveNewRoomToDB = saveNewRoomToDB;
const updateRoomToDB = async (roomInfo) => {
    let client;
    try {
        console.log("[DB][ROOMS] update room.");
        const query = {
            text: "UPDATE rooms SET room_info = $2 WHERE room_name = $1",
            values: [roomInfo.roomName, JSON.stringify(roomInfo)],
        };
        client = await pool.connect();
        await client.query(query);
        client.release();
        console.log("[DB][ROOMS] update room done.");
    }
    catch (exception) {
        client.release();
        console.log("[DB][ROOMS] update room done. exception occurs", JSON.stringify(exception));
    }
};
exports.updateRoomToDB = updateRoomToDB;
const deleteRoomFromDB = async () => {
    console.log("[DB][ROOMS] delete room not implemented.");
    throw new Error("[DB][ROOMS] delete room not implemented.");
};
exports.deleteRoomFromDB = deleteRoomFromDB;
const loadAllRoomsFromDB = async () => {
    let client;
    const roomInfos = {};
    try {
        console.log(`[DB] load all rooms`);
        const query = {
            text: "SELECT * FROM rooms",
        };
        client = await pool.connect();
        const res = await client.query(query);
        res.rows.forEach((record) => {
            const roomInfo = JSON.parse(record.room_info);
            roomInfos[roomInfo.roomName] = roomInfo;
        });
        client.release();
        console.log(`[DB] load all rooms. done. room num ${Object.keys(roomInfos).length}`);
    }
    catch (exception) {
        client.release();
        console.log(`[DB] load all rooms. exception ${JSON.stringify(exception)}`);
    }
    try {
        console.log(`[DB] delete old rooms`);
        for (const roomName of Object.keys(roomInfos)) {
            const currentTime = new Date().getTime() / 1000;
            if (roomInfos[roomName].ttl < currentTime) {
                const query = {
                    text: "DELETE FROM rooms WHERE room_name = $1",
                    values: [roomName],
                };
                client = await pool.connect();
                const res = await client.query(query);
                delete roomInfos[roomName];
                client.release();
            }
        }
        console.log(`[DB] delete old rooms. done. room num ${Object.keys(roomInfos).length}`);
    }
    catch (exception) {
        client.release();
        console.log(`[DB] delete old rooms. exception ${JSON.stringify(exception)}`);
    }
    return roomInfos;
};
exports.loadAllRoomsFromDB = loadAllRoomsFromDB;
