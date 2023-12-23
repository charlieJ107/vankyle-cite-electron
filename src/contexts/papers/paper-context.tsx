import { createContext, useContext, useReducer } from "react";
import { paperContextReducer } from "./paper-reducer";
import { PaperContextAction, PaperContextType } from "./paper-context-types";
import { Author } from "../../models/author";
import { Paper } from "../../models/paper";

const _dummyAuthorsForDev: Author[] = [
    // Generate dummy 3 authors for development
    {
        _id: 1,
        name: "Author 1",

    },
    {
        _id: 2,
        name: "Author 2",
    },
    {
        _id: 3,
        name: "Author 3",
    }
];

const _dummyPapersForDev: Paper[] = [
    // Generate dummy 3 papers for development
    {
        _id: 1,
        title: "Paper 1",
        authors: _dummyAuthorsForDev,
        publishType: "Journal",
        addTime: new Date(),
        rating: 0,
        flagged: false,
        cite: []
    },
    {
        _id: 2,
        title: "Paper 2",
        authors: _dummyAuthorsForDev,
        publishType: "Conference",
        addTime: new Date(),
        rating: 0,
        flagged: false,
        cite: []
    },
    {
        _id: 3,
        title: "Paper 3",
        authors: _dummyAuthorsForDev,
        publishType: "Workshop",
        addTime: new Date(),
        rating: 0,
        flagged: false,
        cite: []
    }
  
];

export const InitialPaperContext: PaperContextType = {
    filteredPapers: _dummyPapersForDev, // TODO: get from server
    selectedPapers: [],
    focusedPaper: null
};

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