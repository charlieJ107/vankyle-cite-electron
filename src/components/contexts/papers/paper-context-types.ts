import { Paper } from "../../../models/paper";

export interface PaperContextState {
    filteredPapers: Paper[];
    selectedPapers: Paper[];
    focusedPaper: Paper | null;
}

export interface PaperContextAction {
    type: "SELECT_PAPER" | "FOCUS_PAPER" | "UNSELECT_PAPER" | "UNFOCUS_PAPER";
    paper?: Paper;
    papers?: Paper[];
}


export interface PaperDispatchContextType {
    (action: PaperContextAction): void;
}