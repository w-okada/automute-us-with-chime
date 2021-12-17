import { VideoTileState } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { GameState, GameStateType, PairUserNameAndAttendeeIdRequest } from "../../../../shared/src/amongus";

export type ChimeState = {
    name: string;
    description: string;
    arenaMicrophone: boolean;
    arenaSpeaker: boolean;
    arenaShareScreen: boolean;
    arenaViewScreen: boolean;
    fieldMicrophone: boolean;
    fieldSpeaker: boolean;
};
const ChimeState_Arena: ChimeState = {
    name: "ChimeState_Arena",
    description: "User is audience or under menu",
    arenaMicrophone: true,
    arenaSpeaker: true,
    arenaShareScreen: false,
    arenaViewScreen: true,
    fieldMicrophone: false,
    fieldSpeaker: false,
};

const ChimeState_Lobby: ChimeState = {
    name: "ChimeState_Lobby",
    description: "User is Player and in lobby",
    arenaMicrophone: true,
    arenaSpeaker: true,
    arenaShareScreen: true,
    arenaViewScreen: true,
    fieldMicrophone: false,
    fieldSpeaker: false,
};

const ChimeState_Task: ChimeState = {
    name: "ChimeState_Task",
    description: "User is Player and in task, alive",
    arenaMicrophone: false,
    arenaSpeaker: false,
    arenaShareScreen: true,
    arenaViewScreen: false,
    fieldMicrophone: false,
    fieldSpeaker: false,
};

const ChimeState_Discuss: ChimeState = {
    name: "ChimeState_Discuss",
    description: "User is Player and in discussion, alive",
    arenaMicrophone: true,
    arenaSpeaker: true,
    arenaShareScreen: true,
    arenaViewScreen: false,
    fieldMicrophone: true,
    fieldSpeaker: true,
};

const ChimeState_Task_Dead: ChimeState = {
    name: "ChimeState_Task_Dead",
    description: "User is Player and in task, dead",
    arenaMicrophone: true,
    arenaSpeaker: true,
    arenaShareScreen: true,
    arenaViewScreen: true,
    fieldMicrophone: false,
    fieldSpeaker: false,
};

const ChimeState_Discuss_Dead: ChimeState = {
    name: "ChimeState_Discuss_Dead",
    description: "User is Player and in discussion, dead",
    arenaMicrophone: false,
    arenaSpeaker: true,
    arenaShareScreen: true,
    arenaViewScreen: true,
    fieldMicrophone: false,
    fieldSpeaker: false,
};

const ChimeState_Discuss_Arena: ChimeState = {
    name: "ChimeState_Discuss_Arena",
    description: "User is audience amd in discussion",
    arenaMicrophone: false,
    arenaSpeaker: true,
    arenaShareScreen: false,
    arenaViewScreen: true,
    fieldMicrophone: false,
    fieldSpeaker: false,
};

const ChimeState_Debug: ChimeState = {
    name: "ChimeState_Debug",
    description: "for debug",
    arenaMicrophone: true,
    arenaSpeaker: true,
    arenaShareScreen: true,
    arenaViewScreen: true,
    fieldMicrophone: false,
    fieldSpeaker: false,
};
const ChimeStateType = {
    Arena: ChimeState_Arena,
    Lobby: ChimeState_Lobby,
    Task: ChimeState_Task,
    Discuss: ChimeState_Discuss,
    Task_Dead: ChimeState_Task_Dead,
    Discuss_Dead: ChimeState_Discuss_Dead,
    Discuss_Arena: ChimeState_Discuss_Arena,

    Debug: ChimeState_Debug,
} as const;
type ChimeStateType = typeof ChimeStateType[keyof typeof ChimeStateType];

export type UseSocketIOClientProps = {
    url: string;
    tiles: VideoTileState[];
};

export type UseSocketIOClientState = {
    registerClient: (connectCode: string) => void;
    mergedGameState: GameState | null;
    pairUserNameAndAttendeeId: (userName: string, attendeeId: string, chimeName: string) => void;
    chimeState: ChimeState;
    addShowScreenAttendeeId: (attendeeId: string) => void;
    removeShowScreenAttendeeId: (attendeeId: string) => void;
    clearShowScreeAttendeeId: () => void;
    showScreen: string[];
};

