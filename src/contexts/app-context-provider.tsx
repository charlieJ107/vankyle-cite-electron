import { PaperContextProvider } from "./papers/paper-context";
import { ThemeContextProvider } from "./theme/theme-context";

export function AppContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {

    return (
        <PaperContextProvider>
            <ThemeContextProvider>
                {/* Add other contexts here */}
                {children}
            </ThemeContextProvider>
        </PaperContextProvider>
    );
}

