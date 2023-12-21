import { Paper } from "../../models/paper";
import { PaperContextAction, PaperContextType } from "./paper-context-types";

export function paperContextReducer(state: PaperContextType, actions: PaperContextAction) {
    switch (actions.type) {
        case "SELECT_PAPER":
            return {
                ...state,
                selectedPapers: [...state.selectedPapers, actions.paper!]
            };
        case "UNSELECT_PAPER":
            return {
                ...state,
                selectedPapers: state.selectedPapers.filter((paper: Paper) => paper !== actions.paper!)
            };
        case "FOCUS_PAPER":
            return {
                ...state,
                focusedPaper: actions.paper!
            };
        case "UNFOCUS_PAPER":
            return {
                ...state,
                focusedPaper: null
            };
        default:
            return state;
    }

}