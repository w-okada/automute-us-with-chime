import { AppBar, Toolbar, Typography } from "@material-ui/core";
import React, { useMemo, useState } from "react";
import { GameState_List, Regions_List, Map_List } from "../../../../../../shared/src/amongus";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";
import { useStyles } from "../../css";
import { useDeviceStatus } from "./useDeviceStatus";
import { useDialogOpener } from "./useDialogOpener";
import { useFeatureEnabler } from "./useFeatureEnabler";
import { usePlayerStatus } from "./usePlayerStatus";
import { usePlayerSelector } from "./useSelector";

export const useAppbar = () => {
    const classes = useStyles();

    // const { microphoneButton, cameraButton, speakerButton } = useDeviceEnabler();
    const { microphoneButton, speakerButton, cameraButton, tileViewButton } = useDeviceStatus();
    const { screenShareButton, sideBarButton, attendeesViewButton, transcribeButton } = useFeatureEnabler();
    const { settingButton, leaveButton } = useDialogOpener();
    const { playerSelector } = usePlayerSelector();
    const { playerIconsBar } = usePlayerStatus();
    const { windowSize, frontendState, chimeClientState, socketIOClientState } = useAppState();
    const appBar = useMemo(() => {
        return (
            <AppBar style={{ height: ToolbarHeight, backgroundColor: "#000000" }}>
                <Toolbar style={{ height: ToolbarHeight, display: "flex", justifyContent: "space-between" }}>
                    <div className={classes.toolbarInnnerBox}>{/* <DrawerOpener open={drawerOpen} setOpen={setDrawerOpen} /> */}</div>
                    <div className={classes.toolbarInnnerBox}>
                        <div> {`${chimeClientState.userName || ""}@${chimeClientState.meetingName}`}</div>
                        <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                        <div> {`${socketIOClientState.mergedGameState?.lobbyCode || ""}[${socketIOClientState.mergedGameState ? Regions_List[socketIOClientState.mergedGameState.gameRegion] : ""}]`}</div>
                        <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                        <div>{`map:${Map_List[socketIOClientState.mergedGameState?.map || 0]}, state:${GameState_List[socketIOClientState.mergedGameState?.state || 0]}`}</div>
                        <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                        <div>{`${socketIOClientState.chimeState.description}`}</div>
                    </div>
                    <div className={classes.toolbarInnnerBox}>
                        <div className={classes.toolbarInnnerBox}>
                            {playerSelector}
                            {playerIconsBar}

                            <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                            {microphoneButton}
                            {speakerButton}
                            {tileViewButton}
                            <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                            {cameraButton}
                            <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                            {sideBarButton}
                            {/* {attendeesViewButton} */}
                            {screenShareButton}
                            {/* {transcribeButton} */}
                            <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                            {settingButton}
                            {leaveButton}
                        </div>
                        <div className={classes.toolbarInnnerBox}></div>
                    </div>
                </Toolbar>
            </AppBar>
        );
    }, [socketIOClientState.chimeState.description, microphoneButton, speakerButton, cameraButton, tileViewButton, screenShareButton, transcribeButton, sideBarButton, attendeesViewButton, settingButton, leaveButton, playerSelector, playerIconsBar]);

    return { appBar };
};
