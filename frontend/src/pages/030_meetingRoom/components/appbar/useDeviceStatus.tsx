import { IconButton, Tooltip } from "@material-ui/core";
import { Mic, Videocam, ViewComfy, VolumeUp } from "@material-ui/icons";
import React, { useMemo } from "react";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";

const DeviceType = {
    Microphone: "Microphone",
    Speaker: "Speaker",
    Camera: "Camera",
    TileView: "TileView",
} as const;
type DeviceType = typeof DeviceType[keyof typeof DeviceType];

type DeviceStatusSetting = {
    onIcon: JSX.Element;
    offIcon: JSX.Element;
    onTooltip: string;
    offTooltip: string;
};

const DeviceStatusSettings: { [key in DeviceType]: DeviceStatusSetting } = {
    Microphone: {
        onIcon: <Mic style={{ color: "#ee7777" }} />,
        offIcon: <Mic />,
        onTooltip: "you can speak",
        offTooltip: "you cannnot speak",
    },
    Speaker: {
        onIcon: <VolumeUp style={{ color: "#ee7777" }} />,
        offIcon: <VolumeUp />,
        onTooltip: "you can hear",
        offTooltip: "you cannnot hear",
    },
    Camera: {
        onIcon: <Videocam style={{ color: "#ee7777" }} />,
        offIcon: <Videocam />,
        onTooltip: "you share display",
        offTooltip: "you didnot share display",
    },
    TileView: {
        onIcon: <ViewComfy style={{ color: "#ee7777" }} />,
        offIcon: <ViewComfy />,
        onTooltip: "you can see",
        offTooltip: "you cannnot see",
    },
};

export const useDeviceStatus = () => {
    const { socketIOClientState } = useAppState();

    const generateButton = (setting: DeviceStatusSetting, enable: boolean) => {
        console.log("view mute", enable);
        return (
            <Tooltip title={enable ? setting.onTooltip : setting.offTooltip}>
                <IconButton style={{ height: ToolbarHeight, width: ToolbarHeight }} color="inherit">
                    {enable ? setting.onIcon : setting.offIcon}
                </IconButton>
            </Tooltip>
        );
    };

    const microphoneButton = useMemo(() => {
        return generateButton(DeviceStatusSettings.Microphone, socketIOClientState.chimeState.arenaMicrophone || socketIOClientState.chimeState.fieldMicrophone);
    }, [socketIOClientState.chimeState.arenaMicrophone, socketIOClientState.chimeState.fieldMicrophone]);
    const speakerButton = useMemo(() => {
        return generateButton(DeviceStatusSettings.Speaker, socketIOClientState.chimeState.arenaSpeaker || socketIOClientState.chimeState.fieldSpeaker);
    }, [socketIOClientState.chimeState.arenaSpeaker, socketIOClientState.chimeState.fieldSpeaker]);
    const cameraButton = useMemo(() => {
        return generateButton(DeviceStatusSettings.Camera, socketIOClientState.chimeState.arenaShareScreen);
    }, [socketIOClientState.chimeState.arenaShareScreen]);
    const tileViewButton = useMemo(() => {
        return generateButton(DeviceStatusSettings.TileView, socketIOClientState.chimeState.arenaViewScreen);
    }, [socketIOClientState.chimeState.arenaViewScreen]);

    return { microphoneButton, speakerButton, cameraButton, tileViewButton };
};
