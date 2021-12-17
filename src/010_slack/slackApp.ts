import { App, AppOptions, BlockAction, BlockElementAction, DialogSubmitAction, ExpressReceiver, Installation, InstallationQuery, InteractiveAction, SlackAction, View, WorkflowStepEdit } from "@slack/bolt";
import { addTeamInformation, deleteInstallation, fetchInstallation, fetchToken } from "./auth";
import cors from "cors";
import { AmongusInfo, ChimeInfo, UserInformation } from "../000_sharedData/userInfo";
import { generateNewRoom } from "../002_dao/roomInfoDao";
import { ActionIds, generateControlBlocks, generateJoinModal } from "./blocks";
import { updateRoomToDB } from "../001_data/roomInfoData";
import { v4 } from "uuid";
import { LOCAL_DEV } from "..";
import { generateUserToken } from "../003_token/userToken";
import { InternalExceptionCodes } from "../000_sharedData/exception";

const BASE_URL = process.env.APP_HEROKU_URL;

// (1) Express Receiver setting
//// (1-1) Slac Basic setting
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: `/slack/events`,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    scopes: ["chat:write", "commands", "users:read"],
    installationStore: {
        storeInstallation: async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
            addTeamInformation(installation);
            return;
        },
        fetchInstallation: async (installQuery: InstallationQuery<boolean>) => {
            return fetchInstallation(installQuery);
        },
        deleteInstallation: async (installQuery: InstallationQuery<boolean>) => {
            deleteInstallation(installQuery);
            return;
        },
    },
    installerOptions: {
        directInstall: true,
    },
});
receiver.app.use(cors());

//// (1-2) Create App
const config: AppOptions = {
    receiver,
};
const app = new App(config);

//// (1-3) Slack App setting
////// (1-3-1) helper funcs
const generateUserInformationFromSlack = async (token: string, body: SlackAction, action: DialogSubmitAction | WorkflowStepEdit | BlockElementAction | InteractiveAction): Promise<UserInformation> => {
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

    const user: UserInformation = {
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

const generateChimeUrl = (userInfo: UserInformation) => {
    const encInfo = generateUserToken(userInfo);
    let url;
    if (LOCAL_DEV) {
        url = `https://localhost:3000/index.html?slack_token=${encInfo}`;
    } else {
        url = `${BASE_URL}static/index.html?slack_token=${encInfo}`;
    }
    return url;
};

////// (1-3-2) main funcs
//////// (a) slash command
app.command("/automute-us", async ({ command, ack, say }) => {
    await ack();
    const teamToken = await fetchToken(command.team_id);
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
        const roomInfo = await generateNewRoom(roomName, command.team_id, command.channel_id, command.channel_name, "Not yet ts");
        const controlBlocks = generateControlBlocks(roomInfo);

        const msg = {
            // @ts-ignore
            channel: command.channel_id,
            // token: process.env.SLACK_BOT_TOKEN,
            token: teamToken,
            blocks: controlBlocks,
            text: "rendering failed??",
        };

        const postResult = await app.client.chat.postMessage(msg);
        const ts = postResult.ts;
        roomInfo.ts = ts;
        await updateRoomToDB(roomInfo);
    } catch (exception) {
        if (exception === InternalExceptionCodes.ROOM_ALREADY_EXISTS) {
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
    const token = await fetchToken(body.team.id);
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

    const chimeInfo: ChimeInfo = {
        attendeeName: userInfo.userName,
        useDefault: true,
    };
    userInfo.chimeInfo = chimeInfo;
    const amongusInfo: AmongusInfo = {
        connectCode: v4(),
    };
    userInfo.amongusInfo = amongusInfo;
    const url = generateChimeUrl(userInfo);

    const res = await app.client.views.open({
        // @ts-ignore
        trigger_id: body.trigger_id,
        token: token,
        view: generateJoinModal(userInfo, url) as View,
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
const joinActionPattern = `${ActionIds.AttendeeNameInputAction}|${ActionIds.DefaultSettingChangeAction}`;
app.action(new RegExp(joinActionPattern), async ({ body, action, ack, respond }) => {
    await ack();
    const token = await fetchToken(body.team.id);
    // @ts-ignore
    const actionId = action.action_id;
    // @ts-ignore
    const userInfo = JSON.parse(body.view.private_metadata) as UserInformation;

    if (actionId === ActionIds.AttendeeNameInputAction) {
        // @ts-ignore
        userInfo.chimeInfo.attendeeName = action.value;
    } else if (actionId === ActionIds.DefaultSettingChangeAction) {
        // @ts-ignore
        const selected = action.selected_options.filter((x) => {
            return x.value === "use-default";
        });
        if (selected.length > 0) {
            userInfo.chimeInfo.useDefault = true;
        } else {
            userInfo.chimeInfo.useDefault = false;
        }
    } else {
        console.log(`unknown action id... ${actionId}`);
    }

    const url = generateChimeUrl(userInfo);

    app.client.views.update({
        view_id: (body as BlockAction).view.id,
        view: generateJoinModal(userInfo, url) as View,
        hash: (body as BlockAction).view.hash,
        token: token,
    });
    return;
});

/** enter clicked action (Currently nop) */
app.action(ActionIds.EnterMeeting, async ({ body, action, ack, respond }) => {
    console.log("Enter Meeting clicked!");
    ack();
    // Todo: How to close modal...?
});

export const startSlackApp = async (port: number) => {
    const server = await app.start(port);
    return { server, receiver };
};
