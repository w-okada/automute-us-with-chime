import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Typography } from "@material-ui/core";
import React, { useEffect, useState, useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import { useStyles } from "../../css";
import { DefaultDeviceController } from "amazon-chime-sdk-js";
import { CustomSelect } from "../../../000_common/CustomSelect";
import { VirtualBackgroundSegmentationType, NoiseSuppressionType } from "@dannadori/flect-amazon-chime-lib2";
import { TranscribeLangs } from "../../../../providers/hooks/useChimeClient";

export const SettingDialog = () => {
    // const classes = useStyles();
    const { chimeClientState, deviceState, frontendState } = useAppState();
    const audioInputDeviceId = typeof chimeClientState.audioInputDevice === "string" ? chimeClientState.audioInputDevice : "None";
    const noiseSuppressionType = chimeClientState.noiseSuppressionType;
    const videoInputDeviceId = typeof chimeClientState.videoInputDevice === "string" ? chimeClientState.videoInputDevice : "None";
    const segmentationType = chimeClientState.virtualBackgroundSegmentationType;
    const audioOutputDeviceId = chimeClientState.audioOutputDevice;

    const microphones = deviceState.mediaDeviceList.audioinput.map((x) => {
        return { label: x.label, value: x.deviceId };
    });
    const noiseSuppressions: { label: string; value: NoiseSuppressionType }[] = [
        { label: "None", value: "None" },
        { label: "auto", value: "auto" },
        { label: "c100", value: "c100" },
        { label: "c50", value: "c50" },
        { label: "c20", value: "c20" },
        { label: "c10", value: "c10" },
    ];

    // const transcribeLangs = useMemo(() => {
    //     const langs = [];
    //     for (const lang of Object.values(TranscribeLangs)) {
    //         langs.push({
    //             label: lang,
    //             value: lang,
    //         });
    //     }
    //     return langs;
    // }, []);

    const speakers = deviceState.mediaDeviceList.audiooutput.map((x) => {
        return { label: x.label, value: x.deviceId };
    });

    const setAudioInputDevice = async (value: string) => {
        //// for input movie experiment [start]
        const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement;
        videoElem.pause();
        videoElem.srcObject = null;
        videoElem.src = "";
        //// for input movie experiment [end]

        if (value === "None") {
            await chimeClientState.setAudioInput(null);
        } else {
            await chimeClientState.setAudioInput(value);
        }
    };

    const setNoiseSuppressionType = async (value: NoiseSuppressionType) => {
        if (value === "None") {
            await chimeClientState.setNoiseSuppressionEnable(false);
            await chimeClientState.setNoiseSuppressionType("None");
        } else {
            await chimeClientState.setNoiseSuppressionEnable(true);
            await chimeClientState.setNoiseSuppressionType(value);
        }
    };

    const setAudioOutputDevice = async (value: string) => {
        if (value === "None") {
            await chimeClientState.setAudioOutput(null);
        } else {
            await chimeClientState.setAudioOutput(value);
        }
    };

    return (
        <>
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                scroll="paper"
                open={frontendState.settingDialogOpen}
                onClose={() => {
                    frontendState.setSettingDialogOpen(false);
                }}
            >
                <DialogTitle>
                    <Typography gutterBottom>Settings</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h5" gutterBottom>
                        Devices and Effects
                    </Typography>
                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={setAudioInputDevice} label="Microhpone" height={16} fontsize={12} labelFontsize={16} items={microphones} defaultValue={audioInputDeviceId} />
                    </div>
                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={setAudioOutputDevice} label="Speaker" height={16} fontsize={12} labelFontsize={16} items={speakers} defaultValue={audioOutputDeviceId} />
                    </div>

                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={setNoiseSuppressionType} label="noise suppression" height={16} fontsize={12} labelFontsize={16} items={noiseSuppressions} defaultValue={noiseSuppressionType} />
                    </div>

                    {/* <div style={{ margin: 10 }}>
                        <CustomSelect onChange={chimeClientState.setTranscribeLang} label="transcribe lang" height={16} fontsize={12} labelFontsize={16} items={transcribeLangs} defaultValue={chimeClientState.transcribeLang} />
                    </div> */}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={(e) => {
                            frontendState.setSettingDialogOpen(false);
                        }}
                        color="primary"
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            <video id="for-input-movie" loop hidden />
        </>
    );
};
