import { createContext, useContext, useEffect, useReducer } from "react";
import { paperContextReducer } from "./paper-reducer";
import { PaperContextAction, PaperContextState } from "./paper-context-types";

export const InitialPaperContext: PaperContextState = {
    filteredPapers: [], // TODO: get from server
    selectedPapers: [],
    focusedPaper: null,
    paging: {
        page: 0,
        pageSize: 100,
        total: 0,
    }
};

const PaperContext = createContext<PaperContextState>(InitialPaperContext);

const PaperDispatchContext = createContext<React.Dispatch<PaperContextAction>>(() => { });

export function PaperContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    const [papers, dispatch] = useReducer(paperContextReducer, InitialPaperContext);
    useEffect(() => {
        console.log("ServiceProvider: ", window.ServiceProvider)
        window.ServiceProvider.AppServices().PaperService.getAllPapers().then(papers => {
            dispatch({ type: "LOAD_PAPERS", papers });
        });
    }, []);
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