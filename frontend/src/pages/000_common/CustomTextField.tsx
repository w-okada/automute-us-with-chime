import React, { useState } from "react";
import { makeStyles, TextField, Theme } from "@material-ui/core";

interface UseCustomTextFieldStylesProps {
    height: number;
    fontsize: number;
}

const useCustomTextFieldStyles = makeStyles<Theme, UseCustomTextFieldStylesProps>(() => ({
    input: {
        color: "white",
        height: ({ height }) => height,
        fontSize: ({ fontsize }) => fontsize,
        border: "none",
        borderBottom: "inset 1px " + "white",
        "&:hover,&:active": {
            // color: "red",
            borderBottom: "inset 1px " + "white",
        },
    },

    inputFocused: {
        color: "white",
        height: ({ height }) => height,
        fontSize: ({ fontsize }) => fontsize,
        border: "none",
        borderBottom: "inset 1px " + "white",
    },
    inputLabel: {
        color: "white",
        height: ({ height }) => height,
        fontSize: ({ fontsize }) => fontsize,
        "&:hover,&:active": {
            color: "white",
            height: ({ height }) => height,
            fontSize: ({ fontsize }) => fontsize,
        },
    },
    inputLabelFocused: {
        color: "white",
        height: ({ height }) => height,
        fontSize: ({ fontsize }) => fontsize,
    },
}));

export type CustomTextFieldProps = {
    label: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    secret: boolean;
    autofocus?: boolean;
    height: number;
    fontsize: number;
    defaultValue?: string;
};

export const CustomTextField = (props: CustomTextFieldProps) => {
    const classes = useCustomTextFieldStyles({ height: props.height, fontsize: props.fontsize });
    const [value, setValue] = useState(props.defaultValue || "");
    return (
        <TextField
            required
            variant="standard"
            margin="dense"
            size="small"
            fullWidth
            id={props.label}
            name={props.label}
            label={props.label}
            autoFocus={props.autofocus ? true : false}
            value={value}
            onChange={(e) => {
                props.onChange(e);
                setValue(e.target.value);
            }}
            InputProps={{
                classes: {
                    root: classes.input,
                    focused: classes.inputFocused,
                },
                type: props.secret ? "password" : "",
            }}
            InputLabelProps={{
                shrink: true,
                classes: {
                    root: classes.inputLabel,
                    focused: classes.inputLabelFocused,
                },
            }}
        />
    );
};
