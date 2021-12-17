import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { STAGE } from "../../providers/hooks/useStageManager";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const SignUp = () => {
    const { userAuthClientState, setMessage, setStage } = useAppState();

    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onSignUpClicked = async () => {
        setIsLoading(true);
        try {
            const res = await userAuthClientState.signup(userAuthClientState.username, userAuthClientState.password);
            if (res.isSuccess()) {
                setMessage("Info", "Signup success", [`User created.`]);
                setIsLoading(false);
                setStage(STAGE.SIGNIN);
            } else {
                setMessage("Exception", "Signup error", [`${res.value}`]);
                setIsLoading(false);
            }
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "Signup error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };
    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => userAuthClientState.setUsername(e.target.value)} label="username" secret={false} height={20} fontsize={16} autofocus defaultValue={userAuthClientState.username} />
                <CustomTextField onChange={(e) => userAuthClientState.setPassword(e.target.value)} label="password" secret={true} height={20} fontsize={16} defaultValue={userAuthClientState.password} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" className={classes.submit} onClick={onSignUpClicked}>
                        Sign up
                    </Button>
                )}
            </div>
        </>
    );
    const links = [
        {
            title: "return to home",
            onClick: () => {
                setStage(STAGE.SIGNIN);
            },
        },
    ];

    return (
        <>
            <Questionnaire avatorIcon={<Lock />} title="Sign up" forms={forms} links={links} />
        </>
    );
};
