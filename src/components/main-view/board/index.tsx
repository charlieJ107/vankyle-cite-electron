
import { mergeClasses } from "@fluentui/react-components";
import { Exploer } from "./exploer";
import { BoardContextState } from "@components/contexts/boards/board-context-types";
import { useBoardState } from "@components/contexts/boards/board-context";


function SwitchBoards({ state }: { state: BoardContextState }) {
    switch (state.currentBoard) {
        case "exploer":
            return <Exploer />
        default:
            return null
    }

}

export default function Board({ className }: { className?: string }) {
    const state = useBoardState();
    if (!state.currentBoard) return null;
    return (
        <section className={mergeClasses(className, "flex flex-col px-2 py-3 my-2 rounded justify-between")}>
            <SwitchBoards state={state} />
        </section>
    );
}