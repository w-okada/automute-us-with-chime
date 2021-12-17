"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.signin = exports.addUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const exception_1 = require("../000_sharedData/exception");
const accountData_1 = require("../001_data/accountData");
const addUser = async (username, password) => {
    console.log("[DAO][Account] add new user");
    const hashedPasswords = await (0, accountData_1.getHashedPasswordFromDB)(username);
    if (hashedPasswords.length > 0) {
        console.log("[DAO][Account] new username is used.");
        throw exception_1.InternalExceptionCodes.USER_ALREADY_EXISTS;
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await (0, accountData_1.addUserToDB)(username, hashedPassword);
};
exports.addUser = addUser;
const signin = async (username, password) => {
    const hashedPassord = await (0, accountData_1.getHashedPasswordFromDB)(username);
    if (hashedPassord.length === 0) {
        console.log(`[DAO][Account] no such user`);
        return false;
    }
    if (hashedPassord.length !== 1) {
        console.log(`[DAO][Account] multiple user recorde. internal logic error`);
        return false;
    }
    const compare = await bcrypt_1.default.compare(password, hashedPassord[0].hashedPassword);
    if (compare) {
        return true;
    }
    else {
        // console.log(`[DAO][Account] doesnot match password. ${password} ${hashedPassord[0].hashedPassword}`);
        console.log(`[DAO][Account] doesnot match password.`);
        return false;
    }
};
exports.signin = signin;
const changePassword = async (username, password, newPassword) => {
    const validateResult = await (0, exports.signin)(username, password);
    if (validateResult) {
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        (0, accountData_1.updateHashedPasswordToDB)(username, hashedPassword);
        return true;
    }
    else {
        console.log(`[DAO][Account] doesnot match password. password is not changed.`);
        throw exception_1.InternalExceptionCodes.AUTH_FAILED;
    }
};
exports.changePassword = changePassword;
