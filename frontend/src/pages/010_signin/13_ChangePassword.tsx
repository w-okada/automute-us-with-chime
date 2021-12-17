import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { STAGE } from "../../providers/hooks/useStageManager";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const ChangePassword = () => {
    const { userAuthClientState, setMessage, setStage } = useAppState();
    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onChangePasswordClicked = async () => {
        setIsLoading(true);
        try {
            const result = await userAuthClientState.changePassword(userAuthClientState.username, userAuthClientState.password, userAuthClientState.newPassword);
            if (result.isSuccess()) {
                setMessage("Info", "password changed ", []);
                setIsLoading(false);
                setStage(STAGE.SIGNIN);
            } else {
                setMessage("Exception", "change password error", []);
                setIsLoading(false);
            }
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "change password error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };
    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => userAuthClientState.setUsername(e.target.value)} label="email" secret={false} height={20} fontsize={16} autofocus defaultValue={userAuthClientState.username} />
                <CustomTextField onChange={(e) => userAuthClientState.setPassword(e.target.value)} label="password" secret={true} height={20} fontsize={16} defaultValue={userAuthClientState.password} />
                <CustomTextField onChange={(e) => userAuthClientState.setNewPassword(e.target.value)} label="new password" secret={true} height={20} fontsize={16} defaultValue={userAuthClientState.newPassword} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" className={classes.submit} onClick={onChangePasswordClicked}>
                        Change Password
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
            <Questionnaire avatorIcon={<Lock />} title="New Password" forms={forms} links={links} />
        </>
    );
};
