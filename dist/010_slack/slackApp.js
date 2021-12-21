"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSlackApp = void 0;
const bolt_1 = require("@slack/bolt");
const auth_1 = require("./auth");
const cors_1 = __importDefault(require("cors"));
const roomInfoDao_1 = require("../002_dao/roomInfoDao");
const blocks_1 = require("./blocks");
const roomInfoData_1 = require("../001_data/roomInfoData");
const uuid_1 = require("uuid");
const __1 = require("..");
const userToken_1 = require("../003_token/userToken");
const exception_1 = require("../000_sharedData/exception");
const BASE_URL = process.env.APP_HEROKU_URL;
const startSlackApp = async (port) => {
    // (1) Express Receiver setting
    //// (1-1) Slac Basic setting
    const receiver = new bolt_1.ExpressReceiver({
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        endpoints: `/slack/events`,
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        stateSecret: process.env.SLACK_STATE_SECRET,
        scopes: ["chat:write", "commands", "users:read"],
        installationStore: {
            storeInstallation: async (installation) => {
                (0, auth_1.addTeamInformation)(installation);
                return;
            },
            fetchInstallation: async (installQuery) => {
                return (0, auth_1.fetchInstallation)(installQuery);
            },
            deleteInstallation: async (installQuery) => {
                (0, auth_1.deleteInstallation)(installQuery);
                return;
            },
        },
        installerOptions: {
            directInstall: true,
        },
    });
    receiver.app.use((0, cors_1.default)());
    //// (1-2) Create App
    const config = {
        receiver,
        customRoutes: [
            {
                path: "/h",
                method: ["GET"],
                handler: (req, res) => {
                    res.writeHead(200);
                    res.end("Health check information displayed here!");
                },
            },
        ],
    };
    const app = new bolt_1.App(config);
    //// (1-3) Slack App setting
    ////// (1-3-1) helper funcs
    const generateUserInformationFromSlack = async (token, body, action) => {
        console.log("body", JSON.stringify(body));
        console.log("action", JSON.stringify(action));
        // @ts-ignore
        const roomName = action.value;
        console.log("RoomName", roomName);
        const teamId = body.team.id;
        const channelId = body.channel.id;
        const channelName = body.channel.name;
        const userId = body.user.id;
        // @ts-ignore
        const userName = body.user.username;
        const userInfo = await app.client.users.info({ user: userId, token: token });
        const imageUrl = userInfo["user"]["profile"]["image_192"];
        const user = {
            roomName,
            teamId,
            channelId,
            channelName,
            userId,
            userName,
            imageUrl,
        };
        return user;
    };
    const generateChimeUrl = (userInfo) => {
        const encInfo = (0, userToken_1.generateUserToken)(userInfo);
        let url;
        if (__1.LOCAL_DEV) {
            url = `https://localhost:3000/index.html?slack_token=${encInfo}`;
        }
        else {
            url = `${BASE_URL}static/index.html?slack_token=${encInfo}`;
        }
        return url;
    };
    ////// (1-3-2) main funcs
    //////// (a) slash command
    app.command("/automute-us-with-chime", async ({ command, ack, say }) => {
        await ack();
        const teamToken = await (0, auth_1.fetchToken)(command.team_id);
        // //// helpを入力された場合
        // if (command.text === "help") {
        //     const helpBlocks = generateHelpBlocks();
        //     app.client.chat.postEphemeral({
        //         channel: command.channel_id,
        //         blocks: helpBlocks,
        //         user: command.user_id,
        //         token: token,
        //     });
        //     return;
        // }
        /// 通常ケース
        const roomName = command.text;
        try {
            const roomInfo = await (0, roomInfoDao_1.generateNewRoom)(roomName, command.team_id, command.channel_id, command.channel_name, "Not yet ts");
            const controlBlocks = (0, blocks_1.generateControlBlocks)(roomInfo);
            console.log("teamtoken::", teamToken);
            const msg = {
                // @ts-ignore
                channel: command.channel_id,
                // token: process.env.SLACK_BOT_TOKEN,
                token: teamToken,
                blocks: controlBlocks,
                text: "rendering failed??",
            };
            const postResult = await app.client.chat.postMessage(msg);
            console.log("teamtoken:11:");
            const ts = postResult.ts;
            roomInfo.ts = ts;
            await (0, roomInfoData_1.updateRoomToDB)(roomInfo);
            console.log("teamtoken:22:", teamToken);
        }
        catch (exception) {
            console.log("teamtoken:exception:", exception);
            if (exception === exception_1.InternalExceptionCodes.ROOM_ALREADY_EXISTS) {
                app.client.chat.postEphemeral({
                    channel: command.channel_id,
                    text: `ROOM[${roomName}] already exists`,
                    user: command.user_id,
                    token: teamToken,
                });
            }
        }
    });
    //////// (b) Join button clicked.
    app.action("join", async ({ body, action, ack, logger }) => {
        await ack();
        const token = await (0, auth_1.fetchToken)(body.team.id);
        const userInfo = await generateUserInformationFromSlack(token, body, action);
        if (!userInfo.roomName) {
            app.client.chat.postEphemeral({
                channel: userInfo.channelId,
                text: `ROOM[${userInfo.roomName}] not found`,
                user: userInfo.userId,
                token: token,
            });
            return;
        }
        const chimeInfo = {
            attendeeName: userInfo.userName,
            useDefault: true,
        };
        userInfo.chimeInfo = chimeInfo;
        const amongusInfo = {
            connectCode: (0, uuid_1.v4)(),
        };
        userInfo.amongusInfo = amongusInfo;
        const url = generateChimeUrl(userInfo);
        const res = await app.client.views.open({
            // @ts-ignore
            trigger_id: body.trigger_id,
            token: token,
            view: (0, blocks_1.generateJoinModal)(userInfo, url),
        });
        if (!res.ok) {
            logger.info(`Failed to open a modal - ${JSON.stringify(res)}`);
        }
        return;
    });
    //////// (c) Join Modal
    /** ckick */
    // app.view("join_modal", async ({ payload, view, body, ack }) => {
    //     console.log("VIEW_TOP CALLED!");
    //     console.log("payload", JSON.stringify(payload));
    //     console.log("view", JSON.stringify(view));
    //     console.log("body", JSON.stringify(body));
    //     await ack({
    //         response_action: "update",
    //         view: {
    //             type: "modal",
    //             callback_id: "view_completion",
    //             title: {
    //                 type: "plain_text",
    //                 text: "My paasd-",
    //                 emoji: true,
    //             },
    //             blocks: [],
    //         },
    //     });
    // });
    /** close action */
    app.view({ callback_id: "join_modal", type: "view_closed" }, async ({ ack, logger }) => {
        logger.info("view_top closed.");
        await ack();
    });
    /** change paramater action */
    const joinActionPattern = `${blocks_1.ActionIds.AttendeeNameInputAction}|${blocks_1.ActionIds.DefaultSettingChangeAction}`;
    app.action(new RegExp(joinActionPattern), async ({ body, action, ack, respond }) => {
        await ack();
        const token = await (0, auth_1.fetchToken)(body.team.id);
        // @ts-ignore
        const actionId = action.action_id;
        // @ts-ignore
        const userInfo = JSON.parse(body.view.private_metadata);
        if (actionId === blocks_1.ActionIds.AttendeeNameInputAction) {
            // @ts-ignore
            userInfo.chimeInfo.attendeeName = action.value;
        }
        else if (actionId === blocks_1.ActionIds.DefaultSettingChangeAction) {
            // @ts-ignore
            const selected = action.selected_options.filter((x) => {
                return x.value === "use-default";
            });
            if (selected.length > 0) {
                userInfo.chimeInfo.useDefault = true;
            }
            else {
                userInfo.chimeInfo.useDefault = false;
            }
        }
        else {
            console.log(`unknown action id... ${actionId}`);
        }
        const url = generateChimeUrl(userInfo);
        app.client.views.update({
            view_id: body.view.id,
            view: (0, blocks_1.generateJoinModal)(userInfo, url),
            hash: body.view.hash,
            token: token,
        });
        return;
    });
    /** enter clicked action (Currently nop) */
    app.action(blocks_1.ActionIds.EnterMeeting, async ({ body, action, ack, respond }) => {
        console.log("Enter Meeting clicked!");
        ack();
        // Todo: How to close modal...?
    });
    const server = await app.start(port);
    return { server, receiver };
};
exports.startSlackApp = startSlackApp;
