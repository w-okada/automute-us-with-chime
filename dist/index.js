"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCAL_DEV = void 0;
const chimeApi_1 = require("./012_chime/chimeApi");
const socketIO_1 = require("./013_socketIO/socketIO");
// import * as express from "express";
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const slackApp_1 = require("./010_slack/slackApp");
const roomInfoDao_1 = require("./002_dao/roomInfoDao");
const rest_1 = require("./011_rest/rest");
exports.LOCAL_DEV = false;
// export const LOCAL_DEV = true;
const port = Number(process.env.PORT) || 3000;
console.log(`[MAIN] START APP, PORT:${port}`);
const startServer = async () => {
    await (0, roomInfoDao_1.loadAllRooms)();
    if (process.env.SLACK_SIGNING_SECRET && process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET && process.env.SLACK_STATE_SECRET) {
        console.log("SLACK FEDERATION MODE");
        const { server, receiver } = await (0, slackApp_1.startSlackApp)(port);
        const STATIC_PATH = __dirname + "/../frontend/dist/";
        receiver.app.use("/static", express_1.default.static(STATIC_PATH));
        console.log(`[SLACK APP] static path: ${STATIC_PATH}`);
        receiver.app.use(express_1.default.json());
        (0, rest_1.setupRestApi)(receiver.app);
        (0, chimeApi_1.setupChimeApi)(receiver.app);
        (0, socketIO_1.setupSocketIO)(server);
    }
    else {
        console.log("NORMAL MODE");
        const app = (0, express_1.default)();
        (0, rest_1.setupRestApi)(app);
        (0, chimeApi_1.setupChimeApi)(app);
        const server = new https_1.default.Server(app);
        app.listen(port, () => {
            console.log(`Express Server Listen START at port=${port}`);
        });
        (0, socketIO_1.setupSocketIO)(server);
    }
};
startServer();
