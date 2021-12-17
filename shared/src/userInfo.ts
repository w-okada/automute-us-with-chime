export type UserInformation = {
    roomName: string;
    teamId: string;
    channelId: string;
    channelName: string;
    userId: string;
    userName: string;
    imageUrl: string;
    chimeInfo?: ChimeInfo;
    amongusInfo?: AmongusInfo;
};

export type ChimeInfo = {
    attendeeName: string;
    useDefault: boolean;
};

export type AmongusInfo = {
    connectCode: string;
};
