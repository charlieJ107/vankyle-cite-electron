import { BoardContextProvider } from "./boards/board-context";
import { DropEventListenerContextProvider } from "./drag-drop/drag-drop-context";
import { PaperContextProvider } from "./papers/paper-context";
import { ThemeContextProvider } from "./theme/theme-context";

export function AppContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {

    return (
        <ThemeContextProvider>
            <PaperContextProvider>
                <BoardContextProvider>
                    <DropEventListenerContextProvider>
                        {/* Add other contexts here */}
                        {children}
                    </DropEventListenerContextProvider>
                </BoardContextProvider>
            </PaperContextProvider>
        </ThemeContextProvider>
    );
}

