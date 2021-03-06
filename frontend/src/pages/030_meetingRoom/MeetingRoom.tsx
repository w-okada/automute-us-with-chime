import React, { useEffect } from "react";
import { CssBaseline } from "@material-ui/core";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";

import { useAppState } from "../../providers/AppStateProvider";
import { useStyles } from "./css";

import { LeaveMeetingDialog } from "./components/dialog/LeaveMeetingDialog";

import { useAppbar } from "./components/appbar/useAppbar";
import { useMainView } from "./components/mainview/useMainView";
import { ToolbarHeight } from "../../constants";
import { SettingDialog } from "./components/dialog/SettingDialog";
import { useSidebar } from "./components/sidebar/useSidebar";
import { useAttendeesView } from "./components/AttendeesView/useAttendeesView";
import { useSubtitle } from "./components/subtitle/useSubtitle";

import { DrawingCanvas } from "@dannadori/flect-amazon-chime-lib2";
import { useAudioController } from "./hooks/useAudioController";

const BufferHeight = 20;
const theme = createTheme({
    mixins: {
        toolbar: {
            minHeight: ToolbarHeight,
        },
    },
});

export const MeetingRoom = () => {
    const { windowSize, chimeClientState, frontendState } = useAppState();
    const { appBar } = useAppbar();
    const { mainView } = useMainView();
    const { sideBar } = useSidebar();
    useAudioController();
    // const { attendeeViews } = useAttendeesView();
    // const { subtitle } = useSubtitle();

    useEffect(() => {
        const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement;
        audioElement.autoplay = false;
        chimeClientState.setOutputAudioElement(audioElement);
    }, []); // eslint-disable-line

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    overflowX: "hidden",
                    overflowY: "hidden",
                }}
            >
                <SettingDialog />
                <LeaveMeetingDialog />
                {appBar}
                <div
                    style={{
                        marginTop: ToolbarHeight,
                        position: "absolute",
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: `${windowSize.windowHeight - ToolbarHeight - BufferHeight}px`,
                    }}
                >
                    {mainView}
                    <div style={{ position: "absolute", top: "0%", left: "0%", width: "100%", height: "100%" }}>{/* <DrawingCanvas whiteboardClient={whiteboardClientState.whiteboardClient!} width={windowSize.windowWidth} height={windowSize.windowHeight - ToolbarHeight - BufferHeight} /> */}</div>
                    {frontendState.sideBarOpen ? <div style={{ position: "absolute", top: "5%", left: "2%", width: "10%", height: "90%" }}>{sideBar}</div> : <></>}
                    {/* {frontendState.attendeesViewOpen ? <div style={{ position: "absolute", top: "85%", left: "20%", width: "60%", height: "10%" }}>{attendeeViews}</div> : <></>} */}
                    {/* {chimeClientState.transcribeEnable ? <div style={{ position: "absolute", top: "85%", left: "20%", width: "60%", height: "10%" }}>{subtitle}</div> : <></>} */}
                </div>
            </div>

            {/* ************************************** */}
            {/* *****   Hidden Elements          ***** */}
            {/* ************************************** */}
            <div>
                <audio id="for-speaker" style={{ display: "none" }} />
            </div>
        </ThemeProvider>
    );
};
