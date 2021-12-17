///////////////////////////////
// HTTP I/F
///////////////////////////////

import { UserInformation } from "./userInfo";

export const HTTPResponseCode = {
    SUCCESS: "SUCCESS",
    INVALID_TOKEN_EXCEPTION: "INVALID_TOKEN_EXCEPTION",
    USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
    AUTH_FAILED: "AUTH_FAILED",
    INVALID_WEB_SECRET: "INVALID_WEB_SECRET",
    SERVER_ERROR: "SERVER_ERROR",

    NO_SUCH_ROOM: "NO_SUCH_ROOM",
    NO_SUCH_MEETING: "NO_SUCH_MEETING",
    NO_SUCH_ATTENDEE: "NO_SUCH_ATTENDEE",
} as const;

type HTTPResponseCode = typeof HTTPResponseCode[keyof typeof HTTPResponseCode];

export type HTTPResponseBody = {
    success: boolean;
    code: string;
    data?: any;
};

//////////////////////////////
// Slack
///////////////////////////////
export type SlackHTTPGetUserInformationRequest = {
    token: string;
};
export type SlackHTTPGetUserInformationResponse = UserInformation;

//////////////////////////////
// Chime
///////////////////////////////

import { Chime } from "aws-sdk";
import { Metadata } from "./room";

// Create Meeting
export type HTTPCreateMeetingRequest = {
    meetingName: string;
    region: string;
};

export type HTTPCreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
};

// Get Meeting Info
export type HTTPGetMeetingInfoResponse = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    isOwner?: boolean;
};
// Delete Meeting

// Join Meeting
export type HTTPJoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
};

export type HTTPJoinMeetingResponse = {
    meetingName: string;
    meeting: Chime.Meeting;
    attendee: Chime.Attendee;
};

// Get Attendee Info
export type HTTPGetAttendeeInfoResponse = {
    attendeeId: string;
    attendeeName: string;
};

//////////////////////////////
// User Auth
///////////////////////////////

export type AuthHTTPSignupRequest = {
    username: string;
    password: string;
};
export type AuthHTTPSignupResponse = {
    success: boolean;
    detail?: string;
};

export type AuthHTTPGetTokenRequest = {
    username: string;
    password: string;
    webSecret: string;
    roomName: string;
};
export type AuthHTTPGetTokenResponse = {
    token: string;
};

export type AuthHTTPChangePasswordRequest = {
    username: string;
    password: string;
    newPassword: string;
};
export type AuthHTTPChangePasswordResponse = {
    success: boolean;
    detail?: string;
};
