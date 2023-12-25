
import { mergeClasses } from "@fluentui/react-components";
import { Exploer } from "./exploer";
import { BoardContextState } from "../../../contexts/boards/board-context-types";
import { useBoardState } from "../../../contexts/boards/board-context";




function SwitchBoards({ state }: { state: BoardContextState }) {
    console.log(state.currentBoard);
    switch (state.currentBoard) {
        case "exploer":
            return <Exploer />
        default:
            return null
    }

}

export default function Board({ className }: { className?: string }) {
    const state = useBoardState();
    console.log(state);
    if (!state.currentBoard) return null;
    return (
        <section className={mergeClasses(className, "flex flex-col px-2 py-3 my-2 rounded justify-between")}>
            <SwitchBoards state={state} />
        </section>
    );
}