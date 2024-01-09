import { BoardContextProvider } from "./boards/board-context";
import { DropHandlerContextProvider } from "./drop/drop-handler-context";
import { PaperContextProvider } from "./papers/paper-context";
import { ThemeContextProvider } from "./theme/theme-context";

export function AppContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {

    return (
        <ThemeContextProvider>
            <PaperContextProvider>
                <BoardContextProvider>
                    <DropHandlerContextProvider>
                        {/* Add other contexts here */}
                        {children}
                    </DropHandlerContextProvider>
                </BoardContextProvider>
            </PaperContextProvider>
        </ThemeContextProvider>
    );
}

