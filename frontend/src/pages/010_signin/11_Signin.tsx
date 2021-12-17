import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState } from "react";
import { DEFAULT_REGION } from "../../constants";
import { useAppState } from "../../providers/AppStateProvider";
import { FOR_FEDERATION, STAGE } from "../../providers/hooks/useStageManager";
// import { CustomSelect } from "../000_common/CustomSelect";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const SignIn = () => {
    const { setMessage, setStage, userAuthClientState, setToken } = useAppState();

    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onSignInClicked = async () => {
        setIsLoading(true);
        try {
            const res = await userAuthClientState.signin(userAuthClientState.roomName, userAuthClientState.username, userAuthClientState.password, userAuthClientState.webSecret);
            if (res.isFailure()) {
                throw new Error("signin failed");
            }
            setIsLoading(false);
            console.log(`TOKEN:::${res.value}`);
            setToken(res.value);
            setStage(FOR_FEDERATION.SLACK_SIGNUP);
        } catch (e: any) {
            console.log("sign in error:::", e);
            setMessage("Exception", "Signin error", [``]);
            setIsLoading(false);
        }
    };

    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => userAuthClientState.setRoomName(e.target.value)} label="room name" secret={false} height={20} fontsize={16} defaultValue={userAuthClientState.roomName} autofocus />
                <CustomTextField onChange={(e) => userAuthClientState.setUsername(e.target.value)} label="username" secret={false} height={20} fontsize={16} defaultValue={userAuthClientState.username} autofocus />
                <CustomTextField onChange={(e) => userAuthClientState.setPassword(e.target.value)} label="password" secret={true} height={20} fontsize={16} defaultValue={userAuthClientState.password} />
                <CustomTextField onChange={(e) => userAuthClientState.setWebSecret(e.target.value)} label="web_secret" secret={true} height={20} fontsize={16} defaultValue={userAuthClientState.webSecret} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button id="submit" variant="contained" color="primary" className={classes.submit} onClick={onSignInClicked}>
                        Sign in
                    </Button>
                )}
            </div>
        </>
    );
    const links = [
        {
            title: "Sign up",
            onClick: () => {
                setStage(STAGE.SIGNUP);
            },
        },
        {
            title: "Forgot or chnage password",
            onClick: () => {
                setStage(STAGE.CHANGE_PASSWORD);
            },
        },
    ];

    return (
        <>
            <Questionnaire avatorIcon={<Lock />} title="Sign in" forms={forms} links={links} />
        </>
    );
};
