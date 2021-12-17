"use strict";
///////////////////////////////
// HTTP I/F
///////////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPResponseCode = void 0;
exports.HTTPResponseCode = {
    SUCCESS: "SUCCESS",
    INVALID_TOKEN_EXCEPTION: "INVALID_TOKEN_EXCEPTION",
    USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
    AUTH_FAILED: "AUTH_FAILED",
    INVALID_WEB_SECRET: "INVALID_WEB_SECRET",
    SERVER_ERROR: "SERVER_ERROR",
    NO_SUCH_ROOM: "NO_SUCH_ROOM",
    NO_SUCH_MEETING: "NO_SUCH_MEETING",
    NO_SUCH_ATTENDEE: "NO_SUCH_ATTENDEE",
};
