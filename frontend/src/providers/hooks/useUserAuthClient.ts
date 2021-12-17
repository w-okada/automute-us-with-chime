import { Failure, Result, Success } from "../../../../shared/src/exception";
import { AuthHTTPChangePasswordRequest, AuthHTTPGetTokenRequest, AuthHTTPGetTokenResponse, AuthHTTPSignupRequest, AuthHTTPSignupResponse, HTTPResponseBody, SlackHTTPGetUserInformationRequest, SlackHTTPGetUserInformationResponse } from "../../../../shared/src/http";
import { useState } from "react";
import { UserInformation } from "../../../../shared/src/userInfo";

// (0) GetUserInformation
export type UseSlackRestApiProps = {
    restApiBaseURL: string;
    token: string | null;
};

export type UseUserAuthClientClientState = {
    roomName: string;
    username: string;
    password: string;
    newPassword: string;
    webSecret: string;
    setRoomName: (val: string) => void;
    setUsername: (val: string) => void;
    setPassword: (val: string) => void;
    setNewPassword: (val: string) => void;
    setWebSecret: (val: string) => void;
    getUserInformation: () => Promise<Result<UserInformation, Error>>;
    signup: (username: string, password: string) => Promise<Result<boolean, Error>>;
    signin: (roomName: string, username: string, password: string, webSecret: string) => Promise<Result<string, Error>>;
    changePassword: (username: string, password: string, newPassword: string) => Promise<Result<boolean, Error>>;
};

export const useUserAuthClient = (props: UseSlackRestApiProps): UseUserAuthClientClientState => {
    const [roomName, setRoomName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [webSecret, setWebSecret] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const getUserInformation = async (): Promise<Result<UserInformation, Error>> => {
        const url = `${props.restApiBaseURL}api/auth/decodeInformation`;
        const httpRequest: SlackHTTPGetUserInformationRequest = {
            token: `${props.token}`,
        };
        const requestBody = JSON.stringify(httpRequest);
        console.log(" getUserInformation", requestBody);
        const res = await fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const response = await res.json();
        if (response.success) {
            const httpResponse = response.data as SlackHTTPGetUserInformationResponse;
            const returnValue: UserInformation = { ...httpResponse };
            return new Success(returnValue);
        } else {
            return new Failure(response);
        }
    };

    const signup = async (username: string, password: string): Promise<Result<boolean, Error>> => {
        const url = `${props.restApiBaseURL}api/auth/user`;
        const httpRequest: AuthHTTPSignupRequest = {
            username: `${username}`,
            password: `${password}`,
        };
        const requestBody = JSON.stringify(httpRequest);
        console.log(requestBody);
        const res = await fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const response = await res.json();
        if (response.success) {
            return new Success(true);
        }
        console.log("signup failed");
        return new Failure(new Error(`signup failed`));
    };

    const signin = async (roomName: string, username: string, password: string, webSecret: string): Promise<Result<string, Error>> => {
        const url = `${props.restApiBaseURL}api/auth/user/operation/generateToken`;
        const httpRequest: AuthHTTPGetTokenRequest = {
            roomName: `${roomName}`,
            username: `${username}`,
            password: `${password}`,
            webSecret: `${webSecret}`,
        };
        const requestBody = JSON.stringify(httpRequest);
        console.log(requestBody);
        const res = await fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const response = (await res.json()) as HTTPResponseBody;
        console.log("signin res", response);
        if (response.success) {
            const tokenResponse = response.data as AuthHTTPGetTokenResponse;
            return new Success(tokenResponse.token);
        }
        console.log("signup failed");
        return new Failure(new Error(`signup failed`));
    };

    const changePassword = async (username: string, password: string, newPassword: string): Promise<Result<boolean, Error>> => {
        const url = `${props.restApiBaseURL}api/auth/user`;
        const httpRequest: AuthHTTPChangePasswordRequest = {
            username: `${username}`,
            password: `${password}`,
            newPassword: `${newPassword}`,
        };
        const requestBody = JSON.stringify(httpRequest);
        console.log(requestBody);
        const res = await fetch(url, {
            method: "PUT",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const response = await res.json();
        if (response.success) {
            return new Success(true);
        }
        return new Failure(new Error(`change password failed`));
    };

    const returnValue: UseUserAuthClientClientState = {
        roomName,
        setRoomName,
        username,
        setUsername,
        password,
        setPassword,
        newPassword,
        setNewPassword,
        webSecret,
        setWebSecret,
        getUserInformation,
        signup,
        signin,
        changePassword,
    };
    return returnValue;
};
