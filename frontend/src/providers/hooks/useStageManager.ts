import { useState } from "react";

type UseStageManagerProps = {
    initialStage: STAGE | FOR_FEDERATION | null;
};

export const STAGE = {
    SIGNIN: "SIGNIN",
    SIGNUP: "SIGNUP",
    CHANGE_PASSWORD: "CHANGE_PASSWORD",
    ENTRANCE: "ENTRANCE",
    ENTRANCE_AS_GUEST: "ENTRANCE_AS_GUEST",
    CREATE_MEETING_ROOM: "CREATE_MEETING_ROOM",
    WAITING_ROOM: "WAITING_ROOM",
    MEETING_ROOM: "MEETING_ROOM",
} as const;
export type STAGE = typeof STAGE[keyof typeof STAGE];

export const FOR_FEDERATION = {
    SLACK_SIGNUP: "SLACK_SIGNUP",
    SLACK_SIGNUP2: "SLACK_SIGNUP2",
} as const;
export type FOR_FEDERATION = typeof FOR_FEDERATION[keyof typeof FOR_FEDERATION];

export const useStageManager = (props: UseStageManagerProps) => {
    const [stage, setStage] = useState<STAGE | FOR_FEDERATION>(props.initialStage || "SIGNIN");
    return { stage, setStage };
};
