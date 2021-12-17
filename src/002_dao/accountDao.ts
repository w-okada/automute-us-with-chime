import bcrypt from "bcrypt";
import { InternalExceptionCodes } from "../000_sharedData/exception";
import { addUserToDB, getHashedPasswordFromDB, updateHashedPasswordToDB } from "../001_data/accountData";

export const addUser = async (username: string, password: string) => {
    console.log("[DAO][Account] add new user");
    const hashedPasswords = await getHashedPasswordFromDB(username);
    if (hashedPasswords.length > 0) {
        console.log("[DAO][Account] new username is used.");
        throw InternalExceptionCodes.USER_ALREADY_EXISTS;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await addUserToDB(username, hashedPassword);
};

export const signin = async (username: string, password: string) => {
    const hashedPassord = await getHashedPasswordFromDB(username);
    if (hashedPassord.length === 0) {
        console.log(`[DAO][Account] no such user`);
        return false;
    }
    if (hashedPassord.length !== 1) {
        console.log(`[DAO][Account] multiple user recorde. internal logic error`);
        return false;
    }
    const compare = await bcrypt.compare(password, hashedPassord[0].hashedPassword);
    if (compare) {
        return true;
    } else {
        // console.log(`[DAO][Account] doesnot match password. ${password} ${hashedPassord[0].hashedPassword}`);
        console.log(`[DAO][Account] doesnot match password.`);
        return false;
    }
};

export const changePassword = async (username: string, password: string, newPassword: string) => {
    const validateResult = await signin(username, password);
    if (validateResult) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateHashedPasswordToDB(username, hashedPassword);
        return true;
    } else {
        console.log(`[DAO][Account] doesnot match password. password is not changed.`);
        throw InternalExceptionCodes.AUTH_FAILED;
    }
};
