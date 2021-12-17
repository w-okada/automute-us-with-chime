export type Result<T, E> = Success<T, E> | Failure<T, E>;
export class Success<T, E> {
    constructor(readonly value: T) {}
    type = "success" as const;
    isSuccess(): this is Success<T, E> {
        return true;
    }
    isFailure(): this is Failure<T, E> {
        return false;
    }
}
export class Failure<T, E> {
    constructor(readonly value: E) {}
    type = "failure" as const;
    isSuccess(): this is Success<T, E> {
        return false;
    }
    isFailure(): this is Failure<T, E> {
        return true;
    }
}
export class NoSuchRoomError extends Error {}

export const InternalExceptionCodes = {
    INTERNAL_ERROR: "INTERNAL_ERROR",

    /// AUTH
    USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
    AUTH_FAILED: "AUTH_FAILED",
    //// ROOM
    ROOM_ALREADY_EXISTS: "ROOM_ALREADY_EXISTS",

    /// CHIME
} as const;
export type InternalExceptionCodes = typeof InternalExceptionCodes[keyof typeof InternalExceptionCodes];
