import { Server } from "http";
import * as io from "socket.io";
import { LOCAL_DEV } from "..";
import { GameState, PairUserNameAndAttendeeIdRequest } from "../000_sharedData/amongus";

const TRIGGERS_FROM_CAPTURE = {
    connectCode: "connectCode",
    state: "state",
    player: "player",
    lobby: "lobby",
    gameover: "gameover",
    disconnect: "disconnect",
} as const;
type TRIGGERS_FROM_CAPTURE = typeof TRIGGERS_FROM_CAPTURE[keyof typeof TRIGGERS_FROM_CAPTURE];

type GameRoomState = {
    gameState: GameState;
    capture?: io.Socket;
    clients: io.Socket[];
};
type GameRoomStates = { [code: string]: GameRoomState };
const gameRoomStates: GameRoomStates = {};

type SocketCodeMap = { [socketId: string]: string };
const captureSocketCodeMap: SocketCodeMap = {};
const clientSocketCodeMap: SocketCodeMap = {};

const getInitialGameRoomState = (): GameRoomState => {
    return {
        gameState: {
            state: 3,
            lobbyCode: "",
            gameRegion: 0,
            map: 0,
            connectCode: "",
            players: [],
        },
        clients: [],
    };
};

const emitUpdateToClient = (gameRoomState: GameRoomState) => {
    // console.log(`[SocketIO] Emit update to client1! ${gameRoomState.clients.length}`);
    gameRoomState.clients.forEach((x) => {
        x.emit("updateGameState", JSON.stringify(gameRoomState.gameState));
    });
};

