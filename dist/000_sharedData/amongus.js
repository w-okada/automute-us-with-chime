"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Map_List = exports.COLORS_RGB = exports.COLORS = exports.COLORS_LIST = exports.actions = exports.Regions_List = exports.regions = exports.GameState_List = exports.GameStateType = void 0;
exports.GameStateType = {
    lobby: 0,
    task: 1,
    discussion: 2,
    menu: 3,
};
exports.GameState_List = ["lobby", "task", "discussion", "menu"];
exports.regions = {
    NorthAmerica: "North America",
    Asia: "Asia",
    Europe: "Europe",
};
exports.Regions_List = ["North America", "Asia", "Europe"];
exports.actions = {
    JOIN: 0,
    LEAVE: 1,
    KILL: 2,
    COLOR_CHANGE: 3,
    FORCE_UPDATE: 4,
    DISCONNECT: 5,
    EXILE: 6,
};
exports.COLORS_LIST = ["red", "blue", "green", "pink", "orange", "yellow", "black", "white", "purple", "brown", "cyan", "lime", "maroon", "rose", "banana", "tan", "sunset", "sunset", "sunset"];
// export const COLORS = {
//     red: 0,
//     blue: 1,
//     green: 2,
//     pink: 3,
//     orange: 4,
//     yellow: 5,
//     black: 6,
//     white: 7,
//     purple: 8,
//     brown: 9,
//     cyan: 10,
//     lime: 11,
//     maroon: 12,
//     rose: 13,
//     banana: 14,
//     gray: 15,
//     tan: 16,
//     sunset: 17,
// } as const;
exports.COLORS = {
    red: "red",
    blue: "blue",
    green: "green",
    pink: "pink",
    orange: "orange",
    yellow: "yellow",
    black: "black",
    white: "white",
    purple: "purple",
    brown: "brown",
    cyan: "cyan",
    lime: "lime",
    maroon: "maroon",
    rose: "rose",
    banana: "banana",
    gray: "gray",
    tan: "tan",
    sunset: "sunset",
};
exports.COLORS_RGB = {
    red: "#BE0032",
    blue: "#2252C1",
    green: "#3BAF75",
    pink: "#FF69B4",
    orange: "#E67928",
    yellow: "#F0E448",
    black: "#000000",
    white: "#FFFFFF",
    purple: "#A757A8",
    brown: "#6B3E08",
    cyan: "#66ffcc",
    lime: "#B9DD64",
    maroon: "#7F4428",
    rose: "#e83f5f",
    banana: "#FFBF11",
    tan: "#c1813f",
    sunset: "#f6b483",
};
exports.Map_List = ["Skeld", "Mira", "Polus", "dlekS", "Airship"];
