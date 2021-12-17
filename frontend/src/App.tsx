import React, { useMemo } from "react";
import { MessageDialog } from "./pages/000_common/MessageDialg";
import { SignIn } from "./pages/010_signin/11_Signin";
import { SignUp } from "./pages/010_signin/12_Signup";
import { ChangePassword } from "./pages/010_signin/13_ChangePassword";
import { Entrance } from "./pages/020_entrance/21_Entrance";
import { WaitingRoom } from "./pages/020_entrance/22_WaitingRoom";
import { CreateMeetingRoom } from "./pages/020_entrance/23_CreateMeetingRoom";
import { MeetingRoom } from "./pages/030_meetingRoom/MeetingRoom";
import { SigninFromSlack } from "./pages/100_federattion/101_slack/101_SigninFromSlack";
import { AppStateProvider, useAppState } from "./providers/AppStateProvider";
import { FOR_FEDERATION, STAGE } from "./providers/hooks/useStageManager";

const Router = () => {
    const { stage } = useAppState();
    console.log("STAGE:::", stage);
    const page = useMemo(() => {
        switch (stage) {
            case STAGE.SIGNIN:
                return <SignIn />;
            case STAGE.SIGNUP:
                return <SignUp />;
            case STAGE.CHANGE_PASSWORD:
                return <ChangePassword />;
            case STAGE.MEETING_ROOM:
                return <MeetingRoom />;
            case FOR_FEDERATION.SLACK_SIGNUP:
                return <SigninFromSlack />;
            // case "MEETING_MANAGER":
            //     return <MeetingManager />;
            // case "HEADLESS_MEETING_MANAGER":
            //     return <HeadlessMeetingManager />;
            default:
                return <div>no view</div>;
        }
    }, [stage]);
    return <div>{page}</div>;
};

const App = () => {
    //@ts-ignore
    document.body.style = "background: black;";
    return (
        <div>
            <AppStateProvider>
                <Router />
                <MessageDialog />
            </AppStateProvider>
        </div>
    );
};

export default App;