export const setupSocketIO = (server: Server) => {
    let io_server: io.Server;
    if (LOCAL_DEV) {
        io_server = new io.Server(server, {
            allowEIO3: true,
            cors: {
                origin: "https://localhost:3000",
                methods: ["GET", "POST"],
            },
        });
    } else {
        io_server = new io.Server(server, {
            allowEIO3: true,
        });
    }

    io_server.on("connection", (client) => {
        //////////////////////////////
        // (1) From Capture
        //////////////////////////////
        //// (1-1) register connect code
        client.on(TRIGGERS_FROM_CAPTURE.connectCode, (connectCode) => {
            console.log(`[SocketIO] new capture connected: ${connectCode}`);
            if (!gameRoomStates[connectCode]) {
                gameRoomStates[connectCode] = getInitialGameRoomState();
            }
            gameRoomStates[connectCode].capture = client;
            captureSocketCodeMap[client.id] = connectCode;
        });

        //// (1-2) Lobby data update
        client.on(TRIGGERS_FROM_CAPTURE.lobby, (data) => {
            const connectCode = captureSocketCodeMap[client.id];
            console.log(`[SocketIO]${connectCode} lobby: ${JSON.stringify(data)}`);
            const lobbyData = JSON.parse(data);

            const gameRoomState = gameRoomStates[connectCode];
            gameRoomState.gameState.lobbyCode = lobbyData.LobbyCode;
            gameRoomState.gameState.gameRegion = lobbyData.Region;
            gameRoomState.gameState.map = lobbyData.Map;
            emitUpdateToClient(gameRoomState);
            // request data ID
            // enum GameDataType{
            //     GameState = 1,
            //     Players = 2,
            //     LobbyCode = 4
            // }
            client.emit("requestdata", 2);
        });

        //// (1-3) state data update
        client.on(TRIGGERS_FROM_CAPTURE.state, (index) => {
            const connectCode = captureSocketCodeMap[client.id];
            console.log(`[SocketIO]${connectCode} state: ${JSON.stringify(index)}`);

            const gameRoomState = gameRoomStates[connectCode];
            if (index == 0 || index == 3) {
                // Lobby(0),Menu(3)
                gameRoomState.gameState.players = [];
            }
            gameRoomState.gameState.state = index;
            emitUpdateToClient(gameRoomState);
        });

        //// (1-4) player data update
        client.on(TRIGGERS_FROM_CAPTURE.player, (data) => {
            const connectCode = captureSocketCodeMap[client.id];
            console.log(`[SocketIO]${connectCode} player: ${JSON.stringify(data)}`);

            const gameRoomState = gameRoomStates[connectCode];

            const playerData = JSON.parse(data);

            const updatePlayer = gameRoomState.gameState.players.filter((x) => {
                return x.name === playerData.Name;
            });
            const otherPlayers = gameRoomState.gameState.players.filter((x) => {
                return x.name !== playerData.Name;
            });

            if (updatePlayer.length === 0) {
                // New Player
                const newPlayer = {
                    name: playerData.Name,
                    isDead: playerData.IsDead,
                    isDeadDiscovered: false,
                    disconnected: playerData.Disconnected,
                    action: parseInt(playerData.Action),
                    color: parseInt(playerData.Color),
                };
                updatePlayer.push(newPlayer);
            } else {
                // Update Player
                updatePlayer[0].name = playerData.Name;
                updatePlayer[0].isDead = playerData.IsDead;
                updatePlayer[0].disconnected = playerData.Disconnected;
                updatePlayer[0].action = parseInt(playerData.Action);
                updatePlayer[0].color = parseInt(playerData.Color);
                if (updatePlayer[0].action == 6) {
                    // When user is purged, the user status is discovered immidiately
                    updatePlayer[0].isDeadDiscovered = true;
                }
            }

            if (parseInt(playerData.Action) === 1) {
                // when action is leave, not add the new player(= delete the user)
            } else {
                otherPlayers.push(...updatePlayer);
            }
            gameRoomState.gameState.players = otherPlayers;
            emitUpdateToClient(gameRoomState);
        });

        //// (1-5) disconnected
        client.on(TRIGGERS_FROM_CAPTURE.disconnect, () => {
            const connectCode = captureSocketCodeMap[client.id];
            console.log(`[SocketIO]${connectCode} disconnected`);
            // delete gameRoomStates[connectCode]; // 無効化：キャプチャが再起動するときに初期化されるので
        });

        //// (1-6) gameover
        client.on(TRIGGERS_FROM_CAPTURE.gameover, (data) => {
            const connectCode = captureSocketCodeMap[client.id];
            console.log(`[SocketIO]${connectCode} gameover ${JSON.stringify(data)}`);
        });

        ///////////////////////////
        // (2) From Client
        ///////////////////////////
        //// (2-1) register connect code
        client.on("register_client", (connectCode) => {
            console.log(`[SocketIO][client] connect code: ${connectCode}`);
            if (!gameRoomStates[connectCode]) {
                gameRoomStates[connectCode] = getInitialGameRoomState();
            }
            gameRoomStates[connectCode].clients.push(client);
            clientSocketCodeMap[client.id] = connectCode;
        });

        //// (2-2) pair name and attendeeid
        client.on("pairUserNameAndAttendeeId", (data) => {
            const connectCode = clientSocketCodeMap[client.id];
            console.log(`[SocketIO][client] ${connectCode} pair name: ${data}`);
            const pairNameData = JSON.parse(data) as PairUserNameAndAttendeeIdRequest;
            const gameRoomState = gameRoomStates[connectCode];
            if (!gameRoomState) {
                return;
            }

            const previous = gameRoomState.gameState.players.find((x) => {
                return x.attendeeId === pairNameData.attendeeId;
            });
            if (previous) {
                previous.attendeeId = undefined;
                previous.chimeName = undefined;
            }
            const targetPlayer = gameRoomState.gameState.players.find((x) => {
                return x.name === pairNameData.name;
            });
            if (targetPlayer) {
                targetPlayer.attendeeId = pairNameData.attendeeId;
                targetPlayer.chimeName = pairNameData.chimeName;
            }
            emitUpdateToClient(gameRoomState);
        });

        //// (2-3) whiteboard data
        client.on("whiteboard", (data) => {
            const connectCode = clientSocketCodeMap[client.id];
            console.log(`[SocketIO][client] ${connectCode} whiteboard: ${data}`);
            const pairNameData = JSON.parse(data);
            // const gameRoomState = gameRoomStates[connectCode];
            // const targetPlayer = gameRoomState.gameState.players.find((x) => {
            //     return x.name === pairNameData.name;
            // });
            // targetPlayer.attendeeId = pairNameData.attendeeid;
            // targetPlayer.chimeName = pairNameData.chimeName;
            // emitUpdateToClient(gameRoomState);
        });
    });
};
