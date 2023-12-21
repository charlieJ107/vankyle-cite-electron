import { BrandVariants, Theme, createDarkTheme, createLightTheme, makeStyles, tokens } from "@fluentui/react-components";

const vankylePurple: BrandVariants = {
    10: "#040205",
    20: "#1C1323",
    30: "#2F1D3E",
    40: "#3E2555",
    50: "#4F2D6D",
    60: "#603587",
    70: "#713DA0",
    80: "#8345BB",
    90: "#954ED7",
    100: "#A35EE3",
    110: "#AF71E7",
    120: "#BB83EA",
    130: "#C696EE",
    140: "#D1A8F1",
    150: "#DCBBF5",
    160: "#E6CDF8"
};

const lightTheme: Theme = {
    ...createLightTheme(vankylePurple),
};

const darkTheme: Theme = {
    ...createDarkTheme(vankylePurple),
};


darkTheme.colorBrandForeground1 = vankylePurple[110];
darkTheme.colorBrandForeground2 = vankylePurple[120];

export function useTheme() {
    return lightTheme;
}

export const useStyle = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflowBlock: "hidden"
    },
    header: {
        backgroundColor: tokens.colorBrandBackground
    },
    sideBar: {
        backgroundColor: tokens.colorBrandBackground2,
        zIndex: 1
    }
})