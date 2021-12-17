import React, { useEffect, useMemo } from "react";
import { VideoTileState } from "amazon-chime-sdk-js";

import { useAppState } from "../../../../providers/AppStateProvider";
import { GameStateType } from "../../../../../../shared/src/amongus";

const ID_PREFIX = "FeatureView-video-";

export const GridView = () => {
    const { chimeClientState, socketIOClientState } = useAppState();
    const allTiles = chimeClientState.getAllTiles();

    // (1) early return for map
    if (!socketIOClientState.mergedGameState || socketIOClientState.mergedGameState.state == GameStateType.discussion || !socketIOClientState.chimeState.arenaViewScreen) {
        return <></>;
    }

    // (2)Determin which tile is shown
    let showTileAttendees: (string | null)[] = [];
    if (socketIOClientState.mergedGameState) {
        showTileAttendees = socketIOClientState.mergedGameState.players.map((x) => {
            if (x.shareScreen_local && x.showScreen_local) {
                // shared and selected.
                return x.attendeeId || null;
            } else {
                return null;
            }
        });
    }

    const targetTiles = allTiles.filter((x) => {
        return showTileAttendees.includes(x.boundAttendeeId!);
    });
    const notTargetTiles = allTiles.filter((x) => {
        return !showTileAttendees.includes(x.boundAttendeeId!);
    });

    // console.log("[Amongus] mainview: targetTiles", targetTiles);
    const targetTilesKey = targetTiles.reduce((prev, cur) => {
        return `${prev}_${cur.boundAttendeeId}`;
    }, "");

    // (3) generate View
    const generateGridView = (targetTiles: VideoTileState[]) => {
        console.log("usedbase gird view:::", targetTilesKey);
        const colNum = Math.ceil(Math.sqrt(targetTiles.length));
        const rowNum = Math.ceil(targetTiles.length / colNum);
        const widthPerTile = Math.floor(100 / colNum);
        const heightPerTile = Math.floor(100 / rowNum);

        const rows: JSX.Element[] = [];
        for (let row = 0; row < rowNum; row++) {
            const videoElems: JSX.Element[] = [];
            for (let col = 0; col < colNum; col++) {
                const elemId = `${ID_PREFIX}${row * colNum + col}`;
                const targetIndex = row * colNum + col;
                const targetTile = targetTiles[targetIndex];
                const userName = chimeClientState.attendees[targetTile.boundAttendeeId!].name;

                if (targetIndex < targetTiles.length) {
                    console.log("AAAlocaltile:::", targetTile.localTile);
                    console.log("AAAlocaltile:::", userName);
                    videoElems.push(
                        <div key={elemId} id={`DIVDIV-${elemId}`} style={{ width: `${widthPerTile}%`, height: `100%`, display: "flex", justifyContent: "center" }}>
                            {/* <video key={elemId} id={elemId} style={{ objectFit: "contain", width: `${widthPerTile}%`, height: `100%` }}></video> */}
                            <video key={elemId} id={elemId} style={{ objectFit: "contain", width: `100%`, height: `100%` }}></video>
                            <div style={{ position: "absolute", bottom: "10px", backgroundColor: "#ffffff" }}>name:{userName}</div>
                        </div>
                    );
                    // videoElems.push(<video key={elemId} id={elemId} style={{ objectFit: "contain", width: `100%`, height: `100%` }}></video>);
                }
            }
            const rowElem = (
                <div key={`${ID_PREFIX}row_${row}`} style={{ width: "100%", height: `${heightPerTile}%`, display: "flex", justifyContent: "center" }}>
                    {videoElems}
                </div>
            );
            rows.push(rowElem);
        }
        return <>{rows}</>;
    };
    const gridVew = useMemo(() => {
        return generateGridView(targetTiles);
    }, [targetTilesKey, socketIOClientState.mergedGameState?.state, socketIOClientState.chimeState.arenaViewScreen]); // ゲーム環境が変わるか(state)、プレイヤーステータスが変わるか(arenaViewScreen)

    // (4) bind video
    useEffect(() => {
        targetTiles.forEach((x, i) => {
            const targetVideoElem = document.getElementById(`${ID_PREFIX}${i}`) as HTMLVideoElement;
            console.log(x.tileId, `${ID_PREFIX}${i}`);
            if (x.tileId && targetVideoElem) {
                console.log(`RENDER IMAGE:::: ${x.tileId}`, targetVideoElem);
                chimeClientState.bindVideoElement(x.tileId, targetVideoElem);
            } else {
                console.log(`NOT RENDER IMAGE:::: ${x.tileId}`, targetVideoElem);
            }
        });
        return () => {
            targetTiles.forEach((x) => {
                if (x.tileId) {
                    chimeClientState.unbindVideoElement(x.tileId);
                }
            });
        };
    }, [targetTilesKey, socketIOClientState.mergedGameState?.state, socketIOClientState.chimeState.arenaViewScreen]);

    // (5)  activate/inactivate video
    useEffect(() => {
        targetTiles.forEach((x) => {
            chimeClientState.pauseVideo(x.boundAttendeeId!, false);
        });
        notTargetTiles.forEach((x) => {
            chimeClientState.pauseVideo(x.boundAttendeeId!, true);
        });
    }, [targetTilesKey, socketIOClientState.mergedGameState?.state, socketIOClientState.chimeState.arenaViewScreen]);

    return <>{gridVew}</>;
};