export const useSocketIOClient = (props: UseSocketIOClientProps) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [mergedGameState, setMergedGameState] = useState<GameState | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [chimeState, setChimeState] = useState<ChimeState>(ChimeState_Arena);
    const [showScreen, setShowScreen] = useState<string[]>([]);
    const addShowScreenAttendeeId = (attendeeId: string) => {
        setShowScreen([...showScreen, attendeeId]);
    };
    const removeShowScreenAttendeeId = (attendeeId: string) => {
        setShowScreen(
            showScreen.filter((x) => {
                return x !== attendeeId;
            })
        );
    };
    const clearShowScreeAttendeeId = () => {
        setShowScreen([]);
    };

    useEffect(() => {
        if (!gameState) return;
        console.log("NEW GAme STATE!!!!::::", gameState);
        // determine chime state
        const player = gameState.players.find((x) => {
            return x.name === userName;
        });
        if (!player) {
            // Case.1 not user
            if (gameState.state == GameStateType.discussion) {
                console.log("NEW GAme STATE!!!!::::1");
                // Case.1-1 players are discussing in game
                console.log(`[AMONGUS] ${ChimeStateType.Discuss_Arena.description}`);
                setChimeState(ChimeStateType.Discuss_Arena);
            } else {
                // Case.1-2 players are not discussing in game
                console.log("NEW GAme STATE!!!!::::2", gameState.state, GameStateType.discussion);
                console.log(`[AMONGUS] ${ChimeStateType.Arena.description}`);
                setChimeState(ChimeStateType.Arena);
            }
        } else {
            // Case.2 player
            console.log("NEW GAme STATE!!!!::::3");

            if (gameState.state == GameStateType.task) {
                if (player.isDead || player.disconnected) {
                    // Case.2-1 player is dead and game is under task
                    console.log(`[AMONGUS] ${ChimeStateType.Task_Dead.description}`);
                    setChimeState(ChimeStateType.Task_Dead);
                } else {
                    // Case.2-2 player is alive and game is under task
                    console.log(`[AMONGUS] ${ChimeStateType.Task.description}`);
                    setChimeState(ChimeStateType.Task);
                }
            } else if (gameState.state == GameStateType.discussion) {
                if (player.isDead || player.disconnected) {
                    // Case.2-3 player is alive and game is under discussion
                    console.log(`[AMONGUS] ${ChimeStateType.Discuss_Dead.description}`);
                    setChimeState(ChimeStateType.Discuss_Dead);
                } else {
                    // Case.2-2 player is alive and game is under discussion
                    console.log(`[AMONGUS] ${ChimeStateType.Discuss.description}`);
                    setChimeState(ChimeStateType.Discuss);
                }
            } else if (gameState.state == GameStateType.lobby) {
                console.log(`[AMONGUS] ${ChimeStateType.Lobby.description}`);
                setChimeState(ChimeStateType.Lobby);
            }
        }
    }, [gameState, userName]);

    const tileKey = props.tiles.reduce((prev, cur) => {
        return `${prev}_${cur.boundAttendeeId}`;
    }, "");
    useEffect(() => {
        if (!gameState) return;
        gameState.players.forEach((x) => {
            if (x.attendeeId) {
                if (showScreen.includes(x.attendeeId)) {
                    x.showScreen_local = true;
                } else {
                    x.showScreen_local = false;
                }
            } else {
                x.showScreen_local = false;
            }
        });

        gameState.players.forEach((x) => {
            const tile = props.tiles.find((tile) => {
                return tile.boundAttendeeId === x.attendeeId;
            });
            // console.log(`share tie ${x.attendeeId} `, tile, props.tiles);
            if (tile) {
                x.shareScreen_local = true;
            } else {
                x.shareScreen_local = false;
            }
        });
        console.log("invole;;;;;;");
        setMergedGameState({ ...gameState });
    }, [gameState, showScreen, tileKey]);

    const socketIOClient = useMemo(() => {
        const socket = io(props.url);
        socket.on("connect", () => console.log("[useSocketIOClient] connect"));
        socket.on("updateGameState", (data) => {
            const gameState = JSON.parse(data) as GameState;
            // console.log(`${JSON.stringify(gameState, null, "\t")}`);
            setGameState(gameState);
        });
        return socket;
    }, []);

    const registerClient = (connectCode: string) => {
        socketIOClient.emit("register_client", connectCode);
    };
    const pairUserNameAndAttendeeId = (userName: string, attendeeId: string, chimeName: string) => {
        const req: PairUserNameAndAttendeeIdRequest = {
            name: userName,
            attendeeId: attendeeId,
            chimeName: chimeName,
        };
        socketIOClient.emit("pairUserNameAndAttendeeId", JSON.stringify(req));
        setUserName(userName);
    };

    const returnValue: UseSocketIOClientState = {
        registerClient,
        mergedGameState,
        pairUserNameAndAttendeeId,
        chimeState,
        addShowScreenAttendeeId,
        removeShowScreenAttendeeId,
        clearShowScreeAttendeeId,
        showScreen,
    };
    return returnValue;
};
