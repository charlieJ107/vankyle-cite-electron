import { BoardContextAction, BoardContextState } from "./board-context-types";

export function BoardContextReducer(state: BoardContextState, action: BoardContextAction) {
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