import { VirtualBackground } from "@dannadori/flect-amazon-chime-lib2/dist/chime/frame/VirtualBackground";
import { VirtualBackgroundGoogleMeetTFJS } from "@dannadori/flect-amazon-chime-lib2/dist/chime/frame/VirtualBackgroundGoogleMeetTFJS";
import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState, useEffect } from "react";
import { DEFAULT_REGION } from "../../../constants";
import { useAppState } from "../../../providers/AppStateProvider";
import { STAGE } from "../../../providers/hooks/useStageManager";
// import { CustomSelect } from "../000_common/CustomSelect";
import { CustomTextField } from "../../000_common/CustomTextField";
import { Questionnaire } from "../../000_common/Questionnaire";
import { useStyles } from "../../000_common/Style";

export const SigninFromSlack = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fail, setFail] = useState(false);
    const { setMessage, setStage, chimeClientState, deviceState, slackRestApiBase, userAuthClientState, socketIOClientState } = useAppState();

    useEffect(() => {
        console.log(`[SigninFromSlack] REST ENDPOINT: ${slackRestApiBase}`);
        console.log(`[SigninFromSlack] Device:`, deviceState.mediaDeviceList);
        if (deviceState.mediaDeviceList.audioinput.length > 0) {
            const { defaultAudioInputDeviceId, defaultVideoInputDeviceId, defaultAudioOutputDeviceId } = deviceState.getDefaultDeviceIds();
            console.log(`[SigninFromSlack] Default Devices: ${defaultAudioInputDeviceId}, ${defaultVideoInputDeviceId}, ${defaultAudioOutputDeviceId}`);
            if (defaultAudioInputDeviceId === "") {
                console.log(`[SigninFromSlack] Default Devices: default audioinput is none? "${defaultAudioInputDeviceId}"... reload`);
                navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(() => {
                    deviceState.reloadDevices();
                });

                return;
            }
            console.log(`[SigninFromSlack] Setting Up Devices: ${defaultAudioInputDeviceId}, ${defaultVideoInputDeviceId}->not used, ${defaultAudioOutputDeviceId}`);

            userAuthClientState.getUserInformation().then(async (result) => {
                if (result.isFailure()) {
                    setFail(true);
                    return;
                }
                const userInfo = result.value;
                console.log(`[SigninFromSlack] UserInfo:`, userInfo);
                const meetingName = userInfo.roomName;
                const attendeeName = userInfo.chimeInfo!.attendeeName;
                const useDefault = userInfo.chimeInfo!.useDefault;

                try {
                    console.log(`[SigninFromSlack] Creating Meeting Room: ${meetingName}`);
                    await chimeClientState.createMeeting(meetingName, DEFAULT_REGION);
                    console.log(`[SigninFromSlack] Creating Meeting Room done: ${meetingName}`);
                } catch (e) {
                    console.log("create meeting exception:", e);
                }

                console.log(`[SigninFromSlack] Joining Meeting Room: ${meetingName} ${attendeeName}`);
                await chimeClientState.joinMeeting(meetingName, attendeeName);
                console.log(`[SigninFromSlack] Joining Meeting Room done: ${meetingName} ${attendeeName}`);
                await chimeClientState.setAudioInput(defaultAudioInputDeviceId);
                await chimeClientState.setAudioInputEnable(true);
                await chimeClientState.setVideoInput(null);
                await chimeClientState.setVirtualBackgroundSegmentationType("None");
                await chimeClientState.setVirtualBackgroundEnable(false);
                await chimeClientState.setVideoInputEnable(false);
                await chimeClientState.setAudioOutput(defaultAudioOutputDeviceId);
                await chimeClientState.setAudioOutputEnable(true);

                console.log(`[SigninFromSlack] Entering Meeting Room`);
                await chimeClientState.enterMeeting();
                console.log(`[SigninFromSlack] Entering Meeting Room done`);

                socketIOClientState.registerClient(userInfo.roomName);

                setStage(STAGE.MEETING_ROOM);
            });
        }
    }, [deviceState.mediaDeviceList]);

    const forms = (
        <>
            <div>processing....</div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>{isLoading ? <CircularProgress /> : fail ? <>access failed</> : <></>}</div>
        </>
    );

    return (
        <>
            <Questionnaire avatorIcon={<Lock />} title="Sign in" forms={forms} links={[]} />
        </>
    );
};
