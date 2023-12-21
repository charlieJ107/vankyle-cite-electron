import { createContext, useContext, useReducer } from "react";
import { InitialPaperContext } from "./paper-context";
import { paperContextReducer } from "./paper-reducer";
import { PaperContextAction, PaperContextType } from "./paper-context-types";

const PaperContext = createContext<PaperContextType>(InitialPaperContext);

const PaperDispatchContext = createContext<React.Dispatch<PaperContextAction>>(() => { });

export function PaperContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    const [papers, dispatch] = useReducer(paperContextReducer, InitialPaperContext);
    return (
        <PaperContext.Provider value={papers} >
            <PaperDispatchContext.Provider value={dispatch}>
                {children}
            </PaperDispatchContext.Provider>
        </PaperContext.Provider>
    );
}


export function usePaperContext() {
    return useContext(PaperContext);
}

export function usePaperDispatch() {
    return useContext(PaperDispatchContext);
}