import { Paper } from "../../../models/paper";

export interface PaperContextState {
    filteredPapers: Paper[];
    selectedPapers: Paper[];
    focusedPaper: Paper | null;
    paging: {
        page: number;
        pageSize: number;
        total: number;
    };
}


export interface PaperContextAction {
    type: "LOAD_PAPERS"
    | "SELECT_PAPER"
    | "FOCUS_PAPER"
    | "UNSELECT_PAPER"
    | "UNFOCUS_PAPER";
    paper?: Paper;
    papers?: Paper[];
}


export interface PaperDispatchContextType {
    (action: PaperContextAction): void;
}