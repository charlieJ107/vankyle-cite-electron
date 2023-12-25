import { BoardContextProvider } from "./boards/board-context";
import { PaperContextProvider } from "./papers/paper-context";
import { ThemeContextProvider } from "./theme/theme-context";

export function AppContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {

    return (
        <ThemeContextProvider>
            <PaperContextProvider>
                <BoardContextProvider>
                    {/* Add other contexts here */}
                    {children}
                </BoardContextProvider>
            </PaperContextProvider>
        </ThemeContextProvider>
    );
}

