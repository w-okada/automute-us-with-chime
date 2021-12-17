"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalExceptionCodes = exports.NoSuchRoomError = exports.Failure = exports.Success = void 0;
class Success {
    constructor(value) {
        this.value = value;
        this.type = "success";
    }
    isSuccess() {
        return true;
    }
    isFailure() {
        return false;
    }
}
exports.Success = Success;
class Failure {
    constructor(value) {
        this.value = value;
        this.type = "failure";
    }
    isSuccess() {
        return false;
    }
    isFailure() {
        return true;
    }
}
exports.Failure = Failure;
class NoSuchRoomError extends Error {
}
exports.NoSuchRoomError = NoSuchRoomError;
exports.InternalExceptionCodes = {
    INTERNAL_ERROR: "INTERNAL_ERROR",
    /// AUTH
    USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
    AUTH_FAILED: "AUTH_FAILED",
    //// ROOM
    ROOM_ALREADY_EXISTS: "ROOM_ALREADY_EXISTS",
    /// CHIME
};