export const useMainView = () => {
    const { chimeClientState, socketIOClientState } = useAppState();

    const mapView = useMemo(() => {
        if (!socketIOClientState.mergedGameState || socketIOClientState.mergedGameState.state == GameStateType.discussion || !socketIOClientState.chimeState.arenaViewScreen) {
            const allTiles = chimeClientState.getAllTiles();
            // stop video
            allTiles.forEach((x) => {
                chimeClientState.pauseVideo(x.boundAttendeeId!, true);
            });

            const mapFileNames = ["map00_Skeld.png", "map01_Mira.png", "map02_Polus.png", "map03_dlekS.png", "map04_Airship.png"];
            const mapFile = mapFileNames[socketIOClientState.mergedGameState ? socketIOClientState.mergedGameState.map : 0];
            const imgSrc = `./resources/amongus/map/${mapFile}`;
            return <img src={imgSrc} style={{ objectFit: "contain", width: `100%`, height: `100%` }}></img>;
        } else {
            return <></>;
        }
    }, [socketIOClientState.mergedGameState?.state, socketIOClientState.chimeState.arenaViewScreen]);

    const gridView = <GridView />;

    const mainView = !socketIOClientState.mergedGameState || socketIOClientState.mergedGameState.state == GameStateType.discussion || !socketIOClientState.chimeState.arenaViewScreen ? mapView : gridView;

    // const mainView = useMemo(() => {
    //     if (!socketIOClientState.mergedGameState || socketIOClientState.mergedGameState.state == GameStateType.discussion || !socketIOClientState.chimeState.arenaViewScreen) {

    //         const { socketIOClientState } = useAppState();
    //         const mapFileNames = ["map00_Skeld.png", "map01_Mira.png", "map02_Polus.png", "map03_dlekS.png", "map04_Airship.png"];
    //         const mapFile = mapFileNames[socketIOClientState.mergedGameState ? socketIOClientState.mergedGameState.map : 0];
    //         const imgSrc = `./resources/amongus/map/${mapFile}`;
    //         return <img src={imgSrc} style={{ objectFit: "contain", width: `100%`, height: `100%` }}></img>;
    //     } else {
    //         return
    //     }
    // }, [targetTilesKey, socketIOClientState.mergedGameState?.map, socketIOClientState.mergedGameState?.state, socketIOClientState.chimeState.arenaViewScreen]);

    return { mainView };
};
