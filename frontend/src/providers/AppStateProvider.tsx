import React, { useContext, useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import { MessageState, MessageType, useMessageState } from "./hooks/useMessageState";
import { STAGE, useStageManager, FOR_FEDERATION } from "./hooks/useStageManager";
import { DeviceState, useDeviceState } from "./hooks/useDeviceState";
import { useWindowSizeChangeListener, WindowSize } from "./hooks/useWindowSizeChange";
import { ChimeClientState, useChimeClient } from "./hooks/useChimeClient";
import { FrontendState, useFrontend } from "./hooks/useFrontend";
import { HEROKU_BASE_URL, LOCAL_DEV } from "../config";
import { useSocketIOClient, UseSocketIOClientState } from "./hooks/useSocketIOClient";
import { useUserAuthClient, UseUserAuthClientClientState } from "./hooks/useUserAuthClient";

type Props = {
    children: ReactNode;
};

interface AppStateValue {
    token: string | null;
    setToken: (val: string | null) => void;

    /** GUI Control*/
    /**** For WindowSizeChange */
    windowSize: WindowSize;
    /**** For StageManager */
    stage: STAGE | FOR_FEDERATION;
    setStage: (stage: STAGE | FOR_FEDERATION) => void;
    /**** Other GUI Props */
    frontendState: FrontendState;

    /** Clients */
    chimeClientState: ChimeClientState;
    // whiteboardClientState: WhiteboardClientState;
    userAuthClientState: UseUserAuthClientClientState;
    /** For Device State */
    deviceState: DeviceState;
    socketIOClientState: UseSocketIOClientState;
    /** For Message*/
    messageState: MessageState;
    setMessage: (type: MessageType, title: string, detail: string[]) => void;
    resolveMessage: () => void;

    /** Federation */
    slackRestApiBase: string | null;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

const query = new URLSearchParams(window.location.search);

export const AppStateProvider = ({ children }: Props) => {
    const initialSlackToken = useMemo(() => {
        return query.get("slack_token") || null;
    }, []);
    const [token, setToken] = useState(initialSlackToken);
    const slackRestApiBase = useMemo(() => {
        if (LOCAL_DEV) {
            return HEROKU_BASE_URL;
        } else {
            return `${location.protocol}//${location.host}/`;
        }
    }, []);

    /** GUI Control*/
    /**** For WindowSizeChange */
    const { windowSize } = useWindowSizeChangeListener();
    /**** For StageManager */
    const { stage, setStage } = useStageManager({ initialStage: (query.get("stage") as STAGE) ? (query.get("stage") as STAGE) : initialSlackToken ? FOR_FEDERATION.SLACK_SIGNUP : null });
    /**** Other GUI Props */
    const frontendState = useFrontend();

    /** Clients */
    const chimeClientState = useChimeClient({ RestAPIEndpoint: `${slackRestApiBase}api/chime/` });
    useEffect(() => {
        chimeClientState.initializeWithCode(`slack,${token}`);
    }, [token]);
    // const whiteboardClientState = useWhiteboardClient({
    //     joinToken: chimeClientState.joinToken || "",
    //     meetingId: chimeClientState.meetingId || "",
    //     attendeeId: chimeClientState.attendeeId || "",
    // });

    const socketIOClientState = useSocketIOClient({
        url: slackRestApiBase,
        tiles: chimeClientState.getAllTiles(),
    });

    const userAuthClientState = useUserAuthClient({
        restApiBaseURL: slackRestApiBase,
        token: token || "no token",
    });

    /** For Device State */
    const deviceState = useDeviceState();

    /** For Message*/
    const { messageState, setMessage, resolveMessage } = useMessageState();

    // /// whiteboard
    // ///////////////////
    // const [recreateWebSocketWhiteboardClientCount, setRecreateWebSocketWhiteboardClientCount] = useState(0);
    // const recreateWebSocketWhiteboardClient = () => {
    //     console.log("whiteboard client recreate requested...");
    //     setRecreateWebSocketWhiteboardClientCount(recreateWebSocketWhiteboardClientCount + 1);
    // };

    const providerValue = {
        token,
        setToken,
        /** GUI Control*/
        /**** For WindowSizeChange */
        windowSize,
        /**** For StageManager */
        stage,
        setStage,
        /**** Other GUI Props */
        frontendState,

        /** For Client */
        chimeClientState,
        socketIOClientState,
        userAuthClientState,
        /** For Device State */
        deviceState,

        /** For Message*/
        messageState,
        setMessage,
        resolveMessage,

        /** Federation */
        slackRestApiBase,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
