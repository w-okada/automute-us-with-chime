import { Encrypter } from "../000_common/encrypter";
import { UserInformation } from "../000_sharedData/userInfo";

export const tokenEncrypter = new Encrypter<UserInformation>({
    password: process.env.APP_AUTH_PASSWORD || "pass",
    salt: process.env.APP_AUTH_SALT || "salt",
    secret: process.env.APP_AUTH_SECRET || "secret",
});

export const generateUserToken = (userInfo: UserInformation) => {
    const token = tokenEncrypter.encodeInformation(userInfo);
    return token;
};

export const decodeUserToken = (token: string) => {
    const info = tokenEncrypter.decodeInformation(token);
    return info;
};
