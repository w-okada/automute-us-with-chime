import { setupChimeApi } from "./012_chime/chimeApi";
import { setupSocketIO } from "./013_socketIO/socketIO";
import * as express from "express";
import { startSlackApp } from "./010_slack/slackApp";
import { loadAllRooms } from "./002_dao/roomInfoDao";
import { setupRestApi } from "./011_rest/rest";

export const LOCAL_DEV = false;
// export const LOCAL_DEV = true;

const port: number = Number(process.env.PORT) || 3000;

console.log(`[MAIN] START APP, PORT:${port}`);

const startServer = async () => {
    await loadAllRooms();

    const { server, receiver } = await startSlackApp(port);
    const STATIC_PATH = __dirname + "/../frontend/dist/";
    receiver.app.use("/static", express.static(STATIC_PATH));
    console.log(`[SLACK APP] static path: ${STATIC_PATH}`);

    receiver.app.use(express.json());
    setupRestApi(receiver);
    setupChimeApi(receiver);
    setupSocketIO(server);
};

startServer();
