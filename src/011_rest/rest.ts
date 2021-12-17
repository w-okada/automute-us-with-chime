import { ExpressReceiver } from "@slack/bolt";
import { InternalExceptionCodes } from "../000_sharedData/exception";
import { AuthHTTPChangePasswordRequest, AuthHTTPGetTokenRequest, AuthHTTPGetTokenResponse, AuthHTTPSignupRequest, AuthHTTPSignupResponse, HTTPResponseBody, HTTPResponseCode, SlackHTTPGetUserInformationRequest } from "../000_sharedData/http";
import { UserInformation } from "../000_sharedData/userInfo";
import { addUser, changePassword, signin } from "../002_dao/accountDao";
import { generateNewRoom, getRoomInfo } from "../002_dao/roomInfoDao";
import { decodeUserToken, generateUserToken } from "../003_token/userToken";
import express from "express";

const webSecret = process.env.APP_WEB_SECRET;

const generateUserInformationFromWeb = async (roomName: string, username: string): Promise<UserInformation> => {
    const roomInfo = getRoomInfo(roomName);

    if (roomInfo) {
        const user: UserInformation = {
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
    } else {
        const roomInfo = await generateNewRoom(roomName, "", "", "", "From Web");
        const user: UserInformation = {
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

// export const setupRestApi = (receiver: ExpressReceiver) => {
export const setupRestApi = (app: express.Application) => {
    /////// Token
    app.post(`/api/auth/decodeInformation`, async (req, res) => {
        console.log(`[REST][USER_AUTH] decode token.`);

        const request = req.body as SlackHTTPGetUserInformationRequest;
        try {
            console.log("requested token!", request.token);
            const info = decodeUserToken(request.token);
            const response: HTTPResponseBody = {
                success: true,
                code: HTTPResponseCode.SUCCESS,
                data: info,
            };
            res.send(JSON.stringify(response));
        } catch (exception) {
            console.log(`[REST][USER_AUTH] token is invalid or other. ${exception}`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.INVALID_TOKEN_EXCEPTION,
                data: exception,
            };
            res.send(JSON.stringify(response));
        }
    });

    ////// Sign up
    app.post(`/api/auth/user`, async (req, res) => {
        const signupRequest = req.body as AuthHTTPSignupRequest;
        try {
            addUser(signupRequest.username, signupRequest.password);
            const response: HTTPResponseBody = {
                success: true,
                code: HTTPResponseCode.SUCCESS,
            };
            res.send(JSON.stringify(response));
            return;
        } catch (exception) {
            if (exception === InternalExceptionCodes.USER_ALREADY_EXISTS) {
                /// 既に登録されている場合
                console.log(`[REST][USER_AUTH] user ${signupRequest.username} already exists.`);
                const httpRes: AuthHTTPSignupResponse = {
                    success: false,
                    detail: `user ${signupRequest.username} already exists.`,
                };
                const response: HTTPResponseBody = {
                    success: false,
                    code: HTTPResponseCode.USER_ALREADY_EXISTS,
                    data: httpRes,
                };
                res.send(JSON.stringify(response));
                return;
            } else {
                console.log(`[REST][USER_AUTH] unknown exception. ${exception}`);
                const httpRes: AuthHTTPSignupResponse = {
                    success: false,
                    detail: `adding user failed, something wrong. ${signupRequest.username}.`,
                };
                const response: HTTPResponseBody = {
                    success: false,
                    code: HTTPResponseCode.SERVER_ERROR,
                    data: httpRes,
                };
                res.send(JSON.stringify(response));
                return;
            }
        }
    });

    ////// Generate Token
    app.post(`/api/auth/user/operation/generateToken`, async (req, res) => {
        const getTokenRequest = req.body as AuthHTTPGetTokenRequest;
        const signinResult = await signin(getTokenRequest.username, getTokenRequest.password);
        if (signinResult === false) {
            console.log(`[REST][USER_AUTH] authorization failed.`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.AUTH_FAILED,
            };
            res.send(JSON.stringify(response));
            return;
        } else if (webSecret !== getTokenRequest.webSecret) {
            console.log(`[REST][USER_AUTH] Invalid web secret.`);
            const response: HTTPResponseBody = {
                success: false,
                code: HTTPResponseCode.INVALID_WEB_SECRET,
            };
            res.send(JSON.stringify(response));
            return;
        } else {
            const userInfo = await generateUserInformationFromWeb(getTokenRequest.roomName, getTokenRequest.username);
            const encInfo = generateUserToken(userInfo);
            const httpRes: AuthHTTPGetTokenResponse = {
                token: encInfo,
            };
            const response: HTTPResponseBody = {
                success: true,
                code: HTTPResponseCode.SUCCESS,
                data: httpRes,
            };
            res.send(JSON.stringify(response));
            return;
        }
    });

    ////// Change password
    app.put(`/api/auth/user`, async (req, res) => {
        const changePasswordRequest = req.body as AuthHTTPChangePasswordRequest;
        try {
            await changePassword(changePasswordRequest.username, changePasswordRequest.password, changePasswordRequest.newPassword);
            const response: HTTPResponseBody = {
                success: true,
                code: HTTPResponseCode.SUCCESS,
            };
            res.send(JSON.stringify(response));
            return;
        } catch (exception) {
            if (exception === InternalExceptionCodes.AUTH_FAILED) {
                console.log(`[REST][USER_AUTH] auth failed.`);
                const httpRes: AuthHTTPSignupResponse = {
                    success: false,
                    detail: `auth failed.`,
                };
                const response: HTTPResponseBody = {
                    success: false,
                    code: HTTPResponseCode.AUTH_FAILED,
                    data: httpRes,
                };
                res.send(JSON.stringify(response));
                return;
            } else {
                console.log(`[REST][USER_AUTH] unknown exception. ${exception}`);
                const httpRes: AuthHTTPSignupResponse = {
                    success: false,
                    detail: `adding user failed, something wrong.`,
                };
                const response: HTTPResponseBody = {
                    success: false,
                    code: HTTPResponseCode.SERVER_ERROR,
                    data: httpRes,
                };
                res.send(JSON.stringify(response));
                return;
            }
        }
    });
};
