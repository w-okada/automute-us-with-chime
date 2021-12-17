"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCAL_DEV = void 0;
const chimeApi_1 = require("./012_chime/chimeApi");
const socketIO_1 = require("./013_socketIO/socketIO");
const express = __importStar(require("express"));
const slackApp_1 = require("./010_slack/slackApp");
const roomInfoDao_1 = require("./002_dao/roomInfoDao");
const rest_1 = require("./011_rest/rest");
exports.LOCAL_DEV = false;
// export const LOCAL_DEV = true;
const port = Number(process.env.PORT) || 3000;
console.log(`[MAIN] START APP, PORT:${port}`);
const startServer = async () => {
    await (0, roomInfoDao_1.loadAllRooms)();
    const { server, receiver } = await (0, slackApp_1.startSlackApp)(port);
    const STATIC_PATH = __dirname + "/../frontend/dist/";
    receiver.app.use("/static", express.static(STATIC_PATH));
    console.log(`[SLACK APP] static path: ${STATIC_PATH}`);
    receiver.app.use(express.json());
    (0, rest_1.setupRestApi)(receiver);
    (0, chimeApi_1.setupChimeApi)(receiver);
    (0, socketIO_1.setupSocketIO)(server);
};
startServer();
