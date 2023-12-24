
import { mergeClasses } from "@fluentui/react-components";
import { FilterBoard } from "./filter";
import { useBoardContext } from "./context/board-context";
import { BoardContextAction, BoardContextState } from "./context/board-context-types";
import { Dispatch } from "react";




function SwitchBoards({ state, dispatch }: { state: BoardContextState, dispatch: Dispatch<BoardContextAction> }) {

    switch (state.currentBoard) {
        case "filter":
            return <FilterBoard />
        default:
            return null
    }

}

export default function Board({ className }: { className?: string }) {
    const { state, dispatch } = useBoardContext();
    if (!state.currentBoard) return null;
    return (
        <section className={mergeClasses(className, "flex flex-col px-2 py-3 my-2 rounded justify-between")}>
            <SwitchBoards state={state} dispatch={dispatch} />
        </section>
    );
}