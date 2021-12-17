import { Tooltip } from "@material-ui/core";
import { Mic } from "@material-ui/icons";
import React, { useMemo } from "react";
import { COLORS, COLORS_LIST, COLORS_RGB, PlayerState } from "../../../../../../shared/src/amongus";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";

export const usePlayerStatus = () => {
    const { socketIOClientState } = useAppState();
    const playerIconsBarKey = socketIOClientState.mergedGameState?.players.reduce((prev, cur) => {
        return `${prev}_${cur.attendeeId}[${cur.isDead},${cur.isDeadDiscovered},${cur.showScreen_local},${cur.shareScreen_local}]`;
    }, "");
    const addShowScreen = (attendeeId: string) => {
        socketIOClientState.addShowScreenAttendeeId(attendeeId);
    };
    const removeShowScreen = (attendeeId: string) => {
        socketIOClientState.removeShowScreenAttendeeId(attendeeId);
    };

    const generateIcon2 = (player: PlayerState) => {
        const color_str = COLORS_LIST[player.color];
        const background = player.shareScreen_local ? (player.showScreen_local ? "#ee7777" : "#000000") : "#aaaaaa";
        const imgName = player.isDead ? `${color_str}_dead` : `${color_str}`;
        const onclick = player.shareScreen_local
            ? player.showScreen_local
                ? () => {
                      removeShowScreen(player.attendeeId!);
                  }
                : () => {
                      addShowScreen(player.attendeeId!);
                  }
            : () => {
                  console.log("screen is not share: nop");
              };
        return (
            <div style={{ backgroundColor: background, height: ToolbarHeight, width: ToolbarHeight }} onClick={onclick}>
                <Tooltip title={`${COLORS_LIST[player.color]}, ${player.name}/${player.chimeName}, ${player.isDead ? "dead" : "alive"}`}>
                    <img src={`./resources/amongus/${imgName}.png`} style={{ height: ToolbarHeight, width: ToolbarHeight }} />
                </Tooltip>
            </div>
        );
    };

    const playerIconsBar = useMemo(() => {
        if (!socketIOClientState.mergedGameState) {
            return <div>player loading...</div>;
        }
        const playerIcons = socketIOClientState.mergedGameState.players.map((player) => {
            return generateIcon2(player);
        });
        return <div style={{ display: "flex" }}>{playerIcons}</div>;
    }, [playerIconsBarKey]);
    return { playerIconsBar };
};
