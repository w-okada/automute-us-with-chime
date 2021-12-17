import { useEffect } from "react";
import { useAppState } from "../../../providers/AppStateProvider";
import { ChimeState } from "../../../providers/hooks/useSocketIOClient";

export const useAudioController = () => {
    const { chimeClientState, socketIOClientState } = useAppState();

    useEffect(() => {
        if (socketIOClientState.chimeState.arenaMicrophone || socketIOClientState.chimeState.fieldMicrophone) {
            chimeClientState.setMute(false);
        } else {
            chimeClientState.setMute(true);
        }
    }, [socketIOClientState.chimeState]);

    useEffect(() => {
        if (socketIOClientState.chimeState.arenaSpeaker || socketIOClientState.chimeState.fieldSpeaker) {
            chimeClientState.setAudioOutputEnable(true);
        } else {
            chimeClientState.setAudioOutputEnable(false);
        }
    }, [socketIOClientState.chimeState]);
};
