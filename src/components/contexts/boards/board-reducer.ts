import { BoardContextAction, BoardContextState } from "./board-context-types";

export function BoardContextReducer(state: BoardContextState, action: BoardContextAction) {
    console.log("BoardContextReducer", state, action);
    
    if (state.currentBoard === action.board) {
        return {
            ...state,
            currentBoard: null
        };
    } else {
        switch (action.board) {
            // TODO
            default:
                return {
                    ...state,
                    currentBoard: action.board,
                };
        }
    }
}