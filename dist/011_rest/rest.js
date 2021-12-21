"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRestApi = void 0;
const exception_1 = require("../000_sharedData/exception");
const http_1 = require("../000_sharedData/http");
const accountDao_1 = require("../002_dao/accountDao");
const roomInfoDao_1 = require("../002_dao/roomInfoDao");
const userToken_1 = require("../003_token/userToken");
const webSecret = process.env.APP_WEB_SECRET;
const generateUserInformationFromWeb = async (roomName, username) => {
    const roomInfo = (0, roomInfoDao_1.getRoomInfo)(roomName);
    if (roomInfo) {
        const user = {
            roomName: roomInfo.roomName,
            teamId: roomInfo.teamId,
            channelId: roomInfo.channelId,
            channelName: roomInfo.channelName,
            userId: username,
            userName: username,
            imageUrl: "",
            chimeInfo: {
                attendeeName: username,
                useDefault: true,
            },
        };
        return user;
    }
    else {
        const roomInfo = await (0, roomInfoDao_1.generateNewRoom)(roomName, "", "", "", "From Web");
        const user = {
            roomName: roomName,
            teamId: "",
            channelId: "",
            channelName: "",
            userId: username,
            userName: username,
            imageUrl: "",
            chimeInfo: {
                attendeeName: username,
                useDefault: true,
            },
        };
        return user;
    }
};
// export const setupRestApi = (app: express.Application) => {
const setupRestApi = (app) => {
    /////// Token
    app.post(`/api/auth/decodeInformation`, async (req, res) => {
        console.log(`[REST][USER_AUTH] decode token.`);
        const request = req.body;
        try {
            console.log("requested token!", request.token);
            const info = (0, userToken_1.decodeUserToken)(request.token);
            const response = {
                success: true,
                code: http_1.HTTPResponseCode.SUCCESS,
                data: info,
            };
            res.send(JSON.stringify(response));
        }
        catch (exception) {
            console.log(`[REST][USER_AUTH] token is invalid or other. ${exception}`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.INVALID_TOKEN_EXCEPTION,
                data: exception,
            };
            res.send(JSON.stringify(response));
        }
    });
    ////// Sign up
    app.post(`/api/auth/user`, async (req, res) => {
        const signupRequest = req.body;
        try {
            (0, accountDao_1.addUser)(signupRequest.username, signupRequest.password);
            const response = {
                success: true,
                code: http_1.HTTPResponseCode.SUCCESS,
            };
            res.send(JSON.stringify(response));
            return;
        }
        catch (exception) {
            if (exception === exception_1.InternalExceptionCodes.USER_ALREADY_EXISTS) {
                /// 既に登録されている場合
                console.log(`[REST][USER_AUTH] user ${signupRequest.username} already exists.`);
                const httpRes = {
                    success: false,
                    detail: `user ${signupRequest.username} already exists.`,
                };
                const response = {
                    success: false,
                    code: http_1.HTTPResponseCode.USER_ALREADY_EXISTS,
                    data: httpRes,
                };
                res.send(JSON.stringify(response));
                return;
            }
            else {
                console.log(`[REST][USER_AUTH] unknown exception. ${exception}`);
                const httpRes = {
                    success: false,
                    detail: `adding user failed, something wrong. ${signupRequest.username}.`,
                };
                const response = {
                    success: false,
                    code: http_1.HTTPResponseCode.SERVER_ERROR,
                    data: httpRes,
                };
                res.send(JSON.stringify(response));
                return;
            }
        }
    });
    ////// Generate Token
    app.post(`/api/auth/user/operation/generateToken`, async (req, res) => {
        const getTokenRequest = req.body;
        console.log(`[WEB REST API]`, req);
        const signinResult = await (0, accountDao_1.signin)(getTokenRequest.username, getTokenRequest.password);
        if (signinResult === false) {
            console.log(`[REST][USER_AUTH] authorization failed.`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.AUTH_FAILED,
            };
            res.send(JSON.stringify(response));
            return;
        }
        else if (webSecret !== getTokenRequest.webSecret) {
            console.log(`[REST][USER_AUTH] Invalid web secret.`);
            const response = {
                success: false,
                code: http_1.HTTPResponseCode.INVALID_WEB_SECRET,
            };
            res.send(JSON.stringify(response));
            return;
        }
        else {
            const userInfo = await generateUserInformationFromWeb(getTokenRequest.roomName, getTokenRequest.username);
            const encInfo = (0, userToken_1.generateUserToken)(userInfo);
            const httpRes = {
                token: encInfo,
            };
            const response = {
                success: true,
                code: http_1.HTTPResponseCode.SUCCESS,
                data: httpRes,
            };
            res.send(JSON.stringify(response));
            return;
        }
    });
    ////// Change password
    app.put(`/api/auth/user`, async (req, res) => {
        const changePasswordRequest = req.body;
        try {
            await (0, accountDao_1.changePassword)(changePasswordRequest.username, changePasswordRequest.password, changePasswordRequest.newPassword);
            const response = {
                success: true,
                code: http_1.HTTPResponseCode.SUCCESS,
            };
            res.send(JSON.stringify(response));
            return;
        }
        catch (exception) {
            if (exception === exception_1.InternalExceptionCodes.AUTH_FAILED) {
                console.log(`[REST][USER_AUTH] auth failed.`);
                const httpRes = {
                    success: false,
                    detail: `auth failed.`,
                };
                const response = {
                    success: false,
                    code: http_1.HTTPResponseCode.AUTH_FAILED,
                    data: httpRes,
                };
                res.send(JSON.stringify(response));
                return;
            }
            else {
                console.log(`[REST][USER_AUTH] unknown exception. ${exception}`);
                const httpRes = {
                    success: false,
                    detail: `adding user failed, something wrong.`,
                };
                const response = {
                    success: false,
                    code: http_1.HTTPResponseCode.SERVER_ERROR,
                    data: httpRes,
                };
                res.send(JSON.stringify(response));
                return;
            }
        }
    });
};
exports.setupRestApi = setupRestApi;
