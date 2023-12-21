import { PaperContextProvider } from "./papers";

export function AppContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {

    return (
        <PaperContextProvider>
            {/* Add other contexts here */}
            {children}
        </PaperContextProvider>
    );
}

