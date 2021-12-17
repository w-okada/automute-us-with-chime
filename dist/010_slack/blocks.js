"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHelpBlocks = exports.generateOpenURLBlocks = exports.generateJoinModal = exports.generateWholeBlocks = exports.generateControlBlocks = exports.ActionIds = void 0;
exports.ActionIds = {
    AttendeeNameInputAction: "AttendeeNameInputAction",
    DefaultSettingChangeAction: "DefaultSettingChangeAction",
    EnterMeeting: "EnterMeeting",
};
const generateControlBlocks = (data) => {
    const blocks = [];
    const headerBlock = {
        type: "header",
        text: {
            type: "plain_text",
            text: `Room[${data.roomName || "ROOM"}] is opened!`,
            emoji: true,
        },
    };
    blocks.push(headerBlock);
    const topBlock1 = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `capture_code:${data.roomName}`,
        },
    };
    blocks.push(topBlock1);
    const topBlock2 = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `please click to enter.`,
        },
    };
    blocks.push(topBlock2);
    const secondBlock = {
        type: "actions",
        elements: [
            {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "join",
                },
                action_id: "join",
                value: data.roomName,
                style: "primary",
            },
        ],
    };
    blocks.push(secondBlock);
    return blocks;
};
exports.generateControlBlocks = generateControlBlocks;
const generateWholeBlocks = (roomInfo) => {
    const controlBlocks = (0, exports.generateControlBlocks)(roomInfo);
    return [...controlBlocks];
};
exports.generateWholeBlocks = generateWholeBlocks;
const generateJoinModal = (userInfo, url) => {
    const intial_options = [];
    if (userInfo.chimeInfo.useDefault) {
        intial_options.push({
            text: {
                type: "mrkdwn",
                text: "Use default setting",
            },
            description: {
                type: "mrkdwn",
                text: "defalut microphone, camera, speaker, etc",
            },
            value: "use-default",
        });
    }
    const block = {
        type: "modal",
        callback_id: "join_modal",
        private_metadata: JSON.stringify(userInfo),
        title: {
            type: "plain_text",
            text: `slack-chime-connect`,
            emoji: true,
        },
        close: {
            type: "plain_text",
            text: "Close",
            emoji: true,
        },
        notify_on_close: true,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `You are going to join "${userInfo.roomName}". Please input your name and configrations.  (if you change the name, please press 'enter' to update join button)`,
                },
            },
            {
                type: "input",
                dispatch_action: true,
                element: {
                    type: "plain_text_input",
                    action_id: exports.ActionIds.AttendeeNameInputAction,
                    initial_value: `${userInfo.chimeInfo.attendeeName}`,
                    dispatch_action_config: {
                        // trigger_actions_on: ["on_character_entered", "on_enter_pressed"],
                        trigger_actions_on: ["on_enter_pressed"],
                    },
                },
                label: {
                    type: "plain_text",
                    text: "User Name",
                    emoji: true,
                },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "Select your favarite.",
                },
                accessory: {
                    type: "checkboxes",
                    options: [
                        {
                            text: {
                                type: "mrkdwn",
                                text: "Use default setting",
                            },
                            description: {
                                type: "mrkdwn",
                                text: "defalut microphone, camera, speaker, etc",
                            },
                            value: "use-default",
                        },
                    ],
                    initial_options: intial_options,
                    action_id: exports.ActionIds.DefaultSettingChangeAction,
                },
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "enter meeting",
                            emoji: true,
                        },
                        url: url,
                        action_id: exports.ActionIds.EnterMeeting,
                    },
                ],
            },
        ],
    };
    return block;
};
exports.generateJoinModal = generateJoinModal;
const generateOpenURLBlocks = (url) => {
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `Open new tab to join the meeting.`,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "openTab",
                },
                url: url,
                action_id: "openTab",
            },
        },
    ];
};
exports.generateOpenURLBlocks = generateOpenURLBlocks;
const generateHelpBlocks = () => {
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `SHOWING HELP`,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "openTab",
                },
                action_id: "openTab",
            },
        },
    ];
};
exports.generateHelpBlocks = generateHelpBlocks;
