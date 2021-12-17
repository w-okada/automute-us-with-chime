import { ExpressReceiver } from "@slack/bolt";
import { Chime, Endpoint } from "aws-sdk";
import { Meeting } from "aws-sdk/clients/chime";
import { v4 } from "uuid";
import { HTTPCreateMeetingResponse, HTTPGetAttendeeInfoResponse, HTTPGetMeetingInfoResponse, HTTPJoinMeetingResponse, HTTPResponseBody, HTTPResponseCode } from "../000_sharedData/http";
import { MeetingInfo, Metadata, RoomInfo } from "../000_sharedData/room";
import { getRoomInfo, updateRoom } from "../002_dao/roomInfoDao";
import { decodeUserToken } from "../003_token/userToken";
import express from "express";

const chime = new Chime({ region: "us-east-1" });
chime.endpoint = new Endpoint("https://service.chime.aws.amazon.com/console");

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

const authorizer = (header: string) => {
    console.log(`[CHIME] authorizer.`);
    const token = header.split(",")[1];
    const info = decodeUserToken(token);
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

const syncMeetingInfoWithChimeServer = async (roomInfo: RoomInfo): Promise<RoomInfo | null> => {
    if (!roomInfo || !roomInfo.meetingInfo) {
        return;
    }

    const meetingInfo = roomInfo.meetingInfo;
    try {
        // Check Exist?
        const mid = await chime.getMeeting({ MeetingId: meetingInfo.meetingId }).promise();
        console.log(`[CHIME] getMeetingInfo. retreive from Chime Server succeeded: ${mid.Meeting.MeetingId}`);
    } catch (err) {
        console.log(`[CHIME] getMeetingInfo. retreive from Chime Server falied`);
        roomInfo.meetingInfo = undefined;
    }
};

// export const setupChimeApi = (receiver: ExpressReceiver) => {
export const setupChimeApi = (app: express.Application) => {
    app.post(`/api/chime/meetings`, async (req, res) => {
        console.log(`[CHIME] create meeting.`);
        const userInfo = authorizer(req.headers["x-flect-access-token"] as string);
        const roomInfo = await getRoomInfo(userInfo.roomName);
        if (!roomInfo) {
            console.log(`[CHIME] create meeting failed. there is no such room. ${JSON.stringify(userInfo.roomName)}`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.NO_SUCH_ROOM,
            };
            res.send(JSON.stringify(response));
            return;
        }

        await syncMeetingInfoWithChimeServer(roomInfo);
        if (roomInfo.meetingInfo) {
            console.log(`[CHIME] create meeting failed. meeting room alreedy exists.${JSON.stringify(roomInfo.meetingInfo.meetingId)}`);
            const responseBody: HTTPCreateMeetingResponse = {
                created: false,
                meetingId: roomInfo.meetingInfo.meetingId,
                meetingName: roomInfo.meetingInfo.meetingName,
                ownerId: roomInfo.meetingInfo.metadata.ownerId,
            };
            const response: HTTPResponseBody = {
                success: true,
                code: HTTPResponseCode.SUCCESS,
                data: responseBody,
            };
            res.send(JSON.stringify(response));
            return;
        }

        console.log(`[CHIME] create new meeting room is creating.  ${userInfo.roomName}`);

        const request: Chime.CreateMeetingRequest = {
            ClientRequestToken: v4(),
            MediaRegion: REGION,
        };
        const newMeetingInfo = await chime.createMeeting(request).promise();

        const metadata: Metadata = {
            ownerId: userInfo.userId,
            region: REGION,
            startTime: new Date().getTime(),
        };
        const createdMeetingInfo: MeetingInfo = {
            meetingName: userInfo.roomName,
            meetingId: newMeetingInfo.Meeting.MeetingId,
            meeting: newMeetingInfo.Meeting,
            metadata: metadata,
        };
        roomInfo.meetingInfo = createdMeetingInfo;
        updateRoom(roomInfo);

        const responseBody: HTTPCreateMeetingResponse = {
            created: true,
            meetingId: newMeetingInfo.Meeting.MeetingId,
            meetingName: userInfo.roomName,
            ownerId: userInfo.userId,
        };
        const response: HTTPResponseBody = {
            success: true,
            code: HTTPResponseCode.SUCCESS,
            data: responseBody,
        };
        res.send(JSON.stringify(response));
        console.log(`[CHIME] create new meeting room is creating done.  ${userInfo.roomName}:${newMeetingInfo.Meeting.MeetingId}`);
    });

    app.get(`/api/chime/meetings/:meetingName`, async (req, res) => {
        console.log(`[CHIME] get meeting info.`);
        const userInfo = authorizer(req.headers["x-flect-access-token"] as string);
        const roomInfo = await getRoomInfo(userInfo.roomName);
        if (!roomInfo) {
            console.log(`[CHIME] get meeting info failed. there is no such room. ${JSON.stringify(userInfo.roomName)}`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.NO_SUCH_ROOM,
            };
            res.send(JSON.stringify(response));
            return;
        }

        await syncMeetingInfoWithChimeServer(roomInfo);

        if (!roomInfo.meetingInfo) {
            console.log(`[CHIME] get meeting info failed. there is no such meeting room. ${JSON.stringify(userInfo.roomName)}`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.NO_SUCH_MEETING,
            };
            res.send(JSON.stringify(response));
            return;
        } else {
            const httpRes: HTTPGetMeetingInfoResponse = {
                meetingName: userInfo.roomName,
                meetingId: roomInfo.meetingInfo.meetingId,
                meeting: roomInfo.meetingInfo.meeting,
                metadata: roomInfo.meetingInfo.metadata,
                isOwner: roomInfo.meetingInfo.metadata.ownerId === userInfo.userId,
            };
            const response = {
                success: true,
                code: HTTPResponseCode.SUCCESS,
                data: httpRes,
            };
            res.send(JSON.stringify(response));
            console.log(`[CHIME] get meeting info. done`);
        }
    });

    app.post(`/api/chime/meetings/:meetingName/attendees`, async (req, res) => {
        console.log(`[CHIME] add attendee.`);
        const userInfo = authorizer(req.headers["x-flect-access-token"] as string);
        //// (1) check meeting exists
        const roomInfo = await getRoomInfo(userInfo.roomName);
        if (!roomInfo) {
            console.log(`[CHIME] add attendee failed. there is no such room. ${JSON.stringify(userInfo.roomName)}`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.NO_SUCH_ROOM,
            };
            res.send(JSON.stringify(response));
            return;
        }

        await syncMeetingInfoWithChimeServer(roomInfo);
        if (!roomInfo.meetingInfo) {
            console.log(`[CHIME] add attendee failed. there is no such meeting room. ${JSON.stringify(userInfo.roomName)}`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.NO_SUCH_MEETING,
            };
            res.send(JSON.stringify(response));
            return;
        }

        //// (2) create attendee in Amazon Chime
        console.log(`[CHIME] add attendee to the meeting ${JSON.stringify(userInfo.roomName)}`);
        const attendeeInfo = await chime
            .createAttendee({
                MeetingId: roomInfo.meetingInfo.meetingId,
                ExternalUserId: v4(),
            })
            .promise();
        console.log(`[CHIME] add attendee to the meeting done ${JSON.stringify(attendeeInfo)}`);

        //// (3) updateDB
        console.log(`[CHIME] added attendee. update db.`);
        const attendeeId = `${userInfo.roomName}/${attendeeInfo.Attendee!.AttendeeId}`;
        roomInfo.attendees.push({
            attendeeId: attendeeId,
            attendeeName: userInfo.userName,
        });
        updateRoom(roomInfo);

        const responseBody: HTTPJoinMeetingResponse = {
            meetingName: roomInfo.meetingInfo.meetingName,
            meeting: roomInfo.meetingInfo.meeting,
            attendee: attendeeInfo.Attendee,
        };
        const response: HTTPResponseBody = {
            success: true,
            code: HTTPResponseCode.SUCCESS,
            data: responseBody,
        };
        res.send(JSON.stringify(response));
        console.log(`[CHIME] add attendee done.`);
    });

    app.get(`/api/chime/meetings/:meetingName/attendees/:attendeeId`, async (req, res) => {
        console.log(`[CHIME] get attendee info.`);
        const userInfo = authorizer(req.headers["x-flect-access-token"] as string);
        //// (1) check meeting exists
        const roomInfo = await getRoomInfo(userInfo.roomName);
        if (!roomInfo) {
            console.log(`[CHIME] get attendee info failed. there is no such room. ${JSON.stringify(userInfo.roomName)}`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.NO_SUCH_ROOM,
            };
            res.send(JSON.stringify(response));
            return;
        }

        await syncMeetingInfoWithChimeServer(roomInfo);
        if (!roomInfo.meetingInfo) {
            console.log(`[CHIME] get attendee info failed. there is no such meeting room. ${JSON.stringify(userInfo.roomName)}`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.NO_SUCH_MEETING,
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
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.NO_SUCH_ATTENDEE,
            };
            res.send(JSON.stringify(response));
            return;
        }
        const responseBody: HTTPGetAttendeeInfoResponse = {
            attendeeId: attendeeInfo.attendeeId,
            attendeeName: attendeeInfo.attendeeName,
        };
        const response: HTTPResponseBody = {
            success: true,
            code: HTTPResponseCode.SUCCESS,
            data: responseBody,
        };
        res.send(JSON.stringify(response));
    });
};
