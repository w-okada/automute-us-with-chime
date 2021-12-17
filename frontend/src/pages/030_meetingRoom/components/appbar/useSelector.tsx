import { FormControl, InputLabel, makeStyles, MenuItem, Select, Theme, Tooltip } from "@material-ui/core";
import { blueGrey } from "@mui/material/colors";
import React, { ChangeEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";

export const usePlayerSelector = () => {
    const { socketIOClientState, chimeClientState } = useAppState();
    const [userName, setUserName] = useState<string | undefined>(undefined);
    const playerListKey = socketIOClientState.mergedGameState?.players.reduce((prev, cur) => {
        return `${prev}_${cur.name}`;
    }, "");
    const playerList = useMemo(() => {
        if (!socketIOClientState.mergedGameState) {
            return [];
        }
        return socketIOClientState.mergedGameState.players.map((x) => {
            return <option value={x.name}>{x.name}</option>;
        });
    }, [playerListKey]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserName(e.target.value);
    };
    const playerSelector = useMemo(() => {
        return (
            <div>
                <select
                    value={userName}
                    onChange={(e) => {
                        handleChange(e);
                    }}
                >
                    <option value="">Audience</option>
                    {playerList}
                </select>
            </div>
        );
    }, [playerListKey, userName]);

    useEffect(() => {
        socketIOClientState.pairUserNameAndAttendeeId(userName || "", chimeClientState.attendeeId || "", chimeClientState.userName || "");
    }, [userName, playerListKey]);
    return { playerSelector };
};
