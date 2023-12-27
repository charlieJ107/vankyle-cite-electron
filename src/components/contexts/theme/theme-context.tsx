import { BrandVariants, FluentProvider, Theme, createDarkTheme, createLightTheme, makeStyles, mergeClasses } from "@fluentui/react-components";
import { createContext, useContext, useState } from "react";

const vankyleGrayTheme: BrandVariants = {
    10: "#010306",
    20: "#0B1922",
    30: "#112936",
    40: "#1A3643",
    50: "#26424F",
    60: "#334F5B",
    70: "#405C67",
    80: "#4D6973",
    90: "#5C7780",
    100: "#6A858C",
    110: "#7A9399",
    120: "#8AA1A6",
    130: "#9AAFB3",
    140: "#ABBEC0",
    150: "#BDCCCE",
    160: "#CFDBDC"
};

const lightTheme: Theme = {
    ...createLightTheme(vankyleGrayTheme),
};

const darkTheme: Theme = {
    ...createDarkTheme(vankyleGrayTheme),
};


darkTheme.colorBrandForeground1 = vankyleGrayTheme[110];
darkTheme.colorBrandForeground2 = vankyleGrayTheme[120];

const useRootStyle = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflowBlock: "hidden"
    }
});

export type ThemeState = "light" | "dark";
const ThemeContext = createContext<ThemeState>("light");
const ThemeSetContext = createContext<React.Dispatch<React.SetStateAction<ThemeState>>>(() => { });

export function ThemeContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    const [theme, setTheme] = useState<ThemeState>("light");
    const rootStyle = useRootStyle();
    return (
        <ThemeContext.Provider value={theme}>
            <ThemeSetContext.Provider value={setTheme}>
                <FluentProvider theme={theme === "dark" ? darkTheme : lightTheme} className={mergeClasses(rootStyle.root)}>
                    {children}
                </FluentProvider>
            </ThemeSetContext.Provider>
        </ThemeContext.Provider>
    );
}


export function useTheme() {
    return useContext(ThemeContext);
}

