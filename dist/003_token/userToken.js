"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeUserToken = exports.generateUserToken = exports.tokenEncrypter = void 0;
const encrypter_1 = require("../000_common/encrypter");
exports.tokenEncrypter = new encrypter_1.Encrypter({
    password: process.env.APP_AUTH_PASSWORD || "pass",
    salt: process.env.APP_AUTH_SALT || "salt",
    secret: process.env.APP_AUTH_SECRET || "secret",
});
const generateUserToken = (userInfo) => {
    const token = exports.tokenEncrypter.encodeInformation(userInfo);
    return token;
};
exports.generateUserToken = generateUserToken;
const decodeUserToken = (token) => {
    const info = exports.tokenEncrypter.decodeInformation(token);
    return info;
};
exports.decodeUserToken = decodeUserToken;
