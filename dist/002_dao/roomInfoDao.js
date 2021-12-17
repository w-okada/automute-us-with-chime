"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoom = exports.getRoomInfo = exports.generateNewRoom = exports.loadAllRooms = void 0;
const exception_1 = require("../000_sharedData/exception");
const roomInfoData_1 = require("../001_data/roomInfoData");
let roomInfos = {};
const TTL = 24 * 60 * 60;
const loadAllRooms = async () => {
    roomInfos = await (0, roomInfoData_1.loadAllRoomsFromDB)();
    console.log("LOAD ROOM INFOS", roomInfos);
};
exports.loadAllRooms = loadAllRooms;
const generateNewRoom = async (roomName, teamId, channelId, channelName, ts) => {
    if (roomInfos[roomName]) {
        throw exception_1.InternalExceptionCodes.ROOM_ALREADY_EXISTS;
    }
    const roomInfo = {
        roomName: roomName,
        teamId: teamId,
        channelId: channelId,
        channelName: channelName,
        ts: ts,
        ttl: new Date().getTime() / 1000 + TTL,
        attendees: [],
    };
    (0, roomInfoData_1.saveNewRoomToDB)(roomInfo);
    roomInfos[roomName] = roomInfo;
    return roomInfo;
};
exports.generateNewRoom = generateNewRoom;
const getRoomInfo = (roomName) => {
    return roomInfos[roomName];
};
exports.getRoomInfo = getRoomInfo;
const updateRoom = async (roomInfo) => {
    await (0, roomInfoData_1.updateRoomToDB)(roomInfo);
};
exports.updateRoom = updateRoom;
