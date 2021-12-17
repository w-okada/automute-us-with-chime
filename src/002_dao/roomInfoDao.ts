import { InternalExceptionCodes } from "../000_sharedData/exception";
import { RoomInfo } from "../000_sharedData/room";
import { loadAllRoomsFromDB, saveNewRoomToDB, updateRoomToDB } from "../001_data/roomInfoData";

let roomInfos: { [roomName: string]: RoomInfo } = {};

const TTL = 24 * 60 * 60;

export const loadAllRooms = async () => {
    roomInfos = await loadAllRoomsFromDB();
    console.log("LOAD ROOM INFOS", roomInfos);
};

export const generateNewRoom = async (roomName: string, teamId: string, channelId: string, channelName: string, ts: string) => {
    if (roomInfos[roomName]) {
        throw InternalExceptionCodes.ROOM_ALREADY_EXISTS;
    }
    const roomInfo: RoomInfo = {
        roomName: roomName,
        teamId: teamId,
        channelId: channelId,
        channelName: channelName,
        ts: ts,
        ttl: new Date().getTime() / 1000 + TTL,
        attendees: [],
    };
    saveNewRoomToDB(roomInfo);
    roomInfos[roomName] = roomInfo;
    return roomInfo;
};

export const getRoomInfo = (roomName: string) => {
    return roomInfos[roomName];
};

export const updateRoom = async (roomInfo: RoomInfo) => {
    await updateRoomToDB(roomInfo);
};
