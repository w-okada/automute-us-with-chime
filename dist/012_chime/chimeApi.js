"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChimeApi = void 0;
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const http_1 = require("../000_sharedData/http");
const roomInfoDao_1 = require("../002_dao/roomInfoDao");
const userToken_1 = require("../003_token/userToken");
const chime = new aws_sdk_1.Chime({ region: "us-east-1" });
chime.endpoint = new aws_sdk_1.Endpoint("https://service.chime.aws.amazon.com/console");
const REGION = "ap-northeast-1";
// const Codes = {
//     SUCCESS: "SUCCESS",
//     UNKNOWN_RESOURCE: "UNKNOWN_RESOURCE",
//     UNKNOWN_METHOD: "UNKNOWN_METHOD",
//     TOKEN_ERROR: "TOKEN_ERROR",
//     PARAMETER_ERROR: "PARAMETER_ERROR",
//     NO_SUCH_A_MEETING_ROOM: "NO_SUCH_A_MEETING_ROOM",
//     NO_SUCH_AN_ATTENDEE: "NO_SUCH_AN_ATTENDEE",
// } as const;
// type Code = typeof Codes[keyof typeof Codes];
const authorizer = (header) => {
    console.log(`[CHIME] authorizer.`);
    const token = header.split(",")[1];
    const info = (0, userToken_1.decodeUserToken)(token);
    console.log(`[CHIME] authorizer done.`);
    return info;
};
// const getMeetingInfo = async (meetingName: string, userId: string): Promise<BackendGetMeetingInfoResponse | null> => {
//     console.log(`[CHIME] getMeetingInfo. ${meetingName}`);
//     const roomInfo = await getRoom(meetingName);
//     if (!roomInfo || !roomInfo.meetingInfo) {
//         return null;
//     }
//     const meetingInfo = roomInfo.meetingInfo;
//     try {
//         // Check Exist?
//         const mid = await chime.getMeeting({ MeetingId: meetingInfo.meetingId }).promise();
//         console.log(`[CHIME] getMeetingInfo. retreive from Chime Server succeeded: ${mid.Meeting.MeetingId}`);
//     } catch (err) {
//         console.log(`[CHIME] getMeetingInfo. retreive from Chime Server falied`);
//         roomInfo.meetingInfo = undefined;
//         return null;
//     }
//     const returnValue: BackendGetMeetingInfoResponse = {
//         meetingName: meetingName,
//         meetingId: meetingInfo.meetingId,
//         meeting: meetingInfo.meeting,
//         metadata: meetingInfo.metadata,
//         hmmTaskArn: "-",
//         isOwner: meetingInfo.metadata.ownerId === userId,
//     };
//     return returnValue;
// };
const syncMeetingInfoWithChimeServer = async (roomInfo) => {
    if (!roomInfo || !roomInfo.meetingInfo) {
        return;
    }
    const meetingInfo = roomInfo.meetingInfo;
    try {
        // Check Exist?
        const mid = await chime.getMeeting({ MeetingId: meetingInfo.meetingId }).promise();
        console.log(`[CHIME] getMeetingInfo. retreive from Chime Server succeeded: ${mid.Meeting.MeetingId}`);
    }
    catch (err) {
        console.log(`[CHIME] getMeetingInfo. retreive from Chime Server falied`);
        roomInfo.meetingInfo = undefined;
    }
};
// export const setupChimeApi = (receiver: ExpressReceiver) => {
// export const setupChimeApi = (app: express.Application) => {
const setupChimeApi = (app) => {
    app.post(`/api/chime/meetings`, async (req, res) => {
        console.log(`[CHIME] create meeting.`);
        const userInfo = authorizer(req.headers["x-flect-access-token"]);
        const roomInfo = await (0, roomInfoDao_1.getRoomInfo)(userInfo.roomName);
        if (!roomInfo) {
            console.log(`[CHIME] create meeting failed. there is no such room. ${JSON.stringify(userInfo.roomName)}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.NO_SUCH_ROOM,
            };
            res.send(JSON.stringify(response));
            return;
        }
        await syncMeetingInfoWithChimeServer(roomInfo);
        if (roomInfo.meetingInfo) {
            console.log(`[CHIME] create meeting failed. meeting room alreedy exists.${JSON.stringify(roomInfo.meetingInfo.meetingId)}`);
            const responseBody = {
                created: false,
                meetingId: roomInfo.meetingInfo.meetingId,
                meetingName: roomInfo.meetingInfo.meetingName,
                ownerId: roomInfo.meetingInfo.metadata.ownerId,
            };
            const response = {
                success: true,
                code: http_1.HTTPResponseCode.SUCCESS,
                data: responseBody,
            };
            res.send(JSON.stringify(response));
            return;
        }
        console.log(`[CHIME] create new meeting room is creating.  ${userInfo.roomName}`);
        const request = {
            ClientRequestToken: (0, uuid_1.v4)(),
            MediaRegion: REGION,
        };
        const newMeetingInfo = await chime.createMeeting(request).promise();
        const metadata = {
            ownerId: userInfo.userId,
            region: REGION,
            startTime: new Date().getTime(),
        };
        const createdMeetingInfo = {
            meetingName: userInfo.roomName,
            meetingId: newMeetingInfo.Meeting.MeetingId,
            meeting: newMeetingInfo.Meeting,
            metadata: metadata,
        };
        roomInfo.meetingInfo = createdMeetingInfo;
        (0, roomInfoDao_1.updateRoom)(roomInfo);
        const responseBody = {
            created: true,
            meetingId: newMeetingInfo.Meeting.MeetingId,
            meetingName: userInfo.roomName,
            ownerId: userInfo.userId,
        };
        const response = {
            success: true,
            code: http_1.HTTPResponseCode.SUCCESS,
            data: responseBody,
        };
        res.send(JSON.stringify(response));
        console.log(`[CHIME] create new meeting room is creating done.  ${userInfo.roomName}:${newMeetingInfo.Meeting.MeetingId}`);
    });
    app.get(`/api/chime/meetings/:meetingName`, async (req, res) => {
        console.log(`[CHIME] get meeting info.`);
        const userInfo = authorizer(req.headers["x-flect-access-token"]);
        const roomInfo = await (0, roomInfoDao_1.getRoomInfo)(userInfo.roomName);
        if (!roomInfo) {
            console.log(`[CHIME] get meeting info failed. there is no such room. ${JSON.stringify(userInfo.roomName)}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.NO_SUCH_ROOM,
            };
            res.send(JSON.stringify(response));
            return;
        }
        await syncMeetingInfoWithChimeServer(roomInfo);
        if (!roomInfo.meetingInfo) {
            console.log(`[CHIME] get meeting info failed. there is no such meeting room. ${JSON.stringify(userInfo.roomName)}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.NO_SUCH_MEETING,
            };
            res.send(JSON.stringify(response));
            return;
        }
        else {
            const httpRes = {
                meetingName: userInfo.roomName,
                meetingId: roomInfo.meetingInfo.meetingId,
                meeting: roomInfo.meetingInfo.meeting,
                metadata: roomInfo.meetingInfo.metadata,
                isOwner: roomInfo.meetingInfo.metadata.ownerId === userInfo.userId,
            };
            const response = {
                success: true,
                code: http_1.HTTPResponseCode.SUCCESS,
                data: httpRes,
            };
            res.send(JSON.stringify(response));
            console.log(`[CHIME] get meeting info. done`);
        }
    });
    app.post(`/api/chime/meetings/:meetingName/attendees`, async (req, res) => {
        console.log(`[CHIME] add attendee.`);
        const userInfo = authorizer(req.headers["x-flect-access-token"]);
        //// (1) check meeting exists
        const roomInfo = await (0, roomInfoDao_1.getRoomInfo)(userInfo.roomName);
        if (!roomInfo) {
            console.log(`[CHIME] add attendee failed. there is no such room. ${JSON.stringify(userInfo.roomName)}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.NO_SUCH_ROOM,
            };
            res.send(JSON.stringify(response));
            return;
        }
        await syncMeetingInfoWithChimeServer(roomInfo);
        if (!roomInfo.meetingInfo) {
            console.log(`[CHIME] add attendee failed. there is no such meeting room. ${JSON.stringify(userInfo.roomName)}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.NO_SUCH_MEETING,
            };
            res.send(JSON.stringify(response));
            return;
        }
        //// (2) create attendee in Amazon Chime
        console.log(`[CHIME] add attendee to the meeting ${JSON.stringify(userInfo.roomName)}`);
        const attendeeInfo = await chime
            .createAttendee({
            MeetingId: roomInfo.meetingInfo.meetingId,
            ExternalUserId: (0, uuid_1.v4)(),
        })
            .promise();
        console.log(`[CHIME] add attendee to the meeting done ${JSON.stringify(attendeeInfo)}`);
        //// (3) updateDB
        console.log(`[CHIME] added attendee. update db.`);
        const attendeeId = `${userInfo.roomName}/${attendeeInfo.Attendee.AttendeeId}`;
        roomInfo.attendees.push({
            attendeeId: attendeeId,
            attendeeName: userInfo.userName,
        });
        (0, roomInfoDao_1.updateRoom)(roomInfo);
        const responseBody = {
            meetingName: roomInfo.meetingInfo.meetingName,
            meeting: roomInfo.meetingInfo.meeting,
            attendee: attendeeInfo.Attendee,
        };
        const response = {
            success: true,
            code: http_1.HTTPResponseCode.SUCCESS,
            data: responseBody,
        };
        res.send(JSON.stringify(response));
        console.log(`[CHIME] add attendee done.`);
    });
    app.get(`/api/chime/meetings/:meetingName/attendees/:attendeeId`, async (req, res) => {
        console.log(`[CHIME] get attendee info.`);
        const userInfo = authorizer(req.headers["x-flect-access-token"]);
        //// (1) check meeting exists
        const roomInfo = await (0, roomInfoDao_1.getRoomInfo)(userInfo.roomName);
        if (!roomInfo) {
            console.log(`[CHIME] get attendee info failed. there is no such room. ${JSON.stringify(userInfo.roomName)}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.NO_SUCH_ROOM,
            };
            res.send(JSON.stringify(response));
            return;
        }
        await syncMeetingInfoWithChimeServer(roomInfo);
        if (!roomInfo.meetingInfo) {
            console.log(`[CHIME] get attendee info failed. there is no such meeting room. ${JSON.stringify(userInfo.roomName)}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.NO_SUCH_MEETING,
            };
            res.send(JSON.stringify(response));
            return;
        }
        const attendeeId = `${userInfo.roomName}/${req.params.attendeeId}`;
        const attendeeInfo = roomInfo.attendees.find((x) => {
            return x.attendeeId === attendeeId;
        });
        if (!attendeeInfo) {
            console.log(`[CHIME] get attendee info failed. there is no such attendee. ${JSON.stringify(attendeeId)}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.NO_SUCH_ATTENDEE,
            };
            res.send(JSON.stringify(response));
            return;
        }
        const responseBody = {
            attendeeId: attendeeInfo.attendeeId,
            attendeeName: attendeeInfo.attendeeName,
        };
        const response = {
            success: true,
            code: http_1.HTTPResponseCode.SUCCESS,
            data: responseBody,
        };
        res.send(JSON.stringify(response));
    });
};
exports.setupChimeApi = setupChimeApi;
